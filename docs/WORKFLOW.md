# From idea to a room full of people deciding

The delivery process end to end. The authoring heuristics that sit inside the agent are deliberately not here - this is the operational side.

---

## Stage 0 - Set up once

- An LLM project holding the authoring brief, with the Studio in its knowledge so the agent reads the schema it writes against.
- The Studio saved locally. It is the tool, not an output.

**Check:** open the Studio, load the sample, confirm the preview runs and Export produces a file that opens on a double-click.

---

## Stage 1 - Pick the decision, not the topic

15 minutes.

A topic is 'requirements elicitation'. A scenario is 'the spec says notify the customer and nobody asked what happens when there is no phone number'. The unit is a decision someone competent gets wrong.

`/start` returns the intake template. Two fields do the real work:

- **The wrong move.** What capable people actually do here that costs them later.
- **What it costs, and when.** Week three, in production, in front of the regulator. Specific.

If neither can be filled, there is no scenario yet. Blank fields are fine - the agent fills them and flags what it assumed.

---

## Stage 2 - Check, then build

15-25 minutes.

`/check` asks up to five blocking questions in one message. `/build` returns the JSON, its assumptions, a tested model answer with its score, a deliberately weak answer with its score, and its weakest point.

Read the rubric test line first. An untested rubric is decoration.

---

## Stage 3 - Load, validate, preview

5 minutes.

Paste the JSON into the Studio. The validator catches dangling branches, unreachable nodes, rubrics with no keywords and endings with no verdict - here, not in the classroom. Errors go straight back to the agent with `/fix`.

Then play it, both device views, every branch and not just the good one:

- Does the wrong path hurt in a way someone will feel?
- Does the coaching note name a mechanism, or does it moralise?
- Does a deliberately weak answer fail? If it passes, the keywords are too generous.

---

## Stage 4 - Export and package

5 minutes.

**Export standalone HTML** gives one offline, self-contained file.

Keep both: the **JSON**, which is the source you edit next term, and the **HTML**, which is the thing you send. Never edit the HTML.

Attach case packs, decks or video as media links before exporting - links, never embedded files, so the file stays mailable and the material can be updated without re-exporting.

**Theme:** one file ships with both. Light for projectors, handouts and bright rooms; dark for personal laptops. The choice sticks per device.

**Getting it to learners**, ranked by how well each survives a real room:

1. Email or message the file ahead of the session. Works offline, survives dead campus wifi.
2. A hosted link on the board. One URL, works on laptop and phone.
3. An LMS upload, if the institution prefers it.

Do not rely on the venue network.

---

## Stage 5 - Run the session

45 to 60 minutes.

| Minutes | What happens |
|---|---|
| 0-5 | Frame the competency. No theory. One sentence on why this decision is hard. |
| 5-8 | They open the file. Sort out whoever's download failed. |
| 8-25 | They run it, alone or in pairs. Walk the room and watch where they hesitate. |
| 25-30 | Session summaries into the shared channel. |
| 30-50 | Debrief off the actual decisions. |
| 50-60 | Your read - what senior people do here, and what it looked like when it went wrong for real. |

**The i button** reopens the briefing and the learner's own consequences without leaving the answer box. Say it exists at minute 8 and the writing stage goes quiet.

**The e button is yours, not theirs.** The rubric is collapsed by default, so a projected answer does not come with the criteria attached. Paste the answer, ask the room what a good one needed, then reveal. That is the strongest thirty seconds in the session - do not spend it early.

### Collecting decisions

Every run ends with a copyable summary:

```
The Requirement That Wasn't - Business analysis scenario
Chose: Ask ops for a concrete case
Gap check: 3/3 of the must-haves
Written answer: 2/3 rubric criteria, short on who owns the call when it fails
Ending: Better, but still readable two ways
PUP|signoff|B>0+1+3(3/3)>written(2/3)|partial
```

Sentences first for skimming in the room, compact code last for sorting forty of them afterwards.

Twenty of these tell you what to spend the debrief on before anyone speaks.

### If the room has no laptops

Run it projected, whole class, facilitator driving. You lose the individual data and the written node, and it is still better than slides. A fallback, not a plan.

---

## Stage 6 - Close the loop

20 minutes, same day.

Paste the session summaries back into the agent with `/tune`. It reads the decision split and proposes edits; `/fix` returns the revised JSON. Re-export.

Anything said in the debrief that landed hard - the war story, the sharper phrasing - goes into the ending copy or a coaching note. That is how experience gets into the product instead of staying in the room.

---

## What breaks

| Failure | Cause | Fix |
|---|---|---|
| Everyone picks the right answer immediately | Distractors too weak | `/tune`, then rewrite so the wrong move is what a competent person under time pressure would do |
| Everyone scores full marks on the rubric | Keywords too generous | Test with a deliberately vague answer and tighten until it fails |
| Nobody scores above one criterion | Keywords too narrow, or the prompt is unclear | Check the prompt actually asks for the things the rubric grades |
| Learners ask what the briefing said | They missed the i button | Say it exists at minute 8 |
| Debrief runs flat | The rubric was revealed too early | Collapse it, project an answer, ask the room first |
| Text feels cramped | A screen is over ~120 words | Split the node in two |

---

## The loop, compressed

```
decision worth teaching
   -> /start -> fill template
   -> /check -> /build
   -> scenario JSON
   -> validate + play          (Studio, both device views)
   -> standalone HTML          (Export)
   -> distribute ahead of time
   -> run + collect summaries  (45-60 min session)
   -> /tune -> /fix            (same day)
```

The JSON is the asset. The HTML is a print of it.
