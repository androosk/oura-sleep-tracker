# Evals

The automated tests in `src/__tests__/` cover everything deterministic. The
criteria in this directory are judgment-based — tone, visual fidelity,
stranger-usability — and are verified by rubric instead.

| Eval                                               | Covers                                       | How it runs                                                         |
| -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| [copy-tone.md](copy-tone.md)                       | FR-7: descriptive, factual copy              | LLM judge (prompt included) or human, against `src/copy/strings.ts` |
| [ui-oura-likeness.md](ui-oura-likeness.md)         | US-005..US-011 "looks like Oura"             | Human, against simulator screenshots                                |
| [readme-stranger-test.md](readme-stranger-test.md) | US-013 README                                | Human checklist                                                     |
| [manual-verification.md](manual-verification.md)   | Live OAuth, offline, appearance, performance | Human, on simulator/device                                          |

Every eval states pass/fail anchors. A story is done only when its automated
tests are green AND its evals pass. Run all of these again during /gate.
