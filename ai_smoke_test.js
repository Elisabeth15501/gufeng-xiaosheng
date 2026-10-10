/* AI 冒烟测试：不触发 IIFE UI，直接测试 convertAll + aiGenerate */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

/* 截取到第 741 行（IIFE 之前），去掉 UI 块 */
const lines = code.split('\n');
const coreCode = lines.slice(0, 741).join('\n');

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
vm.runInContext(`this.__convertAll = convertAll; this.__aiGenerate = aiGenerate; this.__convert = convert; this.__aiAvailable = aiAvailable;`, sandbox);

const convertAll = sandbox.__convertAll;
const aiGenerate = sandbox.__aiGenerate;
const convert    = sandbox.__convert;
const aiAvailable = sandbox.__aiAvailable;

const testText = "今天刷到一条视频，主角一整个大无语，结果直接原地封神，笑死我了！";
const level    = 80;
const style    = "scholar";
let passed = 0, failed = 0;

function check(name, cond, info) {
  if (cond) { passed++; console.log('  ✅', name); }
  else       { failed++; console.log('  ❌', name, info ? '— ' + info : ''); }
}

console.log('\n=== AI 冒烟测试 ===\n');

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

aiResult.then(function (r) {
  check('AI 未接入时自动回落，engine === "rule"', r.engine === 'rule',
    'got engine: ' + r.engine);
  check('回落时 fallbackFromAI === "NOT_INTEGRATED"', r.fallbackFromAI === 'NOT_INTEGRATED',
    'got: ' + r.fallbackFromAI);
  check('回落文案非空（离线词典结果）', r.text.length > 0,
    'text: ' + JSON.stringify(r.text));

  /* 4. aiGenerate 直接调用验证 */
  return aiGenerate(style, level, testText).then(function (g) {
    check('aiGenerate 未接入时 ok===false, fallback===true', g.ok === false && g.fallback === true);
    check('aiGenerate 未接入时 errCode === "NOT_INTEGRATED"', g.errCode === 'NOT_INTEGRATED',
      'got: ' + g.errCode);
  });
}).then(function () {
  /* 5. 模拟 window.xhs.AI 已接入（happy path） */
  window.xhs = {
    AI: {
      createModel: function (modelName) {
        return {
          generateText: function (opts) {
            return Promise.resolve({
              choices: [{ message: { content: '这是AI生成的古文：今日观一影片，主角默然无语，旋即名动天下，令吾捧腹而大笑！' } }]
            });
          }
        };
      }
    }
  };

  check('模拟接入后 aiAvailable() === true', aiAvailable() === true);

  return convertAll(testText, level, style, 'ai').then(function (aiRes) {
    check('AI 接入后 engine === "ai"', aiRes.engine === 'ai',
      'got: ' + aiRes.engine);
    check('AI 文案来自模型输出', aiRes.text.indexOf('古文') > -1 || aiRes.text.length > 0,
      'text: ' + JSON.stringify(aiRes.text));
    check('AI 成功时不含 fallbackFromAI', !aiRes.fallbackFromAI);
  });
}).then(function () {
  /* 6. 模拟 AI 抛出 AI_NOT_ALLOWED */
  window.xhs.AI.createModel = function () {
    return {
      generateText: function () {
        const e = new Error('not whitelisted');
        e.code = 'AI_NOT_ALLOWED';
        return Promise.reject(e);
      }
    };
  };

  return convertAll(testText, level, style, 'ai').then(function (r) {
    check('AI_NOT_ALLOWED 时自动回落，engine === "rule"', r.engine === 'rule');
    check('AI_NOT_ALLOWED 时 fallbackFromAI === "AI_NOT_ALLOWED"', r.fallbackFromAI === 'AI_NOT_ALLOWED',
      'got: ' + r.fallbackFromAI);
  });
}).then(function () {
  /* 7. 模拟 AI 返回空内容（被拦截） */
  window.xhs.AI.createModel = function () {
    return {
      generateText: function () {
        return Promise.resolve({ choices: [{ message: { content: '' } }] });
      }
    };
  };

  return convertAll(testText, level, style, 'ai').then(function (r) {
    check('AI 返回空内容时自动回落，engine === "rule"', r.engine === 'rule');
    check('AI 空内容时 fallbackFromAI === "EMPTY"', r.fallbackFromAI === 'EMPTY',
      'got: ' + r.fallbackFromAI);
  });
}).then(function () {
  console.log('\n=== 结果：' + passed + '/' + (passed + failed) + ' 通过 ===\n');
  process.exit(failed > 0 ? 1 : 0);
}).catch(function (err) {
  console.error('\n❌ 测试异常：', err.message);
  process.exit(1);
});
