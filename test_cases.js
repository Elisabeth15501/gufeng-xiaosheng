/* 古风小生 · 批量测试：现代中文/网络用语 → 四档转换质量检查 */
const fs = require('fs');
let src = fs.readFileSync('app.js', 'utf-8');
src = src.split('/* ---------- UI ---------- */')[0];
eval(src);

const CASES = [
  { tag: '网络用语', text: '绝绝子！这家奶茶也太好喝了吧，姐妹们冲鸭' },
  { tag: '网络用语', text: '这个瓜也太大了吧，我先吃为敬，蹲一个后续' },
  { tag: '网络用语', text: '笑死我了，同事摸鱼居然被老板抓了个正着' },
  { tag: '网络用语', text: '栓Q，说好的周末双休，结果又让我加班' },
  { tag: '打工人', text: '今天又加班到十点，打工人真的太累了，想躺平' },
  { tag: '打工人', text: '周一早八人已经猝死了，咖啡续命中' },
  { tag: '日常', text: '周末和朋友去爬山，山顶风景绝了，拍了好多的照片' },
  { tag: '日常', text: '火锅配冰可乐，快乐就是这么简单' },
  { tag: '吐槽', text: '早高峰地铁人多到爆炸，社恐真的要窒息了' },
  { tag: '吐槽', text: '双十一购物车加满了，一看余额瞬间冷静了' },
  { tag: '情感', text: '和好朋友闹别扭了，心里难受，睡不着' },
  { tag: '情感', text: '异地恋三年，终于要见面了，好激动' },
  { tag: '学习', text: '期末周疯狂复习，图书馆占座太难了' },
  { tag: '旅行', text: '国庆去西安看兵马俑，人山人海但很震撼' },
  { tag: '夸赞', text: '新同事也太厉害了吧，方案一次过，大佬带带我' },
];

/* 检查规则 */
function check(out, level) {
  const issues = [];
  // 网络用语残留（浅档除外，浅档本来就只换流行语）
  const slang = ['绝绝子', '冲鸭', '栓Q', '躺平', '摸鱼居然', '社恐', '打工人', '早八', '猝死', '续命', '购物车', '双十一', '异地恋', '大佬带带我', '咖啡', '奶茶', '这么', '此么', '好多'];
  if (level >= 50) {
    for (const s of slang) {
      if (out.includes(s)) issues.push('残留网络用语「' + s + '」');
    }
  }
  // 叠词开场
  if (/^(盖闻|夫|且夫|原夫|余观夫|尝闻)，(盖闻|夫|且夫|原夫|余观夫|尝闻)，/.test(out)) issues.push('叠词开场');
  // 收尾破坏
  if (/乃为之记|乃书于此|乃为记/.test(out)) issues.push('收尾被语法破坏');
  // 程度词叠床架屋
  if (/(甚|极)(甚|极)/.test(out)) issues.push('程度词叠加');
  if (/(诚然|信然)(太|何其|甚|极)/.test(out)) issues.push('诚然+程度词叠加');
  // 语法误伤
  if (/即乃/.test(out)) issues.push('就是→即后再被是→乃误伤');
  return issues;
}

let totalIssues = 0;
for (const lv of [60, 120, 180]) {
  const lvName = lv === 60 ? '中·半白' : lv === 120 ? '文·文言' : '全·全文言';
  console.log('\n========== ' + lvName + ' ==========');
  for (const c of CASES) {
    // 跑3次取最多问题的结果（随机候选，压力测试）
    let worst = null, worstIssues = [];
    for (let i = 0; i < 3; i++) {
      const out = convert(c.text, lv);
      const iss = check(out, lv);
      if (!worst || iss.length > worstIssues.length) { worst = out; worstIssues = iss; }
    }
    const flag = worstIssues.length ? '⚠️ ' + worstIssues.join('；') : '✓';
    totalIssues += worstIssues.length;
    console.log('[' + c.tag + '] ' + flag);
    console.log('  IN : ' + c.text);
    console.log('  OUT: ' + worst);
  }
}
console.log('\n总问题数: ' + totalIssues);
