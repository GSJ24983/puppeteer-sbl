# Changelog

The Studio's version shows in its header, beside the title. Every exported scenario carries it too: hover 'Learn by deciding' in the top bar, or look for `<meta name="generator">` in the file. `index.html` is always the latest; `releases/` keeps a named copy of each version.

## v0.2 - 19 Oct 2026

- **Line breaks.** A `\n` in any text field shows as a line break, `\n\n` as a new paragraph.
- **Red flags.** Optional `redFlags {rule, phrases}` on a written node. Shown inside the folded rubric for the facilitator; never graded. The validator refuses a model answer that crosses its own red line.
- **Visual blocks.** Narrative screens, consequences and endings take `blocks`: `post` (a message with a quoted reply styled like a screenshot), `people` (a cast card) and `image` (a picture, or a dashed placeholder until `src` is set). Block text is added to the i panel.
- **Multi-select feedback.** Every right answer plus an extra no longer says 'You are still missing:' with an empty list. Options take an optional `why`; when any option has one, Submit shows every option with what the learner did and why. Options lock after Submit.
- **Version stamp** in the Studio header and in every exported file.

## v0.1

- First Studio: frozen engine plus scenario JSON, validator, model-answer grading, i and e buttons, session summary, dark and light themes.
