/**
 * Backend API base URL configuration.
 *
 * - Local development: the backend runs at http://localhost:5001 (see the backend README).
 * - Production: set PROD_API_BASE to your own Render service URL.
 *   If the service is named eight32401225-calculator-backend, no change is needed.
 */
const DEV_API_BASE = "http://localhost:5001";
const PROD_API_BASE = "https://eight32401225-calculator-backend.onrender.com";

const isLocal =
  ["localhost", "127.0.0.1"].includes(location.hostname) ||
  location.protocol === "file:";

const API_BASE_URL = isLocal ? DEV_API_BASE : PROD_API_BASE;
