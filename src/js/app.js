/**
 * Calculator interaction logic: keypad input, keyboard events, history
 * rendering and theme switching.
 *
 * Note: the frontend only assembles the expression and sends it to the
 * backend — it never computes results itself. History is always fetched
 * from the backend database, never cached locally.
 */

const displayExpression = document.getElementById("expression");
const displayResult = document.getElementById("result");
const historyList = document.getElementById("history-list");
const apiStatus = document.getElementById("api-status");
const apiStatusText = document.getElementById("api-status-text");
const themeToggle = document.getElementById("theme-toggle");

const OPERATORS = ["+", "-", "*", "/"];

const state = {
  expression: "", // current expression (internal form, using * and /)
  lastResult: null, // last computed result, used for "operator right after ="
  justEvaluated: false, // whether a calculation just finished
  evaluating: false, // whether waiting for the backend response
};

/* ------------------------- Display ------------------------- */

/** Render the internal * and / as × and ÷ for display. */
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

/* ------------------------- Calculation ------------------------- */

async function calculate() {
  if (state.evaluating || state.expression.trim() === "") return;
  state.evaluating = true;
  showResult("Calculating…");
  try {
    const data = await apiCalculate(state.expression);
    state.lastResult = String(data.result);
    showResult(`= ${data.result}`);
    state.justEvaluated = true;
    renderHistory(); // the new record is stored; refresh the history panel
  } catch (error) {
    showResult(error.message, true);
  } finally {
    state.evaluating = false;
  }
}

/* ------------------------- Input ------------------------- */

function insert(text) {
  if (state.justEvaluated) {
    // Right after "=": a digit starts a new expression,
    // an operator continues from the last result
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

/* ------------------------- History ------------------------- */

async function renderHistory() {
  historyList.replaceChildren();
  const loading = document.createElement("li");
  loading.className = "history-empty";
  loading.textContent = "Loading…";
  historyList.appendChild(loading);

  try {
    const data = await apiGetHistory();
    historyList.replaceChildren();
    if (data.history.length === 0) {
      const empty = document.createElement("li");
      empty.className = "history-empty";
      empty.textContent = "No history yet";
      historyList.appendChild(empty);
      return;
    }
    // The backend returns records newest first; render them in order
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
  main.title = "Click to reuse this expression";

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
  // Extension: click a history record to fill the expression back in
  main.addEventListener("click", () => {
    state.expression = record.expression;
    state.justEvaluated = false;
    showResult("");
    render();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn history-delete";
  deleteBtn.type = "button";
  deleteBtn.title = "Delete this record";
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", async () => {
    try {
      await apiDeleteHistory(record.id);
      renderHistory(); // re-fetch so the panel reflects the database
    } catch (error) {
      alert(error.message);
    }
  });

  item.append(main, deleteBtn);
  return item;
}

async function clearHistory() {
  if (!confirm("Are you sure you want to clear all history?")) return;
  try {
    await apiClearHistory();
    renderHistory();
  } catch (error) {
    alert(error.message);
  }
}

/* ------------------------- Backend connection status ------------------------- */

async function checkBackend() {
  try {
    await apiHealth();
    apiStatus.classList.add("online");
    apiStatus.classList.remove("offline");
    apiStatusText.textContent = "Backend connected";
  } catch (error) {
    apiStatus.classList.add("offline");
    apiStatus.classList.remove("online");
    apiStatusText.textContent = "Backend not connected";
  }
}

/* ------------------------- Theme switching (extension) ------------------------- */

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("calculator-theme", next); // only the theme preference is cached; history always comes from the backend
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem("calculator-theme");
  const theme =
    saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

/* ------------------------- Event binding and init ------------------------- */

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

  // Extension: keyboard shortcuts
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
