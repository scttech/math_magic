<img src="./assets/images/math_magic-hero.jpg" alt="Math Magic Logo" width="200" />

# Math Magic

A client-side math practice site for grade-school students, starting with 6th grade. Students take quizzes, generate printable worksheets, and track their progress with charts — all running entirely in the browser, with no backend and no accounts.

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
- `js/core/wordProblemTemplateEngine.js`, `wordProblemPatterns.js`, `wordListStore.js`, `wordProblemTemplateStore.js` — the Word Problems feature: a fixed set of math "patterns" (each owning an answer formula and an `explain()` for the Help page) filled in by editable `<person>`/`<food>`/`<object>`/`<mixed_number>`/`<amount>`/`<random_number_MIN_to_MAX>` templates, managed from Settings.
- `js/core/helpRegistry.js`, `help.html` — the per-question Help system. Any generator that defines an `explain(meta)` method automatically gets a help page (via the generator/topic registry) — no separate registration needed. Every grade-6 generator has one; `registerHelpProvider()` is an escape hatch for content outside that registry.
- `js/app/` — shared bootstrap (registers content, ensures a profile exists), nav bar, and the avatar-icon manifest.
- `js/views/` — the DOM-rendering code for the home, quiz, worksheet builder, dashboard, and profile screens.
- `js/charts/` — d3.js chart modules for the progress dashboard, plus the problem-visual renderers shared by the Quiz view, the Worksheet Builder, and its printed output: `coordinatePlane.js` (points, polygons, distance segments, and an interactive click-to-plot mode) and `dataPlots.js` (dot plots, histograms, box plots). A problem carries an optional `visual` field (`{ type, ...config }`); `renderVisual.js` dispatches it to the right renderer, so adding a new visual type later is one new case there, not a change everywhere a chart gets mounted.
- `assets/images/avatars/` — the selectable profile avatar icons.
- `css/print.css` — the print stylesheet worksheets use for "Save as PDF" via the browser's print dialog.
- `tests/` — QUnit test files, mirroring the `js/` structure.
- `tools/serve.js` — local dev static server.

## Contributing

There's no CI — run the test suite locally (see above) and make sure it's green before committing.

## Status

Feature-complete: 
* Quizzes
* Worksheets with a printable answer key
* Multi-profile progress tracking with JSON export/import
* Progress dashboard with charts
* Profile avatar picker
* Grade-agnostic skills practice, from a Skills hub page (multiplication tables; shape identification — 2D and 3D shapes drawn as SVG line art, name it from 4 multiple-choice options), all with multiple-choice + keyboard answering
* 6th-grade Word Problems built from editable templates, with a Settings page to manage them and their word lists
* A per-question Help system across all 6th-grade topics: general steps to solve, plus an optional worked solution with the problem's actual numbers, opened in a new tab so quiz progress isn't lost
* A floating basic calculator, available on every page behind a toggle icon, for working through problems without leaving the page
* 6th-grade Rational & Irrational Numbers: classifying numbers, simplifying perfect-square roots, estimating irrational square roots between two whole numbers, and comparing roots to decimals
* Filled out 6.RP (Ratios & Proportions) to full Common Core coverage: percent problems (find the part, the whole, or the percent), equivalent ratio tables, and unit conversion via ratio reasoning
* The Coordinate Plane (6.NS.C.6/C.8, 6.G.A.3): identifying coordinates, reflections, distance between points, quadrants, and polygon side lengths — rendered with a shared d3 grid component, plus an interactive click-to-plot problem type. Worksheets print a matching grid per problem (blank for click-to-plot, so it can be done by hand)
* "Select All" on the Quiz/Worksheet topic checkboxes, with a proper indeterminate state for a partial selection
* Filled out 6.EE (Expressions & Equations) to full Common Core coverage: whole-number exponents, identifying the parts of an expression (coefficient/constant/term count), checking whether a value is a solution to an equation or inequality, and writing an inequality from a phrase like "at least" or "more than"
* Filled out 6.G (Geometry) to full coverage: composite area (composing/decomposing shapes), trapezoid area, and rectangular-prism volume with fractional edge lengths (6.G.A.3, coordinate-plane polygons, was already covered by The Coordinate Plane above)
* Filled out 6.SP (Statistics) to full Common Core coverage: identifying statistical questions, interquartile range (IQR), mean absolute deviation (MAD), and — closing the last gap — 6.SP.B.4's visual data displays: dot plots, histograms, and box plots, rendered with a new `js/charts/dataPlots.js` d3 component and dispatched (alongside the coordinate-plane grid) through `js/charts/renderVisual.js`
* Closed remaining gaps in 6.NS, 6.EE, and 6.G: a new "Long Division & Number Theory" topic (`js/generators/grade6/numberTheory.js`) covering the standard long-division algorithm, GCF, LCM, and the distributive property with the GCF (6.NS.B.2/B.4); writing algebraic expressions from word phrases and identifying independent/dependent variables in a real-world rate relationship (6.EE.B.6/C.9); and surface area of triangular prisms and square pyramids via net decomposition (6.G.A.4)

## License

MIT — see [LICENSE](LICENSE).
