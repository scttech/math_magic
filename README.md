<img src="./assets/images/math_magic-hero.jpg" alt="Math Magic Logo" width="200" />

# Math Magic

A client-side math practice site for grade-school students, currently covering 5th and 6th grade. Students can work through short tutorial lessons to learn or review a concept, take quizzes, generate printable worksheets, and track their progress with charts — all running entirely in the browser, with no backend and no accounts.

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

- `index.html` — the only page at the site root (required for GitHub Pages); every other page (`quiz.html`, `worksheet.html`, `dashboard.html`, `learn.html`, `skills.html`, etc.) lives under `pages/`.
- `js/core/` — the problem-generator contract, seeded RNG, topic/grade registry, scoring/aggregation, profile and progress storage, import/export.
- `js/generators/<grade>/` — topic modules (e.g. `grade6/fractionsDecimals.js`) that plug into the registry. Adding a new grade or topic means adding a module here, not changing core code.
- `js/skills/` — grade-agnostic skill drills (multiplication tables, shape identification, addition/subtraction/division fact fluency, fraction simplification, and mixed-number/improper-fraction conversion) that live outside the grade/topic registry, since they use their own multiple-choice UI instead of the free-text quiz flow. `skills.html` is a hub page linking to each skill's own page. Drills share their "setup → multiple-choice questions → results" flow via `js/app/skillRunner.js`, so a new one is just a small skill module (problem generation) plus a thin view file (setup validation and prompt rendering). The fact-fluency drills also offer an optional "Blitz Mode" — a 60-second timed run with unlimited questions instead of a fixed count, built into `skillRunner.js` itself rather than forked. Every answer, across skill drills, the quiz, and lesson checkpoints, gets a small sound and animation from `js/app/feedbackFx.js` (synthesized Web Audio tones, no audio assets — mutable from Settings).
- `js/core/wordProblemTemplateEngine.js`, `wordProblemPatterns.js`, `wordListStore.js`, `wordProblemTemplateStore.js` — the Word Problems feature: a fixed set of grade-agnostic math "patterns" (each owning an answer formula and an `explain()` for the Help page) filled in by editable `<person>`/`<food>`/`<object>`/`<mixed_number>`/`<amount>`/`<random_number_MIN_to_MAX>` templates, managed from Settings. Both `grade5/wordProblems.js` and `grade6/wordProblems.js` are thin generators that draw from this same shared pattern pool, each under its own generator id. The `person`/`food`/`object` word lists themselves live in `wordListStore.js` and can be edited one word at a time or replaced wholesale by pasting a comma- or newline-separated list (e.g. a teacher pasting in a class roster for "People") from Settings.
- `js/core/helpRegistry.js`, `help.html` — the per-question Help system. Any generator that defines an `explain(meta)` method automatically gets a help page (via the generator/topic registry) — no separate registration needed. Every grade-5 and grade-6 generator has one; `registerHelpProvider()` is an escape hatch for content outside that registry.
- `js/core/lessons.js`, `learn.html`, `learn-topic.html`, `lesson.html` — tutorial-style lessons, browsed through a three-level drill-down that mirrors the grade/topic/generator structure the rest of the site already uses: `learn.html` picks a grade and shows a roadmap of its topics; `learn-topic.html?grade=&topic=` shows a roadmap of that topic's lessons; `lesson.html?id=...` renders one lesson — an ordered list of explanatory text, hand-worked examples, and interactive checkpoints. A checkpoint names a real generator id + difficulty rather than carrying its own problem logic, so it reuses that generator's actual `generate()`/`checkAnswer()`/`explain()` — a lesson can't drift from how its topic is scored or explained anywhere else on the site. Both roadmap levels share one renderer (`js/app/lessonRoadmap.js`, plain SVG for the winding connector with real HTML nodes layered on top); a node is never locked, just colored by status. `js/core/lessonProgress.js` tracks, per profile, which checkpoints have been answered correctly at least once — a lesson's status (not started / in progress / completed) is derived from that, and a topic's status rolls up from its lessons the same way. The home page's "Learn" card (`js/app/continueLearning.js`) uses that same status to send a returning student straight to their first in-progress lesson, or their next not-yet-started one, in curriculum order. A lesson page's "Print / Save as PDF" button reuses `css/print.css` to print just the narrative text and worked examples as a one-page cheat sheet, leaving out the interactive checkpoints.
- `js/core/problemSet.js`, `worksheet.html` — every problem in a quiz or worksheet comes entirely from `(grade, topics, difficulty, count, seed)`, so the exact same inputs always reproduce the exact same problems. The Worksheet Builder prints its seed as the worksheet's own "Worksheet #" number; `js/core/worksheetLookup.js` + the "Look Up an Answer Key" form on `worksheet.html` use that to regenerate a past worksheet's answer key on demand — first checking this browser's own history (every worksheet generated is recorded there, keyed by profile), falling back to a manual form (grade/topics/difficulty/count) for a worksheet from a different device, since the printed worksheet's header already shows all of that alongside its number.
- `js/app/` — shared bootstrap (registers content, ensures a profile exists), nav bar, the avatar-icon manifest, `recommendation.js` (the home page's "Recommended Practice" card: whichever topic or skill drill has the lowest recorded accuracy with enough attempts to be meaningful), `continueLearning.js` (the home page's "Learn" card: where to resume lessons), and `feedbackFx.js` (shared sound/animation feedback).
- `games.html` — a hub page (same pattern as `skills.html`), with its own main-nav tab, linking to each game — kept separate from the Skills hub since these reinforce topics through play rather than a straight drill. All four games record completed sessions the same way skill drills do (`type: 'game'`), so they feed the same dashboard, streaks/badges, and recommendations as the matching topic:
  - `duel.html`, `js/views/duelView.js`, `js/app/duelScoring.js` — local 2-player Duel Mode: both players race on the same shared problem, each with their own independent multiple-choice grid (first correct click *or keypress* wins the round). Keyboard input is split by physical key (`event.code`, not `event.key`) so one keyboard can be shared without collisions: Player 1 answers with the top-row 1-4, Player 2 with A/S/D/F or Numpad 1-4 (either works, for keyboards with or without a number pad). Both players are chosen from existing profiles (not free-text names) and must be different, since the match result is recorded to each of their own progress histories as a `type: 'duel'` attempt (win/loss/tie, each player's own answers, the opponent's final score) — `js/core/scoring.js`'s `computeDuelStats()` derives each profile's win/loss record and current win streak from those attempts alone, which also feeds four duel-specific badges (first duel, 5 wins, a 3-win streak, a shutout win) and a Duel Record tile on the dashboard.
  - `game-math-blaster.html`, `js/views/mathBlasterView.js`, `js/game/blasterEngine.js` — a canvas arcade game reusing the same generator contract as the skill drills: a topic's shuffled multiple-choice `choices` become falling "asteroids," and the player clicks the correct one before it lands. The engine (`requestAnimationFrame`-driven, the only canvas usage in the codebase) is split from the view so its hit-testing and difficulty-ramp math are unit-testable without a real canvas. Each topic supplies its own `renderPrompt(container, problem)`; most just set text, but "Shape Catch" (the `shapeIdentification` topic) draws the shape with the existing `shapeRenderer.js` SVG renderer instead.
  - `game-treasure-hunt.html`, `js/views/treasureHuntView.js` — built almost entirely from existing pieces: the real grade 5/6 "Plotting Points" curriculum generators (via the registry) and the interactive click-to-plot coordinate grid already used by the Quiz view and lesson checkpoints. A wrong click costs a life but the same target can be retried; running out of lives ends the game early.
  - `game-memory-match.html`, `js/views/memoryMatchView.js`, `js/app/memoryDeck.js` — flip cards to pair a problem with its answer, using the same generator contract a third way. `memoryDeck.js`'s `buildDeck()` retries generation until every prompt and every answer in the deck is unique, so two different problems can never accidentally look like a match.
- `pages/report.html`, `js/views/reportView.js` — a printable weekly progress report covering every profile in the browser on one sheet, built by feeding `js/core/scoring.js`'s `filterAttemptsSince()` (attempts from the last 7 days) into the same `computeSummary`/`computeAccuracyByTopic`/`computeStreak`/`computeBadges` the dashboard already uses — no separate report-specific aggregation logic.
- `js/views/` — the DOM-rendering code for the home, quiz, worksheet builder, dashboard, and profile screens.
- `js/charts/` — d3.js chart modules for the progress dashboard, plus the problem-visual renderers shared by the Quiz view, the Worksheet Builder, its printed output, and Learn checkpoints: `coordinatePlane.js` (points, polygons, distance segments, and an interactive click-to-plot mode), `dataPlots.js` (dot plots, histograms, box plots), and `numberLine.js` (one or more labeled points on a line, with an optional highlighted span between two values). A problem carries an optional `visual` field (`{ type, ...config }`); `renderVisual.js` dispatches it to the right renderer, so adding a new visual type later is one new case there, not a change everywhere a chart gets mounted.
- `assets/images/avatars/` — the selectable profile avatar icons.
- `css/print.css` — the print stylesheet worksheets and lessons use for "Save as PDF" via the browser's print dialog.
- `tests/` — QUnit test files, mirroring the `js/` structure.
- `tools/serve.js` — local dev static server.

## License

MIT — see [LICENSE](LICENSE).
