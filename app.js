/* 古风小生文案变装器 —— 纯前端离线转换引擎
 * 玩法：把大白话文案转成"半文不白"的古风小生腔
 * 结构：词典替换(长词优先) → 人称替换 → 语气词 → 句级包装 → 开场收尾(重)
 */

/* ---------- 词典：现代词 → 古风候选（多个候选随机取） ---------- */
const DICT = [
  { m: "一整个大无语", g: ["竟无言以对，瞠目结舌", "哑口无言，唯余长叹"] },
  { m: "打工人打工魂", g: ["身为牛马，魂系工坊"] },
  { m: "一整个爱住", g: ["倾心相付，深爱不已", "情根深种，不可自拔"] },
  { m: "氛围感拉满", g: ["意境毕现，气韵十足"] },
  { m: "原地封神", g: ["立于此地，便成经典"] },
  { m: "狠狠拿捏", g: ["尽在掌握，游刃有余"] },
  { m: "狠狠爱住", g: ["倾心相付，深爱不已"] },
  { m: "笑死我了", g: ["笑得小生一命呜呼", "笑得小女子驾鹤西去"] },
  { m: "破防了", g: ["心防溃然，难以自持", "防线尽溃，戚戚然也"] },
  { m: "咱就是说", g: ["吾谓", "窃以为", "依小生之见"] },
  { m: "主打一个", g: ["唯重其一"] },
  { m: "天花板", g: ["登峰造极，无人能及", "翘楚之位，无人出其右"] },
  { m: "绝绝子", g: ["妙哉妙哉"] },
  { m: "无语子", g: ["哑然失笑"] },
  { m: "格局小了", g: ["器量浅矣", "格局促狭"] },
  { m: "格局打开", g: ["器量宏阔，胸有丘壑"] },
  { m: "Y Y D S", g: ["冠绝当世，千古无双"] },
  { m: "yyds", g: ["冠绝当世，千古无双", "真乃神人也"] },
  { m: "YYDS", g: ["冠绝当世，千古无双", "真乃神人也"] },
  { m: "真香", g: ["初辞之，后悦之，叹其佳", "口言不要，身甚诚实"] },
  { m: "吃瓜", g: ["坐观其争，闲论是非", "捧瓜静观"] },
  { m: "带节奏", g: ["煽风点火，妄引舆论"] },
  { m: "翻车", g: ["事败，颜面尽失", "马失前蹄"] },
  { m: "逆袭", g: ["绝境逢生，反败为胜"] },
  { m: "躺赢", g: ["不费余力，坐收其成"] },
  { m: "卷王", g: ["竞逐之魁，无人能及"] },
  { m: "佛系", g: ["凡事随缘，不萦于心"] },
  { m: "硬核", g: ["刚正不阿，实力卓然", "硬桥硬马"] },
  { m: "软萌", g: ["温婉娇憨，惹人怜爱"] },
  { m: "高冷", g: ["性孤高，寡言笑"] },
  { m: "话痨", g: ["喋喋不休，言无不尽"] },
  { m: "干饭人", g: ["饕餮之徒，嗜食如命"] },
  { m: "大冤种", g: ["愚钝之辈，屡遭欺罔", "天选倒霉人"] },
  { m: "显眼包", g: ["好出风头，哗众取宠"] },
  { m: "搭子", g: ["同好之友，相伴行事", "结伴之人"] },
  { m: "贴贴", g: ["亲昵相依，缱绻相伴"] },
  { m: "退退退", g: ["避之，远遁", "速退速退"] },
  { m: "摆烂到底", g: ["自弃至终，不复振作"] },
  { m: "摆烂", g: ["自弃，听之任之", "破罐破摔"] },
  { m: "摸鱼", g: ["偷闲，怠于事", "浑水摸鱼"] },
  { m: "内卷", g: ["竞相争逐，徒增烦扰"] },
  { m: "社恐", g: ["性喜静，畏交游"] },
  { m: "社牛", g: ["善言辞，乐交游"] },
  { m: "emo了", g: ["心有戚戚，黯然神伤", "郁郁寡欢"] },
  { m: "栓Q", g: ["谢之，铭感五内"] },
  { m: "绝了", g: ["妙哉", "妙绝", "妙不可言"] },
  { m: "躺平", g: ["安之若素，不思进取"] },
  { m: "卧槽", g: ["奇哉", "噫吁嚱"] },
  { m: "我去", g: ["呜呼", "噫"] },
  { m: "不是吧", g: ["安有此事", "岂有此理"] },
  { m: "服了", g: ["奈何奈何", "吾服之矣"] },
  { m: "胡说", g: ["妄言", "一派胡言"] },
  { m: "离谱", g: ["谬矣", "怪矣哉"] },
  { m: "大佬", g: ["真乃神人也", "前辈高人"] },
  { m: "牛人", g: ["神人也", "非常人也"] },
  { m: "过分", g: ["岂有此理"] },
  { m: "可惜了", g: ["惜哉"] },
  { m: "太猛了", g: ["何其壮哉"] },
  { m: "没法沟通", g: ["竖子不足与谋"] },
  { m: "太棒了", g: ["妙哉！绝妙之极"] },
  { m: "我服了你了", g: ["吾甘拜下风矣"] },
  { m: "你说得对", g: ["君言甚是", "诚哉斯言"] },
  { m: "太难了", g: ["此事甚难也", "难矣哉"] },
  { m: "太忙了", g: ["余事冗杂，无暇他顾"] },
  { m: "别说了", g: ["请勿复言", "慎言"] },
  { m: "太漂亮了", g: ["姿容甚美，令人心折"] },
  { m: "太好看了", g: ["甚美", "美不胜收"] },
  { m: "你开心就好", g: ["君悦即可，余无他求"] },
  { m: "很正常", g: ["此乃常事，不足怪也"] },
  { m: "完全不懂", g: ["吾全无所知，诚为愚钝"] },
  { m: "累死了", g: ["余疲甚矣，几欲仆地"] },
  { m: "随便你", g: ["君意如何，悉听尊便"] },
  { m: "太有才了", g: ["君之才情，世所罕见"] },
  { m: "吓死我了", g: ["惊魂未定，几欲夺魄"] },
  { m: "还可以", g: ["于吾观之，尚可也"] },
  { m: "太逗了", g: ["君之笑语，令人捧腹不已"] },
  { m: "笑死", g: ["笑煞我也", "笑得小生一命呜呼"] },
  { m: "睡觉了", g: ["歇息去也", "就寝去也"] },
  { m: "睡觉", g: ["就寝", "安歇"] },
  { m: "我不会", g: ["小女子不才", "小生不才，力有未逮"] },
  { m: "我来了", g: ["小生这厢有礼了", "小生来也"] },
  { m: "谢谢", g: ["感激不尽，铭感五内", "多谢多谢"] },
  { m: "对不起", g: ["姑娘莫要怪罪", "公子莫要怪罪", "小生知罪"] },
  { m: "再见", g: ["告辞", "后会有期"] },
  { m: "我爱你", g: ["吾心悦君", "愿与君白首"] },
  { m: "我想你", g: ["思君如满月"] },
  { m: "分手", g: ["一退了之，臣这一退便是一辈子"] },
  { m: "吃饭", g: ["用膳"] },
  { m: "喝水", g: ["饮水"] },
  { m: "好看", g: ["甚美"] },
  { m: "开心", g: ["甚悦"] },
  { m: "生气", g: ["愠怒"] },
  { m: "难过", g: ["黯然"] },
  { m: "厉害", g: ["了得"] },
  { m: "朋友", g: ["挚友"] },
  { m: "老婆", g: ["娘子"] },
  { m: "老公", g: ["相公"] },
  { m: "宝宝", g: ["卿卿"] },
  { m: "宝贝", g: ["心头好"] },
  { m: "真的假的", g: ["此言当真？"] },
  { m: "什么鬼", g: ["此为何物"] },
  { m: "无语", g: ["哑然"] },
  { m: "爽", g: ["快哉"] },
  { m: "好耶", g: ["善哉善哉"] },
  { m: "冲", g: ["速往"] },
  { m: "上头", g: ["情难自禁"] },
  { m: "下头", g: ["大失所望"] },
  { m: "辛苦了", g: ["劳君费心", "有劳了"] },
  { m: "没问题", g: ["无妨，包在小生身上"] },
  { m: "真的", g: ["诚然"] },
  { m: "完了", g: ["大事去矣"] },
  { m: "打工人", g: ["社畜之流", "为五斗米折腰者"] },
  { m: "努力", g: ["砥砺"] },
  { m: "下饭", g: ["佐膳"] },
  { m: "加油", g: ["勉力，奋楫前行", "善自珍重，砥砺前行", "勉之勉之"] },
  { m: "加油鸭", g: ["勉之勉之"] },
  { m: "冲鸭", g: ["勉之，速往"] },
  { m: "干饭", g: ["用膳"] },
  { m: "卷", g: ["竞逐"] },
  { m: "尴尬", g: ["窘迫", "面红耳赤"] },
  { m: "尴尬死了", g: ["窘迫至极，恨无地洞可钻"] },
];

/* ---------- 人称替换（中/重度开启，注意先做词典） ----------
 * 用单次组合正则扫描：我们/你们 必须先于 你，否则"我们"被拆成"你+们"；
 * 且替换产物（我等/吾等）不会再被"我"规则二次处理 */
const PRONOUN_RE = /(我们|你们|你|我)/g;
const PRONOUN_MAP = {
  "我们": ["吾等", "我等"],
  "你们": ["诸位", "尔等"],
  "你": ["君", "君", "姑娘", "公子"],
  "我": ["吾", "小生", "在下", "吾"],
};

/* ---------- 语气词（句尾，中/重度开启） ---------- */
const TONE_RULES = [
  { re: /吗([，。！？!?…\s]|$)/g, g: ["乎$1", "否$1"] },
  { re: /吧([，。！？!?…\s]|$)/g, g: ["罢$1", "可$1"] },
  { re: /啊([，。！？!?…\s]|$)/g, g: ["兮$1", "哉$1"] },
  { re: /呢([，。！？!?…\s]|$)/g, g: ["耶$1", "乎$1"] },
  { re: /了([，。！？!?…\s]|$)/g, g: ["矣$1", "也$1"] },
];

/* ---------- 句级包装（中/重度） ---------- */
const EXCLAMS = ["妙哉", "快哉", "善哉", "诚然", "甚矣", "悲夫", "惜哉", "然也", "妙极"];
const LEADERS = ["吾谓", "然则", "且夫", "窃以为", "盖", "诚如君言", "余观之"];

/* ---------- 文言起结（重度，纯文言，去刻意酸话） ---------- */
const WENYAN_OPEN = [
  "盖闻",
  "夫",
  "且夫",
  "原夫",
  "余观夫",
  "尝闻",
];
const WENYAN_CLOSE = [
  "遂书于此。",
  "小生谨识。",
  "聊记其事，以博一粲。",
  "是为之记。",
  "故书以志之。",
  "观者哂之。",
];

/* ---------- 工具函数 ---------- */
function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* 词典按词长降序，保证长词先匹配 */
const DICT_SORTED = DICT.slice().sort(function (a, b) { return b.m.length - a.m.length; });

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dictReplace(text) {
  let t = text;
  for (var i = 0; i < DICT_SORTED.length; i++) {
    var d = DICT_SORTED[i];
    var re = new RegExp(escapeReg(d.m), "g");
    t = t.replace(re, function () { return randPick(d.g); });
  }
  return t;
}

function pronounReplace(text) {
  return text.replace(PRONOUN_RE, function (m) {
    return randPick(PRONOUN_MAP[m]);
  });
}

function toneReplace(text) {
  var t = text;
  for (var i = 0; i < TONE_RULES.length; i++) {
    var r = TONE_RULES[i];
    t = t.replace(r.re, function (full, tail) { return randPick(r.g).replace("$1", tail); });
  }
  return t;
}

/* ---------- 地名古称（重度开启，据史地沿革） ----------
 * 注：深圳、香港古同属宝安县（东晋置，757年改东莞；深港同源）；
 * 两广古称岭南；其余取历代通行古称/别称。长词优先，避免"广州"被"广"误截。 */
const PLACES = [
  { m: "香港", g: ["宝安", "新安"] },
  { m: "深圳", g: ["宝安", "新安"] },
  { m: "广州", g: ["番禺", "羊城", "南海"] },
  { m: "东莞", g: ["东官", "莞城"] },
  { m: "广东", g: ["岭南", "岭表"] },
  { m: "广西", g: ["岭南", "桂海"] },
  { m: "两广", g: ["岭南"] },
  { m: "北京", g: ["燕京", "北平", "大都"] },
  { m: "南京", g: ["金陵", "建康", "石头城"] },
  { m: "西安", g: ["长安", "镐京", "西京"] },
  { m: "上海", g: ["申城", "沪上", "华亭"] },
  { m: "杭州", g: ["临安", "钱塘", "武林"] },
  { m: "苏州", g: ["姑苏", "吴中", "平江"] },
  { m: "成都", g: ["锦官城", "益州", "蓉城"] },
  { m: "武汉", g: ["江夏", "武昌", "鄂州"] },
  { m: "重庆", g: ["渝州", "巴郡", "山城"] },
  { m: "洛阳", g: ["洛邑", "神都", "东都"] },
  { m: "开封", g: ["汴梁", "大梁", "汴京"] },
  { m: "沈阳", g: ["盛京", "奉天"] },
  { m: "福州", g: ["榕城", "三山"] },
  { m: "厦门", g: ["鹭岛", "思明"] },
  { m: "长沙", g: ["潭州", "星沙"] },
  { m: "济南", g: ["泉城", "历下"] },
  { m: "青岛", g: ["胶澳", "琴岛"] },
  { m: "天津", g: ["津沽", "天津卫"] },
  { m: "宁波", g: ["明州", "鄞县"] },
  { m: "南昌", g: ["豫章", "洪都"] },
  { m: "合肥", g: ["庐州", "庐阳"] },
  { m: "太原", g: ["并州", "晋阳"] },
  { m: "昆明", g: ["滇池", "春城"] },
  { m: "贵阳", g: ["筑城", "贵竹"] },
  { m: "郑州", g: ["商都", "管城"] },
  { m: "桂林", g: ["桂州", "始安"] },
  { m: "南宁", g: ["邕城", "邕州"] },
  { m: "兰州", g: ["金城", "皋兰"] },
  { m: "海南", g: ["琼州", "琼崖"] },
  { m: "三亚", g: ["崖州", "珠崖"] },
  { m: "佛山", g: ["季华", "禅城"] },
  { m: "中山", g: ["香山", "铁城"] },
  { m: "惠州", g: ["祯州", "循州"] },
  { m: "潮州", g: ["凤城", "潮州"] },
];
const PLACES_SORTED = PLACES.slice().sort(function (a, b) { return b.m.length - a.m.length; });

function placeReplace(text) {
  var t = text;
  for (var i = 0; i < PLACES_SORTED.length; i++) {
    var p = PLACES_SORTED[i];
    var g = Array.isArray(p.g) ? p.g : [p.g];
    var re = new RegExp(escapeReg(p.m), "g");
    /* 排除已处于"古称"二字语境，避免来回换 */
    t = t.replace(re, function () { return randPick(g); });
  }
  return t;
}

/* ---------- 骨架文言化（重度开启，仅作用于重档，不碰轻/中档整词命中） ----------
 * 把"今天/想/看/说/玩"等白话骨架词也转文言，使重档更接近纯文言 */
const SKELETON = [
  { m: "今天", g: ["今日", "今"] },
  { m: "明天", g: ["明日", "翌日"] },
  { m: "昨天", g: ["昨日", "昨"] },
  { m: "现在", g: ["今", "现今"] },
  { m: "周末", g: ["休沐", "旬休"] },
  { m: "特别", g: ["尤", "特"] },
  { m: "非常", g: ["甚", "极"] },
  { m: "觉得", g: ["以为", "觉"] },
  { m: "知道", g: ["知", "晓得"] },
  { m: "看见", g: ["见", "睹"] },
  { m: "喜欢", g: ["喜", "好"] },
  { m: "讨厌", g: ["恶", "厌"] },
  { m: "告诉", g: ["告", "语"] },
  { m: "已经", g: ["已", "既"] },
  { m: "如果", g: ["若", "苟"] },
  { m: "因为", g: ["以", "因"] },
  { m: "所以", g: ["故", "是以"] },
  { m: "或者", g: ["或", "抑"] },
  { m: "但是", g: ["然", "然则"] },
  { m: "事情", g: ["事", "务"] },
  { m: "东西", g: ["物", "什物"] },
  { m: "地方", g: ["处", "地"] },
  { m: "时间", g: ["时", "辰"] },
  { m: "时候", g: ["时", "际"] },
  { m: "工作", g: ["事", "役"] },
  { m: "走", g: ["行"] },
  { m: "跑", g: ["奔"] },
  { m: "看", g: ["观", "视"] },
  { m: "说", g: ["曰", "言"] },
  { m: "玩", g: ["游", "嬉"] },
  { m: "买", g: ["购", "市"] },
  { m: "卖", g: ["售"] },
  { m: "吃", g: ["食", "啖"] },
  { m: "喝", g: ["饮"] },
  { m: "想", g: ["思", "欲"] },
  { m: "很", g: ["甚", "极"] },
  { m: "都", g: ["皆", "俱"] },
];
const SKELETON_SORTED = SKELETON.slice().sort(function (a, b) { return b.m.length - a.m.length; });

function skeletonReplace(text) {
  var t = text;
  for (var i = 0; i < SKELETON_SORTED.length; i++) {
    var d = SKELETON_SORTED[i];
    var re = new RegExp(escapeReg(d.m), "g");
    t = t.replace(re, function () { return randPick(d.g); });
  }
  return t;
}

/* 按句子切分（保留分隔符） */
function splitSentences(text) {
  return text.split(/(?<=[。！？!?…])/).filter(function (s) { return s.trim(); });
}

function sentencePack(text, level) {
  var sentences = splitSentences(text);
  if (sentences.length === 0) return text;
  var p = level >= 80 ? 1 : 0.35; /* 重度每句处理，中度约 1/3 */
  var leadP = level >= 80 ? 0 : p * 0.6; /* 重度不加句首连接词，避免与文言开场叠床架屋 */
  var out = sentences.map(function (s) {
    var t = s;
    if (Math.random() < p) {
      /* 句尾插感叹 */
      t = t.replace(/([。！？!?…])$/, randPick(EXCLAMS) + "$1");
    }
    if (Math.random() < leadP) {
      /* 句首加连接词 */
      t = randPick(LEADERS) + "，" + t;
    }
    return t;
  });
  return out.join("");
}

function openClose(text) {
  var t = text.trim();
  if (!t) return t;
  /* 结尾补感叹（若没有） */
  if (!/[。！？!?…]$/.test(t)) t += "。";
  return randPick(WENYAN_OPEN) + "，" + t + randPick(WENYAN_CLOSE);
}

/* ---------- 主转换入口 ---------- */
function convert(text, level) {
  var t = (text || "").trim();
  if (!t) return "";
  /* 1. 词典替换：所有档位都做（词库替换是打底，越酸越好） */
  t = dictReplace(t);
  /* 2. 人称/语气词：中、重度开启 */
  if (level >= 40) {
    t = pronounReplace(t);
    t = toneReplace(t);
  }
  /* 3. 句级包装 */
  if (level >= 40) {
    t = sentencePack(t, level);
  }
  /* 4. 骨架文言 + 地名古称 + 文言起结：重度开启 */
  if (level >= 80) {
    t = skeletonReplace(t);
    t = placeReplace(t);
    t = openClose(t);
  }
  /* 5. 全文言：全面重构，去除现代句式，纯文言表达 */
  if (level >= 150) {
    t = fullClassicalConvert(t);
  }
  return t;
}

/* 全文言转换：在「文·文言」基础上，做彻底的重构 */
function fullClassicalConvert(text) {
  var t = text;
  /* 5a. 彻底骨架替换：每个可能的词都替换（不再随机） */
  for (var i = 0; i < SKELETON_SORTED.length; i++) {
    var d = SKELETON_SORTED[i];
    var re = new RegExp(escapeReg(d.m), "g");
    t = t.replace(re, d.g[0]); // 取第一个选项，不做随机
  }
  /* 5b. 句首加文言发语词，句尾固定用文言终结 */
  t = t.replace(/^[^\s]*/, function (m) {
    return randPick(WENYAN_OPEN) + "，" + m;
  });
  if (!/[。！？!?…]$/.test(t)) t += randPick(WENYAN_CLOSE);
  /* 5c. 每句末尾强制加文言语气词（随机） */
  var sentences = t.split(/(?<=[。！？!?])/);
  if (sentences.length > 0) {
    t = sentences.map(function (s) {
      var trimmed = s.trim();
      if (!trimmed) return s;
      var lastChar = trimmed[trimmed.length - 1];
      if (/[。！？!?…]$/.test(lastChar)) {
        return trimmed.replace(/[。！？!?…]$/, randPick(EXCLAMS) + "$&");
      }
      return trimmed;
    }).join("");
  }
  /* 5d. 标点清理：尽量保留原文标点结构，但把感叹号统一成句号风格 */
  t = t.replace(/！/g, "。").replace(/！/g, "。");
  return t;
}

/* ---------- UI ---------- */
(function () {
  var inputText = document.getElementById("inputText");
  var outputBox = document.getElementById("outputBox");
  var goBtn = document.getElementById("goBtn");
  var againBtn = document.getElementById("againBtn");
  var copyBtn = document.getElementById("copyBtn");
  var imgBtn = document.getElementById("imgBtn");
  var imgCard = document.getElementById("imgCard");
  var shareCanvas = document.getElementById("shareCanvas");
  var saveTip = document.getElementById("saveTip");
  var levelSlider = document.getElementById("levelSlider");
  var levelTag = document.getElementById("levelTag");
  var toast = document.getElementById("toast");
  var copyHelper = document.getElementById("copyHelper");

  var lastInput = "";
  var lastLevel = 60;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function levelLabel(v) {
    if (v < 50) return { text: "浅·白话", cls: "lv-light" };
    if (v < 100) return { text: "中·半白", cls: "lv-mid" };
    if (v < 150) return { text: "文·文言", cls: "lv-heavy" };
    return { text: "全·全文言", cls: "lv-full" };
  }

  levelSlider.addEventListener("input", function () {
    var v = parseInt(levelSlider.value, 10);
    var l = levelLabel(v);
    levelTag.textContent = l.text;
    levelTag.className = "level-tag " + l.cls;
  });

  function runConvert() {
    lastInput = inputText.value;
    lastLevel = parseInt(levelSlider.value, 10);
    var out = convert(lastInput, lastLevel);
    if (!out) { showToast("先写点啥呀，小生才好动笔～"); return; }
    outputBox.textContent = out;
    outputBox.classList.add("show");
    imgCard.classList.remove("show");
  }

  goBtn.addEventListener("click", runConvert);

  againBtn.addEventListener("click", function () {
    if (!lastInput.trim()) { showToast("先变装一次再重转嘛"); return; }
    /* 随机种子自动变化 → 输出不同候选 */
    outputBox.textContent = convert(lastInput, lastLevel);
    outputBox.classList.add("show");
    imgCard.classList.remove("show");
    showToast("换了副酸牙口，再品品");
  });

  copyBtn.addEventListener("click", function () {
    var txt = outputBox.textContent;
    if (!txt) { showToast("还没有小生出品呢"); return; }
    copyHelper.value = txt;
    copyHelper.focus();
    copyHelper.select();
    showToast("文案已全选，长按即可复制");
  });

  /* ---------- 分享图 ---------- */
  var W = 750, H = 1280;

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var lines = [];
    var paragraph = String(text).split("\n");
    for (var pi = 0; pi < paragraph.length; pi++) {
      var line = "";
      var chars = paragraph[pi];
      for (var ci = 0; ci < chars.length; ci++) {
        var testLine = line + chars[ci];
        if (ctx.measureText(testLine).width > maxWidth && line) {
          lines.push(line);
          line = chars[ci];
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);
    }
    for (var li = 0; li < lines.length; li++) {
      ctx.fillText(lines[li], x, y + li * lineHeight);
    }
    return lines.length;
  }

  /* 标点转直排变体（竖排时置于右上） */
  function toVerticalPunct(text) {
    var map = { "\n": "", "，": "︐", "。": "︒", "！": "︕", "？": "︖", "；": "︔", "：": "︓", "、": "︑" };
    return String(text).split("").map(function (c) { return map[c] !== undefined ? map[c] : c; }).join("");
  }

  /* 竖排绘制：从右到左，每列从上往下逐字 */
  function drawVerticalText(ctx, text, startX, startY, colGap, lineH, maxBottom) {
    var chars = Array.from(text);
    var x = startX, y = startY;
    for (var i = 0; i < chars.length; i++) {
      if (x < 56) break; /* 超出左侧边界则停止，避免画出画布 */
      ctx.fillText(chars[i], x, y);
      y += lineH;
      if (y > maxBottom) { x -= colGap; y = startY; }
    }
    return x;
  }

  /* 黛蓝方印 */
  function drawSeal(ctx, x, y) {
    var s = 66;
    ctx.fillStyle = "#B23A30";
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = "#F5ECD7";
    ctx.font = "bold 26px 'Kaiti SC','KaiTi','STKaiti',serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("小生", x + s / 2, y + s / 2);
  }

  function drawReport() {
    var txt = outputBox.textContent;
    if (!txt) { showToast("先变装，再出图"); return; }
    var dpr = 2;
    shareCanvas.width = W * dpr;
    shareCanvas.height = H * dpr;
    shareCanvas.style.width = "100%";
    var ctx = shareCanvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    /* 宣纸底（米色，仿古信笺） */
    ctx.fillStyle = "#F5ECD7";
    ctx.fillRect(0, 0, W, H);

    /* 外框（黑色） */
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    /* 信笺竖向界栏（黑色细线，列间距与文字对齐同宽） */
    var colW = 92;
    var rightEdge = 660;
    var topLimit = 96;
    var botLimit = H - 96;
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 1.4;
    for (var gx = rightEdge; gx >= 90; gx -= colW) {
      ctx.beginPath();
      ctx.moveTo(gx, topLimit);
      ctx.lineTo(gx, botLimit);
      ctx.stroke();
    }

    /* 标题：最右列竖排（黑色），居两条竖线正中 */
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 46px 'Kaiti SC','KaiTi','STKaiti',serif";
    drawVerticalText(ctx, "古风小生手札", rightEdge - colW / 2, 112, 999, 58, botLimit - 12);

    /* 正文：右起第二列往后，竖排，逐列居中于两竖线之间（黑色） */
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "34px 'Kaiti SC','KaiTi','STKaiti',serif";
    var vert = toVerticalPunct(txt);
    drawVerticalText(ctx, vert, rightEdge - 1.5 * colW, 112, colW, 52, botLimit - 12);

    /* 印章：左下角（朱砂） */
    drawSeal(ctx, 96, H - 128);

    /* 页脚（横排，底部居中，黑） */
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "18px 'Kaiti SC','KaiTi','STKaiti',serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("古风小生文案变装器 · 纯前端离线玩梗", W / 2, H - 56);
  }

  imgBtn.addEventListener("click", function () {
    drawReport();
    imgCard.classList.add("show");
    /* 容器内走 JSBridge 存图，本地降级为长按提示 */
    var bridge = window.xhs && window.xhs.miniTool;
    if (bridge && typeof bridge.writeTempFile === "function") {
      var dataUrl = shareCanvas.toDataURL("image/png");
      bridge.writeTempFile(dataUrl).then(function (res) {
        if (res && res.filePath && typeof bridge.saveImageToPhotosAlbum === "function") {
          bridge.saveImageToPhotosAlbum(res.filePath).then(function () {
            saveTip.textContent = "已存入相册，去发小红书吧";
          }).catch(function () {
            saveTip.textContent = "保存失败，长按图片即可保存";
          });
        }
      }).catch(function () {
        saveTip.textContent = "长按图片即可保存";
      });
    } else {
      saveTip.textContent = "长按图片即可保存，发小红书配图刚刚好";
    }
  });

  /* 输入变化时收起旧分享图 */
  inputText.addEventListener("input", function () {
    imgCard.classList.remove("show");
  });
})();
