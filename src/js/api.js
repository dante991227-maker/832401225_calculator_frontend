/**
 * 与后端 API 交互的封装层：统一处理 JSON、超时与错误提示。
 * 所有接口路径以 / 开头，实际请求会拼上 API_BASE_URL/api 前缀。
 */

const REQUEST_TIMEOUT_MS = 15000;

/**
 * 发送 HTTP 请求并解析 JSON。
 * @param {string} path - 以 / 开头的接口路径
 * @param {object} [options] - 传给 fetch 的配置
 * @returns {Promise<object>} 后端返回的 JSON
 * @throws {Error} 网络失败或后端报错时抛出，message 可直接展示给用户
 */
async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
  } catch (error) {
    // 网络错误 / 超时 / 后端未启动，统一给出友好提示
    throw new Error("无法连接后端服务，请确认后端已启动");
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    // 非 JSON 响应按空处理，走下方统一错误分支
  }

  if (!response.ok) {
    throw new Error(
      (body && body.message) || `请求失败（HTTP ${response.status}）`
    );
  }
  return body;
}

/** 发送表达式到后端计算（核心计算在后端完成）。 */
const apiCalculate = (expression) =>
  request("/calculate", {
    method: "POST",
    body: JSON.stringify({ expression }),
  });

/** 查询计算历史（来自后端数据库）。 */
const apiGetHistory = () => request("/history");

/** 删除一条历史记录。 */
const apiDeleteHistory = (id) => request(`/history/${id}`, { method: "DELETE" });

/** 清空全部历史记录（扩展功能）。 */
const apiClearHistory = () => request("/history", { method: "DELETE" });

/** 健康检查，用于前端连接状态提示。 */
const apiHealth = () => request("/health");
