# The SBL Author - authoring interface

Scenarios are not written by hand. They are authored through a command-driven LLM brief that interviews the author, fills the gaps, and emits validated scenario JSON against the [schema](SCHEMA.md).

The brief itself is not published. The interface is below.

## Commands

| Command | What it does |
|---|---|
| `/start` | Emits a blank intake template - the minimum an author has to decide before a scenario is possible. |
| `/check` | Reads the filled template and asks only the questions that genuinely block drafting, capped and batched into one message. |
| `/build` | Produces the scenario JSON, plus its assumptions, a tested model answer, and the one thing it is least sure about. |
| `/tips` | Returns the authoring rules relevant to whichever part the author is stuck on. |
| `/fix` | Takes validator errors or a bad grading result and returns corrected JSON. |
| `/tune` | Takes session summaries from a real cohort, reads the decision split, and proposes specific edits. |
| `/help` | Lists the commands. |

## Why an interface rather than a prompt

Three things fall out of shaping the authoring loop this way.

**The template is the real artifact.** `/start` returns a table, not a conversation. That forces the author to name the one thing most scenario attempts skip - the specific wrong move a competent person makes - before any drafting happens. A scenario without that is a lecture with buttons.

**Questions are rationed.** `/check` is required to ask only what blocks it and to state assumptions for everything else. Open-ended interviewing produces better scenarios and never gets used, because the author is a working professional with forty minutes.

**The loop closes.** `/tune` takes real cohort data back in. A scenario is not finished when it is written; it is finished when the decision split shows the distractors did their job. Most authoring tools stop at generation.

## What the commands do not include

The heuristics inside each command - how a distractor is judged plausible, how rubric criteria are made machine-detectable without becoming trivial, how a cohort's decision split is read - are the part that took the iterations. Those are not published. Happy to walk through them.
