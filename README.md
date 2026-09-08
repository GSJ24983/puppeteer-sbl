# The Puppeteer

A branching-scenario learning engine that teaches judgment by making people decide, then grades what they write.

**[Play a scenario](https://GSJ24983.github.io/puppeteer-sbl/demo/signoff.html)**  -  six minutes, works on a phone, no signup.
**[Open the authoring studio](https://GSJ24983.github.io/puppeteer-sbl/)**  -  edit a scenario and export your own.

## The problem

Content produces recall, not judgment. Case-method teaching produces judgment but costs one experienced instructor per twenty learners, which is why it stays in business schools and out of everywhere else. Situation-based learning has been known to work since the 1980s. What kept it rare was the cost of authoring and grading it - and that is the part that changed.

## How it works

Three pieces, deliberately separated.

- **A frozen engine.** One player renders any scenario. It is never regenerated per scenario.
- **A scenario as JSON.** All content, branching, rubrics and endings live as data, not code.
- **An authoring agent.** A command-driven LLM brief that interviews the author and emits validated scenario JSON. The command interface and the reasoning behind it are in [docs/AGENT.md](docs/AGENT.md); the brief itself is not published.

The Studio holds the engine as a template, validates a scenario, previews it live, and exports a single self-contained HTML file that runs offline and opens on a double-click.

## What a learner does

Reads a situation. Makes a decision and lives the consequence. Presses `i` to reread the briefing and their own path so far. Writes an answer against a rubric they cannot see until the instructor reveals it, and gets coaching that names what breaks if a criterion is missing - not just which box went unticked. A weak first answer cannot skip ahead. A model answer is one click away for anyone working alone.

The run ends with a plain-English summary of their decisions that they paste into the class channel, so the debrief runs off what the room actually did rather than a show of hands.

## Competency grounding

Every scenario is tagged to a competency and to the specific behaviour statement it trains, drawn from the ICF competency framework mapped onto product and business analysis practice. Rubric criteria are derived from that behaviour statement rather than invented, which is what keeps them observable instead of adjectival. The tag travels in every session summary, so a term of sessions pivots by competency in a spreadsheet: which competencies a cohort is weak on, not just which scenarios they found hard.

## What is built

Working: the player with four node types (narrative, branching choice, multi-select, written answer); rubric grading with per-criterion coaching, retry, and attempt-aware progression; a shipped model answer with an explanation of why it works; in-character dialogue prompts; cumulative context recall; dark and light themes; procedural scene art; standalone export; and session summaries.

The validator catches dangling branches, unreachable nodes, missing coaching, thin keyword lists - and grades each model answer against its own rubric, so a rubric that cannot recognise a good answer never ships. 97 automated tests cover every branch, every validator rule, and both themes.

Not built: server-side response collection, LLM-based grading, pre and post assessment instrumentation, multi-scenario progress tracking.

## Try it in sixty seconds

1. Open the [Studio](https://GSJ24983.github.io/puppeteer-sbl/).
2. The sample scenario loads on the left, running live on the right.
3. Change a line of text and press Cmd/Ctrl + Enter.
4. Click **Export standalone HTML**. That file is yours - offline, self-contained, mailable.

## Authoring

Scenarios are authored through a command interface - `/start` returns an intake template, `/check` asks only what blocks it, `/build` emits validated JSON with a rubric it has tested against its own model answer, `/tune` reads a real cohort's decision split back in. The interface and the reasoning behind it are in [docs/AGENT.md](docs/AGENT.md). The heuristics inside each command are not public.

## Design decisions

The trade-offs are the interesting part. A few, with what each one rules out, are in [docs/DECISIONS.md](docs/DECISIONS.md). The short version: distribution beat capability at every fork, because a file that survives a campus network and opens on a double-click is worth more than a feature nobody can reach.

## Repo map

| Path | What it is |
|---|---|
| `index.html` | the built Studio |
| `demo/` | exported standalone scenarios |
| `src/` | engine template, studio shell, schema docs, sample scenario, build script |
| `tests/` | 97 jsdom checks |
| `docs/` | delivery workflow, authoring interface, decision log |

## Status

A personal project, built solo. Used for classroom sessions on business analysis and product judgment, and as a working demonstration of the authoring loop: topic in, playable scenario out, in about twenty minutes.

All rights reserved. Published for demonstration and evaluation - see [LICENSE](LICENSE).
