# Rehab Exercise Tracker (Static TypeScript App)

Exercise Tracker is a complete client-side web app for logging daily workouts and viewing progress with daily, weekly, and monthly insights. It is designed for static hosting on GitHub Pages (`github.io`) with no backend.

## Features

- Daily exercise logging with multiple entries per date
- Optional fields: sets, reps, distance, calories
- Automatic total minutes per day
- LocalStorage persistence
- Dashboard views:
  - Daily Summary
  - Weekly Summary (with daily chart)
  - Monthly Summary (with trend chart)
- Trends & insights:
  - Minutes over time line chart
  - Longest streak
  - Most active day
  - Weekly growth percentage
- Data export/import as JSON
- Demo dataset loader
- Dark mode toggle
- Responsive mobile-friendly UI

## Tech Stack

- TypeScript (`strict: true`)
- Vanilla HTML/CSS
- Chart.js (CDN)
- LocalStorage
- Static ESM output for GitHub Pages

## Project Structure

```text
.
├── docs/                      # GitHub Pages deploy root (ready-to-serve)
│   ├── index.html
│   ├── styles.css
│   └── assets/
│       ├── example-data.json
│       └── js/
│           ├── app.js
│           ├── main.js
│           ├── components/
│           ├── models/
│           ├── services/
│           └── utils/
├── src/                       # TypeScript source
│   ├── index.html
│   ├── styles.css
│   ├── app.ts
│   ├── main.ts
│   ├── assets/
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── components/
├── tests/
│   └── summaryService.test.mjs
├── scripts/
│   └── copy-static.mjs
├── package.json
└── tsconfig.json
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Build (compiles TypeScript and copies static assets into `docs/`):

```bash
npm run build
```

3. Serve `docs/` locally (example):

```bash
npx serve docs
```

## GitHub Pages Deployment

This repo is configured to deploy directly from the `docs/` folder.

1. Commit and push your repository.
2. In GitHub: **Settings → Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/docs`
4. Save and wait for Pages to publish.

Your app will be served at:

`https://<your-username>.github.io/<your-repo>/`

## Notes

- All asset paths are relative, so the app works from GitHub Pages project URLs.
- No inline scripts are used.
- Example data file: `docs/assets/example-data.json`
- The app is modular and easy to extend for goals, categories, or analytics.

## Tests

A basic unit test file exists for summary calculations:

```bash
npm test
```

(Tests run against compiled JS in `docs/assets/js`.)
