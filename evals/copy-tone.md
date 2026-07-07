# Eval: copy tone (FR-7 — the no-nanny rule, judgment half)

`src/__tests__/copy.test.ts` already blocks a banned-phrase list, exclamation
marks, and emoji. This eval catches what a word list can't: advisory or
emotional tone phrased politely.

## Rubric

A string PASSES when it only describes what is on screen or what happened.
A string FAILS when it does any of:

- advises, suggests, or nudges behavior (even softly)
- reassures, sympathizes, or evaluates the user's night for them
- celebrates, praises, or gamifies
- speaks for the user's feelings or future

## Labeled examples

| Candidate string                                                   | Verdict | Why                                            |
| ------------------------------------------------------------------ | ------- | ---------------------------------------------- |
| "No sleep data for this night."                                    | PASS    | States a fact.                                 |
| "Sleep data appears here after your first night wearing the ring." | PASS    | Describes mechanics, no nudging.               |
| "Could not reach the Oura API. Data shown was fetched earlier."    | PASS    | Factual error + factual consequence.           |
| "Your session expired. Log in with Oura to continue."              | PASS    | States what happened and the available action. |
| "No data yet — a good reason to get some rest tonight."            | FAIL    | Advises behavior.                              |
| "Rough night? Tomorrow is a fresh start."                          | FAIL    | Sympathizes, editorializes.                    |
| "Nice, a solid night of deep sleep."                               | FAIL    | Praises/evaluates.                             |
| "Remember to wear your ring so we can keep you on track."          | FAIL    | Nudges + "keep you on track" is coaching.      |
| "Sleep score unavailable. This can happen after a short night."    | PASS    | Explains a cause, doesn't soothe.              |

## Judge prompt (for automated scoring)

> You are reviewing UI strings for a sleep-data app whose hard requirement is
> that copy is descriptive and factual, never advisory, motivational, or
> emotional. For each string, answer PASS or FAIL with one sentence of
> reasoning. FAIL any string that advises, reassures, praises, nudges,
> evaluates the user's sleep for them, or projects feelings. Statements of
> fact about data, mechanics, or errors PASS.

## Procedure

1. Extract every leaf string from `src/copy/strings.ts`.
2. Score each with the judge prompt (or by hand against the rubric).
3. Gate: 100% PASS required — a single FAIL fails the eval, because one
   nannying string is exactly the failure mode this app exists to avoid.
