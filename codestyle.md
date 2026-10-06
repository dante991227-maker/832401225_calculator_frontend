# Frontend Code Standard (HTML / CSS / JavaScript)

> Source of this standard: **[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)** (JavaScript),
> together with the [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html).
> All frontend code in this project follows the rules below.

## 1. HTML

- UTF-8 encoding; pages declare `<html lang="en">`;
- Attribute values use double quotes; boolean attributes are written bare (e.g. `defer`);
- Semantic tags: `main` / `section` / `aside` / `header` / `footer`;
- Interactive elements must be `<button type="button">` with a `title` or `aria-label` explaining their purpose;
- Static assets are referenced with relative paths so the site works under any sub-path (e.g. GitHub Pages).

## 2. CSS

- 2-space indentation; one declaration per line;
- Class names use **kebab-case** (e.g. `history-item`, `calc-header`);
- Design values (colors, radii, shadows) live in `:root` **CSS custom properties**;
  the dark theme overrides them via `html[data-theme="dark"]` — never hardcode duplicated colors;
- No `!important`; prefer class selectors and avoid deeply nested selectors;
- Responsive layout via media queries (`@media (max-width: 760px)`).

## 3. JavaScript

### Formatting

- 2-space indentation; **semicolons are required**;
- Strings use double quotes (template literals excepted);
- Always `const`; use `let` only when reassignment is needed; never `var`;
- Always compare with `===` / `!==`, never `==` / `!=`;
- Max 100 characters per line.

### Naming

| Object | Style | Examples |
| --- | --- | --- |
| Variables/functions | camelCase | `renderHistory()`, `lastResult` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `REQUEST_TIMEOUT_MS` |
| Cached DOM references | camelCase nouns | `displayExpression` |
| Booleans | is/has prefix | `justEvaluated` |

### Structure and Functions

- One function does one thing and stays under ~40 lines;
- Public functions carry **JSDoc comments** describing params, return values and thrown errors;
- File layout: `config.js` (configuration), `api.js` (network layer), `app.js` (interaction);
  configuration and network calls never leak into UI code;
- Prefer **event delegation** (e.g. one click listener for the whole keypad).

### Security

- Any data returned by the backend (expressions, error messages) must be inserted with
  `textContent` — **never concatenate `innerHTML`**, to prevent XSS;
- `fetch` calls must set a timeout (`AbortController`); network errors are converted
  into user-friendly messages;
- `localStorage` may only store non-business data such as the theme preference;
  **business data (calculation history) always comes from the backend database**.

### Async

- Use `async / await`; callback nesting is forbidden;
- Wrap `await` calls in `try / catch` and show the user a friendly message instead of failing silently.

## 4. Before Committing

- Manually verify the main flows in Chrome / Safari (calculate, history, delete, theme);
- Make sure the console shows no errors.
