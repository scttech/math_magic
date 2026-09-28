![./assets/images/math_magic-hero.jpg](Math Magic Logo)

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
- `js/skills/` — grade-agnostic skill drills (e.g. multiplication tables) that live outside the grade/topic registry, since they use their own multiple-choice UI instead of the free-text quiz flow.
- `js/app/` — shared bootstrap (registers content, ensures a profile exists), nav bar, and the avatar-icon manifest.
- `js/views/` — the DOM-rendering code for the home, quiz, worksheet builder, dashboard, and profile screens.
- `js/charts/` — d3.js chart modules for the progress dashboard.
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
* Grade-agnostic skills practice (multiplication tables, with multiple-choice + keyboard answering)

## License

MIT — see [LICENSE](LICENSE).
