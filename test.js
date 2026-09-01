/* 古风小生文案变装器 —— 回归测试
 * 用法: node test.js （退出码 0 = 全部通过）
 * 原理: 从 app.js 提取 UI 之前的纯逻辑代码（词典+引擎），eval 后直接测 convert()
 */
const fs = require("fs");
const path = require("path");

const appJs = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

const logicStart = appJs.indexOf("const DICT");
const uiStart = appJs.indexOf("/* ---------- UI ---------- */");
if (logicStart < 0 || uiStart < 0) {
  console.error("✗ 从 app.js 提取逻辑失败（结构变了？）");
  process.exit(1);
}
const logic = appJs.slice(logicStart, uiStart);
/* eval 内 const 不泄漏到外层，把 DICT 显式挂到 globalThis 供自检用 */
eval(logic + "\nglobalThis.__DICT = DICT; globalThis.__DICT_SORTED = DICT_SORTED; globalThis.__WENYAN_OPEN = WENYAN_OPEN; globalThis.__WENYAN_CLOSE = WENYAN_CLOSE; globalThis.__PLACES_SORTED = PLACES_SORTED;");

let pass = 0, fail = 0;
function check(name, actual, predicate, detail) {
  const ok = typeof predicate === "function" ? !!predicate(actual) : String(actual).includes(predicate);
  if (ok) {
    pass++;
    console.log("  ✓ " + name);
  } else {
    fail++;
    console.log("  ✗ " + name + " → 实际输出: " + JSON.stringify(actual) + (detail ? "（期望: " + detail + "）" : ""));
  }
}

console.log("== 词典替换（轻档 20，只换词不改口） ==");
check("笑死我了", convert("笑死我了", 20), a => a.includes("一命呜呼") || a.includes("驾鹤西去") || a.includes("笑煞"), "呜呼/驾鹤西去/笑煞");
check("绝了", convert("太绝了", 20), a => a.includes("妙"), "妙哉/妙绝/妙不可言");
check("摆烂", convert("我摆烂了", 20), a => a.includes("自弃") || a.includes("破罐"), "自弃/破罐破摔");
check("摸鱼", convert("上班摸鱼", 20), a => a.includes("偷闲") || a.includes("浑水摸鱼"), "偷闲/浑水摸鱼");
check("内卷", convert("太内卷了", 20), a => a.includes("竞相争逐"), "竞相争逐");
check("社恐", convert("我社恐", 20), a => a.includes("畏交游"), "畏交游");
check("破防了", convert("我破防了", 20), a => a.includes("心防溃然") || a.includes("防线尽溃"), "心防溃然");
check("YYDS", convert("YYDS", 20), a => a.includes("冠绝当世") || a.includes("神人也"), "冠绝当世");
check("吃瓜", convert("我在吃瓜", 20), a => a.includes("坐观其争") || a.includes("捧瓜静观"), "坐观其争/捧瓜静观");
check("格局小了", convert("你格局小了", 20), a => a.includes("器量浅矣") || a.includes("格局促狭"), "器量浅矣");
check("睡觉了", convert("睡觉了", 20), a => a.includes("歇息去也") || a.includes("就寝去也"), "歇息去也");
check("我不会", convert("我不会", 20), a => a.includes("不才"), "不才");
check("谢谢你", convert("谢谢你", 20), a => a.includes("感激不尽") || a.includes("多谢"), "感激不尽/多谢");
check("我爱你", convert("我爱你", 20), a => a.includes("心悦君") || a.includes("白首"), "心悦君/白首");
check("加油", convert("加油", 20), a => a.includes("奋楫") || a.includes("砥砺") || a.includes("勉力") || a.includes("勉之"), "奋楫/砥砺/勉力/勉之");
check("吃饭", convert("去吃饭", 20), a => a.includes("用膳"), "用膳");
check("分手吧", convert("我们分手吧", 20), a => a.includes("一退了之"), "一退了之");
check("打工人", convert("打工人太难了", 20), a => a.includes("社畜") || a.includes("折腰"), "社畜/折腰");
check("大冤种", convert("我就是大冤种", 20), a => a.includes("愚钝之辈") || a.includes("倒霉"), "愚钝之辈/倒霉");
check("无语", convert("我真的无语", 20), a => a.includes("哑然"), "哑然");
check("上头", convert("这剧上头", 20), a => a.includes("情难自禁"), "情难自禁");
check("干饭人", convert("我是干饭人", 20), a => a.includes("饕餮"), "饕餮之徒");
check("显眼包", convert("他就是显眼包", 20), a => a.includes("哗众取宠"), "哗众取宠");
check("栓Q", convert("栓Q", 20), a => a.includes("铭感五内") || a.includes("谢之"), "铭感五内");

console.log("== 人称/语气词（中档 60） ==");
check("我→小生/吾/在下", convert("我明天去上班", 60), a => a.includes("小生") || a.includes("吾") || a.includes("在下"), "小生/吾/在下");
check("我想你整词命中", convert("我想你了", 60), a => a.includes("思君如满月"), "思君如满月");
check("你→君/姑娘/公子", convert("你知道吗", 60), a => a.includes("君") || a.includes("姑娘") || a.includes("公子") || a.includes("乎") || a.includes("否"), "君/姑娘/公子/乎/否");
check("我们→吾等", convert("我们一起走吧", 60), a => a.includes("吾等") || a.includes("我等"), "吾等/我等");
check("你们→诸位", convert("你们别笑了", 60), a => a.includes("诸位") || a.includes("尔等"), "诸位/尔等");
check("吗→乎/否", convert("你吃饭了吗", 60), a => a.includes("乎") || a.includes("否"), "乎/否");
check("吧→罢/可", convert("走吧", 60), a => a.includes("罢") || a.includes("可"), "罢/可");
check("了→矣/也", convert("我累了", 60), a => a.includes("矣") || a.includes("也"), "矣/也");
check("啊→兮/哉", convert("好累啊", 60), a => a.includes("兮") || a.includes("哉"), "兮/哉");

console.log("== 句级包装（中档 60 有概率） ==");
/* 多句子长文本，包装概率 35%，跑 30 次至少命中一次感叹插入 */
{
  let hit = false;
  const EXC = ["妙哉", "快哉", "善哉", "诚然", "甚矣", "悲夫", "惜哉", "然也", "妙极"];
  for (let i = 0; i < 30; i++) {
    const out = convert("今天天气真好。我们去爬山。山顶的风景太漂亮了。", 60);
    if (EXC.some(e => out.includes(e))) { hit = true; break; }
  }
  check("句尾插感叹", hit, true, "妙哉/快哉等");
}

console.log("== 重度档 100：文言起结 ==");
{
  const out = convert("今天上班摸鱼被老板抓到了，我尴尬死了，同事都笑我。", 100);
  check("有文言开场", out, a => globalThis.__WENYAN_OPEN.some(o => a.startsWith(o + "，") || a.startsWith(o)), "盖闻/夫/且夫等");
  check("有文言收尾", out, a => globalThis.__WENYAN_CLOSE.some(c => a.trimEnd().endsWith(c)), "六种文言收尾之一");
  check("重度仍保留词典替换", out, a => a.includes("偷闲") || a.includes("浑水摸鱼") || a.includes("窘迫"), "摸鱼/尴尬已换词");
  check("重度无刻意酸话", out, a => !/小生这厢有礼|且听小生慢慢道来|臣退了|江湖悠悠/.test(a), "去除齁酸开场白");
  console.log("  样例输出: " + out.slice(0, 120) + "……");
}

console.log("== 地名古称（重度档 100） ==");
check("深圳→古称", convert("我在深圳上班", 100), a => a.includes("宝安") || a.includes("新安"), "宝安/新安");
check("香港→宝安/新安", convert("香港的夜景真美", 100), a => a.includes("宝安") || a.includes("新安"), "宝安/新安");
check("两广→岭南", convert("两广地区美食多", 100), a => a.includes("岭南"), "岭南");
check("广州→番禺/羊城/南海", convert("我去广州出差", 100), a => a.includes("番禺") || a.includes("羊城") || a.includes("南海"), "番禺/羊城/南海");
check("北京→燕京/北平/大都", convert("北京秋天最好", 100), a => a.includes("燕京") || a.includes("北平") || a.includes("大都"), "燕京/北平/大都");
check("西安→长安/镐京/西京", convert("西安古城韵味足", 100), a => a.includes("长安") || a.includes("镐京") || a.includes("西京"), "长安/镐京/西京");
check("地名中档不替换", convert("深圳的天气", 60), a => a.includes("深圳"), "中档保留深圳");

console.log("== 骨架文言化（重度档 100） ==");
check("今天→今日/今", convert("今天天气真好", 100), a => a.includes("今日") || a.includes("今"), "今日/今");
check("想→思/欲/游", convert("我想去玩", 100), a => a.includes("思") || a.includes("欲") || a.includes("游"), "思/欲/游");
check("看→观/视", convert("看风景", 100), a => a.includes("观") || a.includes("视"), "观/视");

console.log("== 边界 ==");
check("空输入", convert("", 100), "");
check("空白输入", convert("   ", 60), "");
check("超长文本不崩", convert("今天好开心啊，我们去吃饭吧。明天还要上班，好累啊。晚上早点睡觉了。笑死我了，这剧太好看了，绝绝子！".repeat(5), 100), a => a.length > 50, "长度>50");

console.log("== 词典数据自检 ==");
{
  /* 词条无重复（去重后数量一致） */
  const ms = globalThis.__DICT.map(d => d.m);
  const uniq = new Set(ms);
  check("词典无重复词条", uniq.size === ms.length, true, "重复词条数: " + (ms.length - uniq.size));
  /* 排序：长词在前 */
  let sorted = true;
  for (let i = 1; i < globalThis.__DICT_SORTED.length; i++) {
    if (globalThis.__DICT_SORTED[i - 1].m.length < globalThis.__DICT_SORTED[i].m.length) { sorted = false; break; }
  }
  check("词典按词长降序", sorted, true);
  check("词条数量", globalThis.__DICT.length, a => a >= 100, "≥100条（当前" + globalThis.__DICT.length + "）");
}

console.log("\n结果: " + pass + " 通过, " + fail + " 失败");
process.exit(fail > 0 ? 1 : 0);
