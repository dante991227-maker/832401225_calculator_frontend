# 832401225 Calculator System — Frontend

The frontend (web app) of the front-end/back-end separated calculator system. It renders the calculator UI, handles keypad/keyboard interaction, sends expressions to the backend for evaluation, displays the results and error messages returned by the backend, and manages the calculation history. **The frontend performs no core calculation at all.**

## Tech Stack

- Vanilla HTML5 + CSS3 + JavaScript (ES2020+), no build tools or frameworks
- Calls the backend REST API with `fetch` (JSON)

## Project Structure

```
832401225_calculator_frontend/
├── index.html                 # Site entry (for GitHub Pages; redirects to the main page)
├── src/
│   ├── calculator.html        # Main calculator page
│   ├── css/
│   │   └── style.css          # All styles (CSS variables for light/dark themes)
│   └── js/
│       ├── config.js          # Backend API base URL configuration
│       ├── api.js             # Backend API wrapper (timeout and error handling)
│       └── app.js             # Interaction: keypad, keyboard, history, theme
├── README.md
└── codestyle.md               # Code standard (based on the Airbnb JavaScript Style Guide)
```

## Requirements

- Any modern browser (Chrome / Edge / Safari / Firefox)
- The backend service is running (default `http://localhost:5001`, see the backend README)

## Installation & Startup

The frontend is a pure static page — no dependencies to install. Serving it over HTTP is recommended (double-clicking the file via `file://` also works, but some browsers restrict requests from `file://`):

```bash
cd 832401225_calculator_frontend
python3 -m http.server 8080
```

Then open <http://localhost:8080/src/calculator.html> (or the root `http://localhost:8080`, which redirects automatically).

With VS Code you can also use the Live Server extension: right-click `src/calculator.html` → Open with Live Server.

## Configuration

The backend API base URL is set in `src/js/config.js`:

```js
const DEV_API_BASE = "http://localhost:5001";   // local backend
const PROD_API_BASE = "https://eight32401225-calculator-backend.onrender.com"; // production backend

const API_BASE_URL = isLocal ? DEV_API_BASE : PROD_API_BASE;
```

- When opened locally (localhost / 127.0.0.1 / file://) it uses `DEV_API_BASE`;
- When deployed it uses `PROD_API_BASE`. If your backend service has a different
  name than `eight32401225-calculator-backend`, change `PROD_API_BASE` accordingly.

The **backend connection indicator** in the top-right corner (green "Backend connected" / red "Backend not connected") tells you at a glance whether the two ends are talking.

## Features

### Core features (assignment requirements)

- Four arithmetic operations: `+`, `−`, `×`, `÷` (the UI shows × and ÷ while `*` and `/` are sent)
- Compound expressions: operator precedence, parentheses (nested), unary plus/minus, decimals
- Error display: backend errors such as invalid expressions and division by zero are shown in red
- Calculation history: read from the backend database (expression, result, time)
- Deleting a specific history record (calls the backend DELETE endpoint, then re-fetches)

### Extension features

1. **Keyboard input**: digits/operators directly; `Enter` to evaluate, `Backspace` to delete, `Esc` to clear
2. **Light/dark theme toggle**: button in the top-right corner; the preference is stored in localStorage (theme only — history always comes from the backend database)
3. **Click a history record to reuse its expression**
4. **Clear all history** (paired with the backend `DELETE /api/history` endpoint)
5. **Backend connection indicator**: based on `/api/health`

## How the Frontend Connects

1. Start the backend first (see the backend README);
2. The frontend calls the backend REST API with `fetch`:

| Frontend action | Backend endpoint |
| --- | --- |
| Press `=` | `POST /api/calculate` with body `{ "expression": "..." }` |
| Page load / refresh / after a calculation | `GET /api/history` |
| Click the × of a history record | `DELETE /api/history/{id}` |
| Click "Clear all" | `DELETE /api/history` |
| On page load | `GET /api/health` for the connection indicator |

3. While the backend is unavailable, the UI still accepts input but pressing `=` shows "Cannot connect to the backend service", and the history panel shows a load error — proving the calculation fully depends on the backend.

