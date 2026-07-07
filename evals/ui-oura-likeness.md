# Eval: UI Oura-likeness (US-005..US-011 design criteria)

"Visually consistent with the Oura app" can't be unit-tested. Verify against
simulator screenshots, dark mode first (the primary target), then light.

## Reference

The official Oura app's sleep tab: near-black navy background, elevated card
surfaces, a thin ring gauge for the score, stage-colored hypnogram blocks,
understated sans-serif type, generous spacing, data-forward layout.

## Per-screen checklist (screenshot each in dark AND light)

### Home / last night

- [ ] Score ring is the visual anchor: thin stroke, score centered, band color matches the score
- [ ] Contributors read as a quiet list with value bars, not a table grid
- [ ] Hypnogram stages use 4 distinguishable colors; awake visually "above" deep
- [ ] HR/HRV charts are thin lines with visible gaps where data is missing
- [ ] Background is not pure black (#000) in dark mode; cards are one step lighter

### History

- [ ] Rows scan as date / score dot / duration without visual noise
- [ ] Score dot colors match the banding used on the ring

### Trends

- [ ] Period selector looks like a segmented control, not three buttons
- [ ] Charts are bars/lines with no gridline clutter

### Both modes

- [ ] Light mode is legible everywhere (contrast, dividers) — it derives from
      the same tokens, not a separate design
- [ ] No component renders a color that isn't a theme token (spot-check odd colors)

## Pass/fail anchors

- **PASS**: a regular Oura user opening the app would find the layout familiar
  and every screenshot item above checks out.
- **FAIL**: any screen reads as a default-styled RN app (system blue buttons,
  white cards on gray), or dark mode is an inverted afterthought.

Store screenshots under `evals/screenshots/<story>/` when running this.
