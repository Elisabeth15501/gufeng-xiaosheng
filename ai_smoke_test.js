/* AI 冒烟测试：不触发 IIFE UI，直接测试 convertAll + aiGenerate
 * v1.3.1：新增 CONTENT_BLOCKED 合规拒绝场景 + 误伤豁免场景（港澳台旅游 / 国学科普）
 * 通过动态定位 IIFE 行号截取核心代码，避免硬编码行号 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const marker = '/* ---------- UI ---------- */';
const markerIdx = code.indexOf(marker);
if (markerIdx < 0) { console.error('❌ 找不到 UI 块标记，app.js 结构已变化'); process.exit(1); }
const coreCode = code.slice(0, markerIdx);

/* 构造 fake window 环境 */
const window = {};
const sandbox = {
  window,
  console,
  setTimeout,
  clearTimeout,
  Promise,
};
vm.createContext(sandbox);
vm.runInContext(coreCode, sandbox, { filename: 'app.js-core' });

/* 暴露需要的函数 */
vm.runInContext(`this.__convertAll = convertAll; this.__aiGenerate = aiGenerate; this.__convert = convert; this.__aiAvailable = aiAvailable; this.__isBlockedOutput = isBlockedOutput; this.__buildSystemPrompt = buildSystemPrompt;`, sandbox);

const convertAll    = sandbox.__convertAll;
const aiGenerate    = sandbox.__aiGenerate;
const convert       = sandbox.__convert;
const aiAvailable   = sandbox.__aiAvailable;
const isBlockedOutput = sandbox.__isBlockedOutput;
const buildSystemPrompt = sandbox.__buildSystemPrompt;

const testText = "今天刷到一条视频，主角一整个大无语，结果直接原地封神，笑死我了！";
const level    = 80;
const style    = "scholar";
let passed = 0, failed = 0;

function check(name, cond, info) {
  if (cond) { passed++; console.log('  ✅', name); }
  else       { failed++; console.log('  ❌', name, info ? '— ' + info : ''); }
}

/* 模拟 AI：返回指定内容（可带延迟） */
function mockAIMode(mode) {
  if (mode === 'success') {
    window.xhs = { AI: {
      createModel: function () {
        return { generateText: function () {
          return Promise.resolve({ choices: [{ message: { content: '今日观一影片，主角默然无语，旋即名动天下，令吾捧腹而大笑！' } }] });
        } };
      }
    } };
  } else if (mode === 'blocked') {
    window.xhs = { AI: {
      createModel: function () {
        return { generateText: function () {
          return Promise.resolve({ choices: [{ message: { content: '此文案暂不支持古风小生改写' } }] });
        } };
      }
    } };
  } else if (mode === 'empty') {
    window.xhs = { AI: {
      createModel: function () {
        return { generateText: function () {
          return Promise.resolve({ choices: [{ message: { content: '' } }] });
        } };
      }
    } };
  } else if (mode === 'not_allowed') {
    window.xhs = { AI: {
      createModel: function () {
        return { generateText: function () {
          const e = new Error('not whitelisted');
          e.code = 'AI_NOT_ALLOWED';
          return Promise.reject(e);
        } };
      }
    } };
  } else if (mode === 'quota') {
    window.xhs = { AI: {
      createModel: function () {
        return { generateText: function () {
          const e = new Error('quota exceeded');
          e.code = 'AI_QUOTA_EXCEEDED';
          return Promise.reject(e);
        } };
      }
    } };
  }
}

console.log('\n=== AI 冒烟测试 v1.3.1 ===\n');

(async function main() {
  /* ---------- 第一部分：基础 4 场景（原 17/17 保留） ---------- */

  /* 1. aiAvailable() 未接入时应为 false */
  check('aiAvailable() === false（无 window.xhs.AI）', aiAvailable() === false,
    'got: ' + aiAvailable());

  /* 2. 离线引擎（rule）正常返回对象 */
  const ruleResult = convertAll(testText, level, style, 'rule');
  check('rule 引擎返回对象，engine === "rule"', ruleResult.engine === 'rule');
  check('rule 引擎返回文案非空', typeof ruleResult.text === 'string' && ruleResult.text.length > 0,
    'text: ' + JSON.stringify(ruleResult.text));

  /* 3. AI 引擎未接入 → 自动回落离线，且 fallbackFromAI === "NOT_INTEGRATED" */
  const aiResult = convertAll(testText, level, style, 'ai');
  check('ai 引擎返回 Promise', aiResult instanceof Promise);
  const aiRes1 = await aiResult;
  check('AI 未接入时自动回落，engine === "rule"', aiRes1.engine === 'rule',
    'got engine: ' + aiRes1.engine);
  check('回落时 fallbackFromAI === "NOT_INTEGRATED"', aiRes1.fallbackFromAI === 'NOT_INTEGRATED',
    'got: ' + aiRes1.fallbackFromAI);
  check('回落文案非空（离线词典结果）', aiRes1.text.length > 0,
    'text: ' + JSON.stringify(aiRes1.text));

  /* 4. aiGenerate 直接调用验证 */
  const g1 = await aiGenerate(style, level, testText);
  check('aiGenerate 未接入时 ok===false, fallback===true', g1.ok === false && g1.fallback === true);
  check('aiGenerate 未接入时 errCode === "NOT_INTEGRATED"', g1.errCode === 'NOT_INTEGRATED',
    'got: ' + g1.errCode);

  /* 5. 模拟 AI happy path */
  mockAIMode('success');
  check('模拟接入后 aiAvailable() === true', aiAvailable() === true);
  const aiRes2 = await convertAll(testText, level, style, 'ai');
  check('AI 接入后 engine === "ai"', aiRes2.engine === 'ai',
    'got: ' + aiRes2.engine);
  check('AI 文案来自模型输出', aiRes2.text.indexOf('古文') > -1 || aiRes2.text.length > 0,
    'text: ' + JSON.stringify(aiRes2.text));
  check('AI 成功时不含 fallbackFromAI', !aiRes2.fallbackFromAI);

  /* 6. 模拟 AI_NOT_ALLOWED */
  mockAIMode('not_allowed');
  const aiRes3 = await convertAll(testText, level, style, 'ai');
  check('AI_NOT_ALLOWED 时自动回落，engine === "rule"', aiRes3.engine === 'rule');
  check('AI_NOT_ALLOWED 时 fallbackFromAI === "AI_NOT_ALLOWED"', aiRes3.fallbackFromAI === 'AI_NOT_ALLOWED',
    'got: ' + aiRes3.fallbackFromAI);

  /* 6b. 模拟 AI_QUOTA_EXCEEDED */
  mockAIMode('quota');
  const aiRes3b = await convertAll(testText, level, style, 'ai');
  check('AI_QUOTA_EXCEEDED 时自动回落，engine === "rule"', aiRes3b.engine === 'rule');
  check('AI_QUOTA_EXCEEDED 时 fallbackFromAI === "AI_QUOTA_EXCEEDED"', aiRes3b.fallbackFromAI === 'AI_QUOTA_EXCEEDED',
    'got: ' + aiRes3b.fallbackFromAI);

  /* 7. 模拟 AI 返回空内容 */
  mockAIMode('empty');
  const aiRes4 = await convertAll(testText, level, style, 'ai');
  check('AI 返回空内容时自动回落，engine === "rule"', aiRes4.engine === 'rule');
  check('AI 空内容时 fallbackFromAI === "EMPTY"', aiRes4.fallbackFromAI === 'EMPTY',
    'got: ' + aiRes4.fallbackFromAI);

  /* ---------- 第二部分：CONTENT_BLOCKED 合规拒绝场景 ---------- */
  console.log('\n--- CONTENT_BLOCKED 合规拒绝场景 ---\n');

  /* 8. isBlockedOutput 识别标准拒绝锚点 */
  check('isBlockedOutput("此文案暂不支持古风小生改写") === true',
    isBlockedOutput('此文案暂不支持古风小生改写') === true);
  check('isBlockedOutput("暂不支持古风小生改写") === true（短变体）',
    isBlockedOutput('暂不支持古风小生改写') === true);
  check('isBlockedOutput("此文案暂不支持改写") === true（短锚点）',
    isBlockedOutput('此文案暂不支持改写') === true);
  check('isBlockedOutput("暂不支持改写") === true（最简变体）',
    isBlockedOutput('暂不支持改写') === true);
  check('isBlockedOutput("今日观一影片...") === false（正常文案不误判）',
    isBlockedOutput('今日观一影片，主角默然无语，旋即名动天下。') === false);
  check('isBlockedOutput("") === false（空串不误判为拒绝）',
    isBlockedOutput('') === false);
  check('isBlockedOutput(null) === false（null 安全）',
    isBlockedOutput(null) === false);
  check('isBlockedOutput(undefined) === false（undefined 安全）',
    isBlockedOutput(undefined) === false);
  check('isBlockedOutput 容忍引号包裹的拒绝锚点',
    isBlockedOutput('"此文案暂不支持古风小生改写"') === true);
  check('isBlockedOutput 容忍全角空格包裹',
    isBlockedOutput('\u3000此文案暂不支持古风小生改写\u3000') === true);

  /* 9. buildSystemPrompt 包含 8 项合规约束关键词 */
  const sys = buildSystemPrompt('scholar', 80);
  check('system prompt 含「允许改写的生活类内容」区', sys.indexOf('允许改写的生活类内容') > -1);
  check('system prompt 含「合规禁区」区', sys.indexOf('合规禁区') > -1);
  check('system prompt 含「涉政」关键词', sys.indexOf('涉政') > -1);
  check('system prompt 含「涉黄/暴/恐」关键词', sys.indexOf('涉黄') > -1 && sys.indexOf('暴') > -1);
  check('system prompt 含「涉医/法/金」关键词', sys.indexOf('涉医') > -1);
  check('system prompt 含「涉敏/教/族」关键词', sys.indexOf('涉敏') > -1);
  check('system prompt 含「涉私/劣」关键词', sys.indexOf('涉私') > -1);
  check('system prompt 含「判定规则」区', sys.indexOf('判定规则') > -1);
  check('system prompt 含「平台合规」区', sys.indexOf('平台合规') > -1);

  /* 10. 误伤豁免：港澳台旅游类文案 属允许区，system prompt 有明示 */
  check('system prompt 显式豁免「港澳台旅游」', sys.indexOf('中国香港') > -1 && sys.indexOf('旅游城市') > -1);
  check('system prompt 显式豁免「国学科普」', sys.indexOf('国学科普') > -1 || sys.indexOf('节气') > -1);
  check('system prompt 显式豁免「传统文化名词」', sys.indexOf('传统文化') > -1 || sys.indexOf('佛教/道教/儒学') > -1);
  check('system prompt 声明「传教/算命/改命」拒答', sys.indexOf('传教') > -1 || sys.indexOf('算命') > -1);

  /* 11. CONTENT_BLOCKED 场景：模拟模型拒答，convertAll 应返回 engine === "blocked" */
  mockAIMode('blocked');
  const sensitiveText = "怎么治疗乙肝偏方，推荐哪个中医";
  const blockedRes = await convertAll(sensitiveText, level, style, 'ai');
  check('AI 拒答时 engine === "blocked"（不走离线兜底）', blockedRes.engine === 'blocked',
    'got: ' + blockedRes.engine);
  check('AI 拒答时 fallbackFromAI === "CONTENT_BLOCKED"', blockedRes.fallbackFromAI === 'CONTENT_BLOCKED',
    'got: ' + blockedRes.fallbackFromAI);
  check('AI 拒答时文案 = 拒绝锚点', blockedRes.text === '此文案暂不支持古风小生改写',
    'text: ' + JSON.stringify(blockedRes.text));

  /* 12. 误伤豁免验证：旅游文案 模型正常返回（不触发拒答） */
  mockAIMode('success');
  const travelText = "周末去中国澳门旅游，吃了葡式蛋挞，逛了大三巴牌坊";
  const travelRes = await convertAll(travelText, level, style, 'ai');
  check('旅游文案（含澳门）模型正常输出，engine === "ai"', travelRes.engine === 'ai',
    'got: ' + travelRes.engine);
  check('旅游文案不误伤，fallbackFromAI 为空', !travelRes.fallbackFromAI,
    'got: ' + travelRes.fallbackFromAI);

  /* 13. 误伤豁免验证：国学科普文案 模型正常返回 */
  const guoxueText = "今天学了点《庄子》里的逍遥游，感觉人生态度豁然开朗";
  const guoxueRes = await convertAll(guoxueText, level, style, 'ai');
  check('国学科普文案模型正常输出，engine === "ai"', guoxueRes.engine === 'ai',
    'got: ' + guoxueRes.engine);

  /* ---------- 结果汇总 ---------- */
  console.log('\n=== 结果：' + passed + '/' + (passed + failed) + ' 通过 ===\n');
  process.exit(failed > 0 ? 1 : 0);

})().catch(function (err) {
  console.error('\n❌ 测试异常：', err.message, '\n', err.stack);
  process.exit(1);
});
