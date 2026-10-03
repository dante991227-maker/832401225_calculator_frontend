/**
 * 计算器交互逻辑：按键输入、键盘事件、历史记录渲染、主题切换。
 *
 * 注意：前端只负责拼接表达式并发送给后端，绝不自行计算结果；
 * 历史记录每次都从后端数据库拉取，不使用本地缓存。
 */

const displayExpression = document.getElementById("expression");
const displayResult = document.getElementById("result");
const historyList = document.getElementById("history-list");
const apiStatus = document.getElementById("api-status");
const apiStatusText = document.getElementById("api-status-text");
const themeToggle = document.getElementById("theme-toggle");

const OPERATORS = ["+", "-", "*", "/"];

const state = {
  expression: "", // 当前输入的表达式（内部形式，使用 * 和 /）
  lastResult: null, // 上一次计算结果，用于“= 之后继续输入运算符”
  justEvaluated: false, // 是否刚完成一次计算
  evaluating: false, // 是否正在等待后端响应
};

/* ------------------------- 显示 ------------------------- */

/** 把内部表达式的 * / 显示为 × ÷。 */
function pretty(expression) {
  return expression.replace(/\*/g, "×").replace(/\//g, "÷");
}

function render() {
  displayExpression.textContent =
    state.expression === "" ? "0" : pretty(state.expression);
}

function showResult(text, isError = false) {
  displayResult.textContent = text;
  displayResult.classList.toggle("error", isError);
}

/* ------------------------- 计算 ------------------------- */

async function calculate() {
  if (state.evaluating || state.expression.trim() === "") return;
  state.evaluating = true;
  showResult("计算中…");
  try {
    const data = await apiCalculate(state.expression);
    state.lastResult = String(data.result);
    showResult(`= ${data.result}`);
    state.justEvaluated = true;
    renderHistory(); // 新记录已入库，刷新历史面板
  } catch (error) {
    showResult(error.message, true);
  } finally {
    state.evaluating = false;
  }
}

/* ------------------------- 输入 ------------------------- */

function insert(text) {
  if (state.justEvaluated) {
    // 刚算完：输入数字则开启新表达式，输入运算符则基于上次结果继续算
    const startsWithOperator = OPERATORS.includes(text);
    state.expression =
      startsWithOperator && state.lastResult !== null ? state.lastResult : "";
    state.justEvaluated = false;
    showResult("");
  }
  state.expression += text;
  render();
}

function backspace() {
  if (state.justEvaluated) {
    clearAll();
    return;
  }
  state.expression = state.expression.slice(0, -1);
  render();
}

function clearAll() {
  state.expression = "";
  state.justEvaluated = false;
  showResult("");
  render();
}

/* ------------------------- 历史记录 ------------------------- */

async function renderHistory() {
  historyList.replaceChildren();
  const loading = document.createElement("li");
  loading.className = "history-empty";
  loading.textContent = "加载中…";
  historyList.appendChild(loading);

  try {
    const data = await apiGetHistory();
    historyList.replaceChildren();
    if (data.history.length === 0) {
      const empty = document.createElement("li");
      empty.className = "history-empty";
      empty.textContent = "暂无历史记录";
      historyList.appendChild(empty);
      return;
    }
    // 后端已按时间倒序返回，直接逐条渲染
    for (const record of data.history) {
      historyList.appendChild(buildHistoryItem(record));
    }
  } catch (error) {
    historyList.replaceChildren();
    const failed = document.createElement("li");
    failed.className = "history-empty";
    failed.textContent = error.message;
    historyList.appendChild(failed);
  }
}

function buildHistoryItem(record) {
  const item = document.createElement("li");
  item.className = "history-item";

  const main = document.createElement("div");
  main.className = "history-main";
  main.title = "点击复用该表达式";

  const expr = document.createElement("div");
  expr.className = "history-expression";
  expr.textContent = pretty(record.expression);

  const result = document.createElement("div");
  result.className = "history-result";
  result.textContent = `= ${record.result}`;

  const meta = document.createElement("div");
  meta.className = "history-meta";
  meta.textContent = record.created_at;

  main.append(expr, result, meta);
  // 扩展功能：点击历史记录把表达式填回计算器
  main.addEventListener("click", () => {
    state.expression = record.expression;
    state.justEvaluated = false;
    showResult("");
    render();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn history-delete";
  deleteBtn.type = "button";
  deleteBtn.title = "删除该记录";
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", async () => {
    try {
      await apiDeleteHistory(record.id);
      renderHistory(); // 删除后按后端数据库最新状态重新拉取
    } catch (error) {
      alert(error.message);
    }
  });

  item.append(main, deleteBtn);
  return item;
}

async function clearHistory() {
  if (!confirm("确定要清空全部历史记录吗？")) return;
  try {
    await apiClearHistory();
    renderHistory();
  } catch (error) {
    alert(error.message);
  }
}

/* ------------------------- 后端连接状态 ------------------------- */

async function checkBackend() {
  try {
    await apiHealth();
    apiStatus.classList.add("online");
    apiStatus.classList.remove("offline");
    apiStatusText.textContent = "后端已连接";
  } catch (error) {
    apiStatus.classList.add("offline");
    apiStatus.classList.remove("online");
    apiStatusText.textContent = "后端未连接";
  }
}

/* ------------------------- 主题切换（扩展功能） ------------------------- */

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("calculator-theme", next); // 只缓存主题偏好，历史记录永远来自后端
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem("calculator-theme");
  const theme =
    saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

/* ------------------------- 事件绑定与初始化 ------------------------- */

function bindEvents() {
  document.getElementById("keypad").addEventListener("click", (event) => {
    const button = event.target.closest("button.key");
    if (!button) return;
    if (button.dataset.insert !== undefined) {
      insert(button.dataset.insert);
    } else if (button.dataset.action === "equals") {
      calculate();
    } else if (button.dataset.action === "clear") {
      clearAll();
    } else if (button.dataset.action === "backspace") {
      backspace();
    }
  });

  // 扩展功能：键盘快捷输入
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if ((key.length === 1 && /[0-9]/.test(key)) || (key.length === 1 && "+-*/().".includes(key))) {
      insert(key);
      event.preventDefault();
    } else if (key === "Enter" || key === "=") {
      calculate();
      event.preventDefault();
    } else if (key === "Backspace") {
      backspace();
      event.preventDefault();
    } else if (key === "Escape") {
      clearAll();
      event.preventDefault();
    }
  });

  document.getElementById("clear-history").addEventListener("click", clearHistory);
  themeToggle.addEventListener("click", toggleTheme);
}

initTheme();
bindEvents();
render();
renderHistory();
checkBackend();
