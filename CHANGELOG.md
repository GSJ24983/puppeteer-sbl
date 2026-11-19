# Changelog

The Studio's version shows in its header, beside the title. Every exported scenario carries it too: hover 'Learn by deciding' in the top bar, or look for `<meta name="generator">` in the file. `index.html` is always the latest; `releases/` keeps a named copy of each version.

## v0.3 - 19 Nov 2026

- **Trainee and trainer views.** Export the same scenario twice. The trainer file shows, on every option, whether it is the expert move or the trap and what choosing it reveals about the learner's thinking (`reveals`), plus debrief notes (`trainerNote`) on any screen. The trainee file strips `reveals`, `trainerNote` and `redFlags` from the data, not just the screen.
- **Briefing and Rubric buttons** replace the `i` and `e` keys, so it works on a phone.
- **Written answer: 3 attempts.** The learner sees how many rubric points they missed and the coaching, then chooses Improve my answer (the text stays) or Submit as is. The last submitted answer counts. Set `tries` on the node or deck to change the number. The model answer button is now trainer-only.
- **Send to trainer.** The ending has a name box and WhatsApp, email, copy and save buttons. The message carries the plain summary and a `PUP2:` result code with every choice, pick and written answer. Optional deck-level `sendTo {whatsapp, email}`. The separate session summary box is gone.
- **Your path.** A decision-and-consequence diagram on the ending (folded) and in the saved report, which also gives what happened at each step, the stronger move where the learner took a trap, what they noticed and missed, and the model answer.
- **Session dashboard** (Studio tab). Paste whatever learners sent you; every `PUP2:` code is read. Decision splits with what each choice reveals, multi-select misses, criteria met, answers to discuss, a drill-down per learner with their path, a projection mode with no names, and sample results to try it.
- **Pictures.** `"scene": "none"` drops the banner, `sceneImg` (with `sceneAlt`) replaces it with your own image, scenario-level `hideArt` removes the built-in art everywhere, and `thumbImg` replaces the hub card picture.
- **Validator** knows the new fields. `build.py` strips trainer-only fields from the public demo.

## v0.2 - 19 Oct 2026

- **Line breaks.** A `\n` in any text field shows as a line break, `\n\n` as a new paragraph.
- **Red flags.** Optional `redFlags {rule, phrases}` on a written node. Shown inside the folded rubric for the facilitator; never graded. The validator refuses a model answer that crosses its own red line.
- **Visual blocks.** Narrative screens, consequences and endings take `blocks`: `post` (a message with a quoted reply styled like a screenshot), `people` (a cast card) and `image` (a picture, or a dashed placeholder until `src` is set). Block text is added to the i panel.
- **Multi-select feedback.** Every right answer plus an extra no longer says 'You are still missing:' with an empty list. Options take an optional `why`; when any option has one, Submit shows every option with what the learner did and why. Options lock after Submit.
- **Version stamp** in the Studio header and in every exported file.

## v0.1

- First Studio: frozen engine plus scenario JSON, validator, model-answer grading, i and e buttons, session summary, dark and light themes.
