# PascalPath

A learning platform for Sri Lankan **GCE O/L ICT** students to learn, practise and master **Pascal programming**, built on the *Grade 11 ICT: Pascal Programming — Complete Guide* tute (`docs/source/`).

No accounts: progress is stored in the browser, with export/import for moving devices.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # interpreter + content verification (331 tests)
npm run build      # static site in dist/
```

## What's inside

| Area | Features |
|---|---|
| **Learn** | Learning map of 9 units / 24 topics. Each topic: lesson → practice → challenge → mastery check → 5-minute revision page. |
| **Lessons** | Concept cards, 15 interactive visuals (div/mod sweets, truth table, if-flowchart, array train, compiler vs interpreter…), runnable examples, "watch it run" animations, try-it tasks, quick checks. |
| **Code Lab** | Editor + console with interactive `readln`, every program from the tute, saved programs, **Show me what happened** step-by-step visualiser. |
| **Practice** | 10 question types (choose, predict output, fill code, spot the bug, fix the bug, write code, arrange code, trace table, match, sort). Progressive hints, "explain this concept", "similar example", "why is my answer wrong?". Missed questions come back; weak areas are detected. |
| **Challenges** | Daily challenge, 8 boss battles (multi-stage programs), 5 mini-games. |
| **Exam Ready** | Readiness score (concepts / coding / problem solving / exam), timed practice, 25-question mock exams with review, structured Paper II questions (code auto-marked, theory self-marked against marking points). |
| **Progress** | XP, levels, streak (with streak shields), 27 achievements, skills, activity heatmap, settings, backup. |

## Architecture

```
src/
  pascal/        Pascal interpreter: lexer → parser → type checker → generator-based
                 executor. Friendly error catalogue (errors.ts). Never evals student code.
  content/       All learning content as typed data (no content in components).
    units/       One file per unit: topics (lessons + revision), question bank, boss.
    examples.ts  Code Lab programs from the tute.
    exam.ts      Structured questions.  revision.ts  mistakes / differences / patterns.
  engine/        Store (localStorage), grading, mastery & readiness, XP/levels/streaks,
                 achievements, session builder, procedural generators, help provider.
  components/    code/ (editor, console, visualiser, playground), questions/, visuals/,
                 layout/, ui/
  pages/         One component per route (lazy-loaded).
  i18n/          UI strings (en.ts). Add si.ts with the same keys for Sinhala.
```

**Safety:** student code is interpreted by a custom Pascal interpreter written in TypeScript. It runs only in the browser and never turns code into JavaScript, so it cannot touch the page or the network. Infinite loops are stopped after a step limit, with an explanation.

**Accuracy:** the interpreter's output was compared byte-for-byte with Free Pascal on the tute's programs (`src/pascal/fixtures`). `src/content/content.test.ts` runs every output answer, model solution, starter program, boss stage and example through the interpreter, so a wrong answer key fails the build.

**AI-ready help:** `engine/help.ts` exposes a `HelpProvider` interface; the default is rule-based. An AI provider can be plugged in with `setHelpProvider` without changing the UI.

## Adding content

1. Open the unit file in `src/content/units/`.
2. Add questions to `questions` (see `src/content/types.ts` for every question type and field).
3. Reference new questions from lessons (`{ kind: 'check', question: 'id' }`) or let practice sessions pick them up automatically by `topic` and `difficulty`.
4. Run `npm test`. It checks that answers are correct and solutions pass their tests.

Text fields use a small markup: `` `code` ``, `**bold**`, `*italic*`, `- ` bullets, blank line = paragraph, ```` ``` ```` code blocks.

## Deploy

`npm run build` produces a static site in `dist/` using hash routing and relative paths, so it works on any static host (Netlify, Vercel, GitHub Pages, Firebase Hosting, or a school server) with no server configuration.
