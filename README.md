# AI: The Long Road to Now

An interactive, beginner-friendly journey through how artificial intelligence developed from early ideas in the 1940s to 2026.

**Story first.** Not an encyclopedia, not a leaderboard, and not a claim that AI suddenly started in 2022. Six scroll-driven chapters explain how ideas, computing power, data, and practical techniques converged over decades.

## Features

- Immersive, scroll-based narrative with six chapters.
- An interactive year-by-year **Time Lens** with sourced milestones and a "Why not earlier?" explanation.
- Responsive layout for desktop, tablet, and mobile.
- Keyboard-friendly controls, visible focus states, and reduced-motion support.
- Self-contained HTML/CSS/vanilla JavaScript: no framework, build step, trackers, cookies, API keys, or paid services.
- Citations linking to original research and reputable historical accounts.

## Local preview

Open `index.html` in a browser, or start a local static server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## GitHub Pages

The website is ready for Pages at the repository root. Enable deployment in **Settings → Pages → Build and deployment → Source: Deploy from a branch → main → /(root) → Save**.

Once enabled, the public URL is expected to be:

**https://hjsarker.github.io/ai-long-road-to-now/**

If Pages is not activated yet, the GitHub repository will contain the complete site, but the above URL may return 404.

## Editorial approach

Each milestone includes a source URL. The three ingredient descriptions in the Time Lens are **qualitative editorial summaries**, not measured time-series data. We deliberately do not place AI training FLOPs, compute hardware performance, and storage costs on a fictional shared numeric scale.

Historical developments were overlapping, worldwide, and non-linear. The six chapters are a guided introduction, not a complete account of AI history.

## Structure

- `index.html` — semantic page structure and metadata
- `styles.css` — all responsive styling and visualizations
- `content.js` — sourced milestones and chapter content
- `app.js` — story renderer, scroll interaction, Time Lens, keyboard navigation
- `favicon.svg` — original mark

## Credits

Created for Hillol Sarker Jogesh as an independent public educational visualization. Research sources are linked in the interface and in `content.js`.

*Last editorial review: October 2026.*
