# AI: The Long Road to Now

**The future had a very long beginning.**

A full-screen, interactive visual journey through AI history, from early theoretical neural networks in **1943** to the contemporary AI landscape in **2026**.

**Live experience:** https://hjsarker.github.io/ai-long-road-to-now/

## The experience

Instead of a long article or encyclopedia, a single interactive map connects three broad streams:

- **Ideas** — models, algorithms, reasoning, and breakthroughs in learning
- **Compute** — the machines and infrastructure needed to make ideas practical
- **Data** — the examples, images, and language needed for learning

The colored paths converge visually toward the current AI era. **They are illustrative, not quantitative charts.** Their heights do not encode a measured value, and the historical x-axis deliberately allocates more space to recent years for readability.

### Interactions

- **Hover a node:** temporarily preview the milestone in the contextual story panel
- **Click or tap a node:** pin that milestone
- **Use arrow controls or keyboard arrows:** move between milestones
- **Slide the year scrubber:** jump to the nearest documented event
- **Filter Ideas, Compute, or Data:** follow an individual branch
- **Play journey:** watch milestones advance automatically
- **About & sources:** read the approach and reference materials

On narrow screens, the map can be swiped horizontally and the detail panel moves below it.

## Technical stack

Plain HTML, CSS, SVG, and JavaScript. No framework, build step, analytics, cookies, API keys, or external dependencies. Deployed on **GitHub Pages**.

## Files

- `index.html` — page structure and interactive SVG map
- `styles.css` — desktop/mobile visuals and motion
- `app.js` — interactive nodes, hover previews, filtering, keyboard support and playback
- `content.js` — source-linked historical moments and supplementary context
- `favicon.svg` — original project mark
- `.nojekyll` — static hosting setting

## Historical accuracy

This visualization introduces major milestones rather than attempting a complete history. Dates, titles, and explanations come from curated references and academic papers linked from the story panel.

The **Ideas**, **Compute**, and **Data** branches are conceptual categories. The curves are hand-designed to communicate convergence; they do not represent measured historical performance. Hardware capability, dataset size, and AI training computation are different kinds of data and must not be combined into an invented unified scale. The spacing of milestones is non-linear.

Research references are available in `content.js`, and each node links to its historical or research source.

Last editorial review: October 2026.

## Run locally

Open `index.html` in a modern browser, or run:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publisher

Created for **Hillol Sarker Jogesh** as a public educational visualization and an interactive UI/data-storytelling portfolio project.
