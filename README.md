# 832401225 计算器系统 —— 前端

前后端分离计算器系统的前端（Web 应用），负责计算器界面展示、按键/键盘交互、把表达式发送给后端计算、展示后端返回的结果与错误信息、展示并管理历史记录。**前端不做任何核心计算**。

## 技术栈

- 原生 HTML5 + CSS3 + JavaScript（ES2020+），无任何构建工具与框架依赖
- 通过 `fetch` 调用后端 REST API（JSON）

## 目录结构

```
832401225_calculator_frontend/
├── index.html                 # 站点入口（GitHub Pages / 静态托管用，跳转到主页面）
├── src/
│   ├── calculator.html        # 计算器主页面
│   ├── css/
│   │   └── style.css          # 全部样式（CSS 变量实现明暗两套主题）
│   └── js/
│       ├── config.js          # 后端 API 地址配置
│       ├── api.js             # 后端 API 请求封装（超时、错误统一处理）
│       └── app.js             # 交互逻辑：按键、键盘、历史渲染、主题切换
├── README.md
└── codestyle.md               # 代码规范（基于 Airbnb JavaScript Style Guide）
```

## 运行环境

- 任意现代浏览器（Chrome / Edge / Safari / Firefox）
- 后端服务已启动（默认 `http://localhost:5001`，见后端仓库 README）

## 安装与启动

前端为纯静态页面，无需安装依赖。推荐用任意静态服务器启动（直接双击 `file://` 打开也能用，但部分浏览器对 `file://` 下的请求有限制，建议用 HTTP 服务）：

```bash
cd 832401225_calculator_frontend
python3 -m http.server 8080
```

然后访问 <http://localhost:8080/src/calculator.html>（或直接访问根路径 `http://localhost:8080`，会自动跳转）。

使用 VS Code 的话也可以安装 Live Server 插件后右键 `src/calculator.html` → Open with Live Server。

## 配置说明

后端 API 地址在 `src/js/config.js` 中配置：

```js
const DEV_API_BASE = "http://localhost:5001";   // 本地开发后端地址
const PROD_API_BASE = "https://832401225-calculator-backend.onrender.com"; // 线上后端地址

const API_BASE_URL = isLocal ? DEV_API_BASE : PROD_API_BASE;
```

- 本地打开（localhost / 127.0.0.1 / file://）时自动使用 `DEV_API_BASE`；
- 部署到线上时自动使用 `PROD_API_BASE`。如果你部署的后端服务名不是
  `832401225-calculator-backend`，请把 `PROD_API_BASE` 改成你的后端地址。

页面右上角有**后端连接状态指示灯**：绿色“后端已连接” / 红色“后端未连接”，可快速判断前后端是否联通。

## 功能列表

### 基础功能（对应作业要求）

- 四则运算：加 `+`、减 `−`、乘 `×`、除 `÷`（界面显示 × ÷，实际发送 `*` `/`）
- 复合表达式：运算符优先级、括号（含嵌套）、一元正负号、小数
- 错误提示：非法表达式、除零等后端返回的错误信息以红色显示
- 计算历史：从后端数据库读取并展示（表达式、结果、时间）
- 删除指定历史记录（调用后端 DELETE 接口后重新拉取）

### 扩展功能

1. **键盘快捷输入**：数字/运算符直接输入，`Enter` 求值、`Backspace` 删除、`Esc` 清空
2. **明暗主题切换**：右上角按钮切换，偏好保存在 localStorage（仅主题偏好，历史记录永远来自后端数据库）
3. **点击历史记录复用表达式**：点击某条历史把该表达式填回计算器
4. **一键清空全部历史**（配合后端 `DELETE /api/history`）
5. **后端连接状态指示**：基于 `/api/health` 实时显示前后端连通状态

## 前后端连接方式

1. 先启动后端服务（见后端仓库 README）；
2. 前端通过 `fetch` 请求后端 REST API：

| 前端行为 | 后端接口 |
| --- | --- |
| 点击 `=` | `POST /api/calculate`，请求体 `{ "expression": "..." }` |
| 打开页面/刷新/计算成功后 | `GET /api/history` |
| 点击某条历史的 × | `DELETE /api/history/{id}` |
| 点击“清空全部” | `DELETE /api/history` |
| 页面加载时 | `GET /api/health` 检测连接状态 |

3. 后端不可用时，界面仍可正常输入，但求值会提示“无法连接后端服务”，历史面板显示加载失败——这验证了核心计算完全依赖后端。

## 部署说明

支持 GitHub Pages 或 Render Static Site 两种免费方式，详细步骤见项目根目录的《部署指南》（部署指南.md）。部署后注意核对 `src/js/config.js` 中的线上后端地址。
