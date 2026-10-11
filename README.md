<img src="./assets/images/math_magic-hero.jpg" alt="Math Magic Logo" width="200" />

# Math Magic

A client-side math practice site for grade-school students, currently covering 5th and 6th grade. Students take quizzes, generate printable worksheets, and track their progress with charts — all running entirely in the browser, with no backend and no accounts.

**Live site:** https://scttech.github.io/math_magic/

## Why client-side?

Everything — problem generation, scoring, progress history — happens in your browser. Nothing is sent to a server, which also means no accounts and no data collection: a nice side effect for a site aimed at kids. Progress is saved to the browser's local storage automatically, and can be exported/imported as a JSON file to back it up or move it to another device or browser.

## Running it locally

The site is plain HTML/CSS/JS (ES modules) with no build step. To avoid `file://` module-loading quirks in some browsers, serve it with the included zero-dependency dev server:

```
node tools/serve.js
```

Then open http://localhost:8080/ in a browser.

Or as I personally do with the Live Server extension in VSCode.

## Running the tests

The test suite uses [QUnit](https://qunitjs.com/) and runs directly in the browser, no build step required:

```
node tools/serve.js
```

Then open http://localhost:8080/tests/index.html.

## Project structure

- `js/core/` — the problem-generator contract, seeded RNG, topic/grade registry, scoring/aggregation, profile and progress storage, import/export.
- `js/generators/<grade>/` — topic modules (e.g. `grade6/fractionsDecimals.js`) that plug into the registry. Adding a new grade or topic means adding a module here, not changing core code.
- `js/skills/` — grade-agnostic skill drills (multiplication tables, shape identification) that live outside the grade/topic registry, since they use their own multiple-choice UI instead of the free-text quiz flow. `skills.html` is a hub page linking to each skill's own page (`skills-multiplication-tables.html`, `skills-shape-identification.html`).
- `js/core/wordProblemTemplateEngine.js`, `wordProblemPatterns.js`, `wordListStore.js`, `wordProblemTemplateStore.js` — the Word Problems feature: a fixed set of grade-agnostic math "patterns" (each owning an answer formula and an `explain()` for the Help page) filled in by editable `<person>`/`<food>`/`<object>`/`<mixed_number>`/`<amount>`/`<random_number_MIN_to_MAX>` templates, managed from Settings. Both `grade5/wordProblems.js` and `grade6/wordProblems.js` are thin generators that draw from this same shared pattern pool, each under its own generator id.
- `js/core/helpRegistry.js`, `help.html` — the per-question Help system. Any generator that defines an `explain(meta)` method automatically gets a help page (via the generator/topic registry) — no separate registration needed. Every grade-5 and grade-6 generator has one; `registerHelpProvider()` is an escape hatch for content outside that registry.
- `js/app/` — shared bootstrap (registers content, ensures a profile exists), nav bar, and the avatar-icon manifest.
- `js/views/` — the DOM-rendering code for the home, quiz, worksheet builder, dashboard, and profile screens.
- `js/charts/` — d3.js chart modules for the progress dashboard, plus the problem-visual renderers shared by the Quiz view, the Worksheet Builder, and its printed output: `coordinatePlane.js` (points, polygons, distance segments, and an interactive click-to-plot mode) and `dataPlots.js` (dot plots, histograms, box plots). A problem carries an optional `visual` field (`{ type, ...config }`); `renderVisual.js` dispatches it to the right renderer, so adding a new visual type later is one new case there, not a change everywhere a chart gets mounted.
- `assets/images/avatars/` — the selectable profile avatar icons.
- `css/print.css` — the print stylesheet worksheets use for "Save as PDF" via the browser's print dialog.
- `tests/` — QUnit test files, mirroring the `js/` structure.
- `tools/serve.js` — local dev static server.

## License

MIT — see [LICENSE](LICENSE).
