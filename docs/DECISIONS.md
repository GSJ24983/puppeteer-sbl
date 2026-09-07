# Design decisions

Each entry names what the decision rules out. A trade-off with no cost is not a decision, it is a preference.

## Frozen engine plus scenario JSON, not generated HTML per scenario

**Rules out:** per-scenario layout freedom. Every scenario looks like every other scenario.

**Why anyway:** regenerating an app for each scenario re-rolls the dice on routing bugs, grading wiring and house style every single time, and turns a thirty-second content review into a three-minute code review. Separating them shrinks authoring from 'write an app' to 'write a validated data object', which is a job an agent can do reliably and a human can check quickly.

## A single self-contained HTML file, no backend

**Rules out:** collecting responses centrally, cohort dashboards, server-side grading, any analytics I do not manually assemble.

**Why anyway:** the artifact has to survive a campus network, open on a double-click, and be mailable to a professor who will not create an account. Distribution beat capability. The workaround is a copyable session summary the learner pastes into a class channel - lower fidelity than a database, and it works in a room with no wifi.

## Keyword-based rubric grading on the client, not an LLM call

**Rules out:** grading nuance. A well-argued answer using different vocabulary scores badly.

**Why anyway:** an API key inside a file you hand to forty students is an exposed key. And in a live session the rubric on screen is the teaching artifact - the instructor grades in the room, which is better than automated grading anyway. The honest cost is that generous keywords pass weak answers, so every rubric ships with a tested model answer and a tested weak answer, and the authoring agent is required to run both before handing over a scenario.

## Procedural scene art from a fixed library, not illustration per beat

**Rules out:** visual specificity. A scene about a refunds meeting looks like any other office scene.

**Why anyway:** hand-drawn art per beat cannot be authored in twenty minutes, and authoring speed is the whole thesis. The picture was never carrying the meaning.

## The scene is a banner, about a fifth of the viewport

**Rules out:** imagery as a focal point.

**Why anyway:** decorative visuals should not compete with the text doing the work. The first build gave art a 16:9 block and pushed the actual scenario below the fold on a laptop, which is exactly backwards for a reading task.

## The rubric is collapsed by default

**Rules out:** learners self-assessing against criteria while they write.

**Why anyway:** the strongest thirty seconds in a session is projecting an answer, asking the room what a good one needed, and then revealing the criteria. Visible-by-default spends that moment before the argument happens. One flag turns it back on for scenarios where teaching the rubric is the point.

## Wrong answers advance and carry their cost forward; gating is opt-in

**Rules out:** guaranteeing every learner reaches the end having made only good decisions.

**Why anyway:** gating every decision turns a scenario into a quiz. The learning is in living with a choice, not in being blocked until you guess right. Gating stays available for the cases where a later step is genuinely impossible without the earlier one.

## The authoring brief stays private; its interface does not

**Rules out:** anyone reproducing the authoring loop from this repo, and the credibility that comes with showing the whole thing.

**Why anyway:** the engine and the schema are infrastructure - useful, replaceable, and nothing is lost by opening them. The authoring heuristics are the part that took the iterations: which distractors actually fooled a room, which rubric keywords let weak answers through, how to read a cohort's decision split. Publishing the command interface shows that the authoring loop was designed rather than improvised, which is the signal worth sending. Publishing what sits inside each command gives away the only part that is hard to rebuild. The trade is deliberate and I would rather explain it in a conversation than lose it in a repo.

## The session summary is sentences first, code last

**Rules out:** a tidy single-line machine-readable format.

**Why anyway:** the instructor skims these in the room while thirty people wait. Sentences are readable at a glance; the compact code on the last line still sorts forty of them afterwards.
