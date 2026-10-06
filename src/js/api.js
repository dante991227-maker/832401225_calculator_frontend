/**
 * Backend API wrapper: unified handling of JSON, timeouts and error messages.
 * All paths start with / and get the API_BASE_URL/api prefix prepended.
 */

const REQUEST_TIMEOUT_MS = 15000;

/**
 * Send an HTTP request and parse the JSON response.
 * @param {string} path - endpoint path starting with /
 * @param {object} [options] - options passed to fetch
 * @returns {Promise<object>} the JSON returned by the backend
 * @throws {Error} on network failure or backend error; the message is user-facing
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
    // Network error / timeout / backend not running — one friendly message
    throw new Error("Cannot connect to the backend service. Please make sure it is running.");
  } finally {
    clearTimeout(timer);
  }

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    // Non-JSON response: treat as empty and fall through to the error branch
  }

  if (!response.ok) {
    throw new Error(
      (body && body.message) || `Request failed (HTTP ${response.status})`
    );
  }
  return body;
}

/** Send the expression to the backend for evaluation (the core calculation happens there). */
const apiCalculate = (expression) =>
  request("/calculate", {
    method: "POST",
    body: JSON.stringify({ expression }),
  });

/** Fetch calculation history (from the backend database). */
const apiGetHistory = () => request("/history");

/** Delete one history record. */
const apiDeleteHistory = (id) => request(`/history/${id}`, { method: "DELETE" });

/** Clear all history records (extension feature). */
const apiClearHistory = () => request("/history", { method: "DELETE" });

/** Health check, used for the frontend connection indicator. */
const apiHealth = () => request("/health");
