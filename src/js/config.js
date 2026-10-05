/**
 * 后端 API 地址配置。
 *
 * - 本地开发：后端默认运行在 http://localhost:5001（见后端 README）。
 * - 线上部署：请把 PROD_API_BASE 改成你在 Render 上创建的后端服务地址。
 *   如果后端服务命名为 eight32401225-calculator-backend，则无需修改。
 */
const DEV_API_BASE = "http://localhost:5001";
const PROD_API_BASE = "https://eight32401225-calculator-backend.onrender.com";

const isLocal =
  ["localhost", "127.0.0.1"].includes(location.hostname) ||
  location.protocol === "file:";

const API_BASE_URL = isLocal ? DEV_API_BASE : PROD_API_BASE;
