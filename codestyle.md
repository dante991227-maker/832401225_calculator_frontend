# 前端代码规范（HTML / CSS / JavaScript）

> 本规范来源：**[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)**（JavaScript 部分），
> 并参考 [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)。
> 本项目前端全部代码遵循以下规则。

## 1. HTML

- 文件编码 UTF-8，页面声明 `<html lang="zh-CN">`；
- 属性值使用双引号；布尔属性省略值（如 `defer`）；
- 标签语义化：`main` / `section` / `aside` / `header` / `footer`；
- 可交互元素必须是 `<button type="button">`，并设置 `title` 或 `aria-label` 说明用途；
- 静态资源用相对路径引用，保证可部署到任意子路径（如 GitHub Pages）。

## 2. CSS

- 缩进 2 空格；每条声明独占一行；
- 类名使用 **kebab-case**（如 `history-item`、`calc-header`）；
- 颜色、圆角、阴影等设计值统一收敛到 `:root` 的 **CSS 自定义属性**，暗色主题通过
  `html[data-theme="dark"]` 覆盖变量实现，禁止在组件里写死重复色值；
- 不使用 `!important`；优先用类选择器，避免依赖元素层级过深的选择器；
- 小屏幕使用媒体查询响应式布局（`@media (max-width: 760px)`）。

## 3. JavaScript

### 基本格式

- 缩进 2 空格；语句结尾**必须加分号**；
- 字符串统一使用双引号（模板字符串除外）；
- 声明一律使用 `const`，仅在需要重新赋值时使用 `let`，禁止 `var`；
- 相等比较一律使用 `===` / `!==`，禁止 `==` / `!=`；
- 每行不超过 100 字符。

### 命名

| 对象 | 风格 | 示例 |
| --- | --- | --- |
| 变量/函数 | 小驼峰 | `renderHistory()`、`lastResult` |
| 常量 | 全大写下划线 | `API_BASE_URL`、`REQUEST_TIMEOUT_MS` |
| DOM 引用缓存 | 小驼峰名词 | `displayExpression` |
| 布尔变量 | is/has 前缀 | `justEvaluated`、`keyboardWorked` |

### 结构与函数

- 一个函数只做一件事，长度尽量不超过 40 行；
- 函数写 **JSDoc 注释**说明参数、返回值与抛出的异常；
- 模块划分：`config.js`（配置）、`api.js`（网络层）、`app.js`（交互层），配置与网络请求不允许散落在 UI 代码里；
- 事件处理优先使用**事件委托**（如整个键盘区只绑一个 click 监听）。

### 安全约定

- 任何后端返回的数据（表达式、错误信息等）插入页面时必须使用 `textContent`，
  **禁止 `innerHTML` 拼接**，防止 XSS；
- `fetch` 必须设置超时（`AbortController`），网络异常统一转换为用户可读的提示；
- `localStorage` 只允许存储主题偏好等非业务数据，**业务数据（计算历史）一律来自后端数据库**。

### 异步

- 异步函数使用 `async / await`，禁止回调嵌套；
- `await` 的调用用 `try / catch` 包裹，失败时向用户展示友好信息而不是静默失败。

## 4. 提交前检查

- 在 Chrome / Safari 下手动验证主要流程（计算、历史、删除、主题）；
- 确认无 console 报错。
