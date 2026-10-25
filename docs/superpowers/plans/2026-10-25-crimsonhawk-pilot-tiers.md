# CrimsonHawk Pilot Tier List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use superpowers:subagent-driven-development instead only if the user requests delegated execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal a spreadsheet-backed Pilots category inside Tier Lists after the existing CrimsonHawk Easter egg activates.

**Architecture:** Refresh a dedicated, validated JSON snapshot during deployment using the public Excel export. Restore the last successful deployment's snapshot before refreshing; retain it on expected download or source-format failures, with a checked-in snapshot for initial deployments and offline development. Pass the existing activation flag into TierListTab and render pilot rankings through a separate component using existing visual conventions.

**Tech Stack:** Existing Python 3.12/openpyxl, Python standard-library HTTP, React 19, Vite, Vitest/Testing Library, Playwright, and GitHub Actions. No added runtime dependencies or Google credentials.

**Spec:** The scope and contracts below are the specification for this plan, based on the feasibility assessment and the user's acceptance that deployed data is discoverable. This document plans the work; product implementation has not started.

## Global Constraints

- Source spreadsheet ID: `1RBLXWZDD-PmFxW4ChUOLNrzin8Gzxjp8tfw2gSeol8Y`.
- Download URL: `https://docs.google.com/spreadsheets/d/1RBLXWZDD-PmFxW4ChUOLNrzin8Gzxjp8tfw2gSeol8Y/export?format=xlsx`.
- Reveal only the pilot rankings. Ignore the workbook's Maps and Gamemodes sections.
- Keep the existing four-click activation, page-navigation behavior, and reset on full reload. Do not add persistence, a new route, or a new activation mechanism.
- Add a Pilots category to Tier Lists after activation. Keep the selected equipment category when activation occurs; do not navigate automatically.
- Preserve source tier labels, tier order, pilot names, and within-tier order. Do not infer power rankings, rationales, rarity, roles, or NEW badges.
- Keep `pilots.json` and the Pilot Skills route independent; they describe pilot skills, not these rankings.
- Use ordinary static assets. Discoverability in bundles and `/src/data/pilot_tiers.json` is accepted.
- Download only during deployment or an explicit local refresh. Unit tests, PR CI, normal builds, and browsers must not contact Google for this feature.
- Preserve current deployment triggers and existing core-data failure behavior. Only the optional pilot refresh gets a recoverable fallback.

## Scope and behavior decisions

These are implementation defaults proposed by this plan, not additional user requirements:

- Pilot cards are static portraits and names, without detail modals. The sheet contains no per-pilot rationales.
- Use the copy `CrimsonHawk's personal pilot rankings, just for fun.` when Pilots is selected, plus a `View source spreadsheet` link. Keep the page heading `Tier Lists`.
- Reuse available portraits through exact normalized matches and verified aliases. Use a neutral placeholder for absent, ambiguous, or failed images; do not guess pilot variants through substring matching.
- Preserve duplicate entries, including conflicts across tiers, and warn in CI. The source currently lists Jad Parkes twice; no tier is silently chosen for the author.
- A failed refresh leaves snapshot bytes and the successful fetch timestamp unchanged. An invalid fallback combined with a failed refresh is fatal, rather than publishing broken data.
- No lazy-loading machinery solely to conceal this small dataset. Import the JSON with the existing lazy tier-list route.

## Review Focus

- A login/error HTML response, timeout, or malformed workbook must leave a valid snapshot intact: Task 1 refresh tests.
- Moving or renaming the worksheet must not break extraction; missing or ambiguous Pilots headings must reject the update: Task 1 parser tests.
- Duplicate rankings, accented names, quotes, and parenthesized pilot variants must survive parsing without silent edits: Tasks 1 and 3 tests.
- Activation on another route must reveal Pilots when visiting Tier Lists, while three clicks or the Adazahi egg must not: Task 4 integration tests.
- Long tier labels and missing/broken portraits must remain readable at 390px without page overflow: Tasks 3 and 4 tests/browser checks.

## Data contract and file boundaries

`src/data/pilot_tiers.json` is a tracked fallback and the build-time refresh destination:

```json
{
  "schemaVersion": 1,
  "sourceUrl": "https://docs.google.com/spreadsheets/d/1RBLXWZDD-PmFxW4ChUOLNrzin8Gzxjp8tfw2gSeol8Y/edit#gid=0",
  "fetchedAt": "<actual successful fetch time in UTC ISO 8601, ending in Z>",
  "tiers": [
    { "label": "Hot", "items": [{ "name": "Erika Storm" }] }
  ]
}
```

The example illustrates shape, not the complete dataset. Require schema version 1, the exact source URL, a valid UTC fetch timestamp, a nonempty tiers array, nonempty unique tier labels, and a nonempty items array of nonempty names for each tier. Allow duplicate pilot names and report them separately. Future source edits may change counts and labels: do not hardcode nine tiers or 163 entries into production validation.

| File | Responsibility |
| --- | --- |
| Create `scripts/pilot_tiers.py` | Import-safe workbook parser, validation, public download, atomic refresh, and CLI |
| Create `scripts/tests/test_pilot_tiers.py` | Offline parser/refresh/fallback contract tests |
| Create `src/data/pilot_tiers.json` | Complete validated snapshot from the source |
| Create `src/utils/pilotTiers.js` and `.test.js` | Pure JSON-contract validation shared by data validation and tests |
| Modify `scripts/validate_data.js` | Require and validate the new snapshot |
| Modify `.github/workflows/deploy.yml` | Restore prior published snapshot and attempt an optional refresh before validation/build |
| Modify `scripts/verify_build.js` | Require the published pilot JSON endpoint |
| Create `src/components/tiers/PilotTierList.jsx`, `.css`, and `.test.jsx` | Custom-label rows, source link, portrait cards, and empty-search state |
| Create `src/utils/pilotTierImages.js` and `.test.js` | Exact pilot portrait lookup and verified aliases, isolated from existing build-guide lookup |
| Modify `src/components/tiers/TierListTab.jsx` and `.test.jsx` | Conditional Pilots category and selection/search integration |
| Modify `src/App.jsx` and `src/App.test.jsx` | Forward existing CrimsonHawk activation to TierListTab |
| Create `tests/browser/pilot-tiers.spec.js` | Actual footer activation, routing, reload, responsive behavior, and no Google runtime dependency |
| Modify `README.md` | Refresh command, fallback behavior, source layout, and artwork limitations |

Leave `scripts/fetch_gdrive.py`, `scripts/parse_data.py`, existing equipment image helpers, and the core tier renderer unchanged. In particular, do not put this workbook in `sample data/`: the existing fuzzy filename matching can mistake another tier workbook for the primary equipment sheet. `scripts/prerender.js` already copies every data JSON and needs no change.

### Task 1: Parse and validate a standalone pilot snapshot

**Interfaces:**
- `parse_pilot_tiers(workbook, *, fetched_at: str) -> dict` accepts an openpyxl workbook and returns the contract above. Duplicate-name diagnostics use Python warnings; names are preserved.
- `validate_pilot_tiers(data: object) -> list[str]` returns schema errors; an empty list means valid.
- `download_workbook() -> bytes` fetches the fixed export URL with a 10-second request timeout, at most three attempts for transient network/429/5xx failures, and a 2 MiB response limit. Reject permanent HTTP failures without retrying.
- `refresh_pilot_tiers(output: Path, *, fetch=download_workbook) -> bool` returns true for an atomically published update and false for a recoverable failure with a validated existing fallback. Raise if neither source nor fallback is usable. Catch expected HTTP, I/O, ZIP, workbook-format, and validation failures; do not hide programming errors.
- `validatePilotTiers(data: unknown): string[]` in `src/utils/pilotTiers.js` implements the same JSON contract with no browser globals or I/O.
- CLI modes: `--refresh`, `--input PATH`, or `--validate PATH`; `--output PATH` defaults to `src/data/pilot_tiers.json` for refresh/input modes. Refresh fallback emits a GitHub Actions warning and exits 0; no usable snapshot exits nonzero.

- [ ] **Step 1: Write offline failing parser and refresh tests.** Construct temporary workbooks in Python; mock HTTP/fetch and sleep. Cover extraction with Maps/Gamemodes present; worksheet rename and row movement; one case-insensitive, whitespace-trimmed Pilots heading across the workbook; missing/ambiguous heading; malformed/empty tier; blank rows; and a subsequent section heading. Assert that only the pilot section is emitted and source order is preserved.

  Pin the parser contract in `test_parse_moved_pilots_preserves_source_text`: use a renamed worksheet, `A40 = ' Pilots '`, and these source rows, surrounded by Maps/Gamemodes sections. Assert:

  ```python
  self.assertEqual(data['tiers'], [
      {'label': 'Hot', 'items': [{'name': 'Erika Storm'}, {'name': 'Sophie Kovač'}]},
      {'label': 'Get out', 'items': [{'name': 'Jad Parkes'}, {'name': 'Yang Lee (Harpy / Siren)'}]},
  ])
  self.assertEqual(validate_pilot_tiers(data), [])
  ```

- [ ] **Step 2: Run the new Python test file and confirm failures identify missing production interfaces.** Run `python -m unittest discover -s scripts/tests -p 'test_pilot_tiers.py' -v`.
- [ ] **Step 3: Implement extraction and validation.** Find the single Pilots heading rather than selecting a fixed sheet name or row. Read labels from column A and comma-separated names from B; trim surrounding whitespace only and skip fully blank rows. Stop at the known Maps/Gamemodes headings; reject other nonempty labels with no names. Reject numeric/error/formula cells where literal text is required. Preserve accents, apostrophes, quotes, slashes, and parenthesized variants. Warn about repeated normalized names without deleting entries. Close workbook resources.
- [ ] **Step 4: Implement bounded download and atomic refresh.** Parse/validate in memory, then write to a temporary file next to the output and replace only after success. Test valid download; HTML response; corrupt XLSX; 403/404; transient retries; response-size limit; exhausted timeout; fallback timestamp/bytes unchanged; invalid fallback with valid source; both invalid; and output-write failure without clobbering an existing snapshot. Permission/disk failures remain fatal.
- [ ] **Step 5: Add the JS validator and its failing-then-passing tests.** Use the same valid/invalid contract examples as Python: missing fields, invalid schema/source/timestamp, empty labels/items, duplicate labels, and allowed duplicate names. Wire it into `scripts/validate_data.js`; report errors through the existing `addError` mechanism without changing other validators.
- [ ] **Step 6: Generate the complete tracked snapshot from a fresh successful public download.** Record the real fetch time; do not invent or reuse the example timestamp. Confirm it contains only pilot tiers and that duplicate diagnostics appear. Current source counts are a review aid, not a future invariant. Keep downloaded XLSX files outside the repository.
- [ ] **Step 7: Verify and commit this deliverable.** Run the Python test command above, `npx vitest run src/utils/pilotTiers.test.js`, and `npm run validate:data`. Require passing tests and no pilot schema errors; distinguish existing unrelated catalog warnings. Suggested commit: `feat: add validated pilot tier snapshot ingestion`.

### Task 2: Refresh pilot rankings safely during deployment

**Interfaces:**
- Consumes Task 1's CLI and tracked fallback.
- Publishes `dist/src/data/pilot_tiers.json` through the existing data-copy mechanism.
- A valid previous published snapshot takes precedence over the checked-in seed when live refresh fails.

- [ ] **Step 1: Extend the existing successful-deployment restore step.** After the existing `gh-pages` fetch, attempt to read `FETCH_HEAD:src/data/pilot_tiers.json` into a temporary file. Validate using `python scripts/pilot_tiers.py --validate PATH` before replacing the working snapshot. A missing legacy file is normal; an invalid published pilot file emits a warning and keeps the tracked seed. Preserve the current handling of equipment-history errors. Do not execute any content from the fetched branch.
- [ ] **Step 2: Add `Refresh optional CrimsonHawk pilot tiers` after restoration and before data validation/build.** Run `python scripts/pilot_tiers.py --refresh`. Rely on the CLI's explicit validated fallback behavior; do not use blanket `continue-on-error`, which could hide a missing or corrupt final dataset. Do not change Google secrets, core Drive sync, or the schedule.
- [ ] **Step 3: Require the new published JSON in `scripts/verify_build.js`.** Add `pilot_tiers.json` to the existing endpoint checks. Normal `npm run build` must work from the tracked snapshot without downloading anything.
- [ ] **Step 4: Document refresh and recovery in README.** Include the source link, `python scripts/pilot_tiers.py --refresh`, deployment-only network access, source layout expectations, duplicate warnings, and fallback precedence: fresh validated download, previous validated deployment, tracked seed. Failed refreshes keep the actual last-success timestamp. No automated commits or extra cache service.
- [ ] **Step 5: Verify failure recovery using disposable files.** Exercise the CLI tests from Task 1 for success, valid-fallback failure, and no-valid-fallback failure. In a temporary local Git repository, use the workflow's exact restore commands with a `gh-pages` fixture containing valid, absent, and malformed pilot JSON. Assert validation controls replacement in all three cases. Run `npm run build` and verify the endpoint exists. Do not dispatch a live deployment merely to test this task. Suggested commit: `ci: refresh optional pilot tiers with validated fallback`.

### Task 3: Render pilot rankings with custom labels and reliable portraits

**Interfaces:**
- `PilotTierList({ data, searchQuery })` consumes the Task 1 contract and the parent search string. It renders the pilot introduction, source link, ordered tier rows, and static cards; it does not manage category state or call `onItemClick`.
- `getPilotTierImage(name: string): string | null` uses the existing `image_manifest.json` pilot dictionary with Unicode-normalized exact keys and a small explicit alias table.
- Parent data remains separate from `optimizedTiersData`; no equipment-tier metadata is synthesized.

- [ ] **Step 1: Write failing component and image-resolution tests.** A synthetic dataset should demonstrate custom-label order, literal source names, case-insensitive name search, duplicate names across tiers, no matching names, absent images, image load failure, accented names, and variant names that must not fall back to a different pilot portrait. Static cards must not expose button semantics or open dialogs.
- [ ] **Step 2: Run `npx vitest run src/components/tiers/PilotTierList.test.jsx src/utils/pilotTierImages.test.js` and confirm the missing interfaces fail.**
- [ ] **Step 3: Implement exact image lookup.** Normalize using NFKD, remove combining marks, lowercase, and remove non-ASCII alphanumerics for lookup only. Keep displayed source names unchanged. Add aliases only where the source name and an existing portrait can be verified as the same pilot/variant; ambiguous variants return null. Preserve all existing build-guide image behavior by keeping this helper separate.
- [ ] **Step 4: Implement the pilot renderer and scoped CSS.** Preserve source order and custom labels; use semantic lists/headings and keys that remain unique when names repeat. Reuse existing theme tokens and row/card proportions, with wrapped names and tier labels. Apply the existing `X,S,A,B,C,D,E,F,Z` color palette by row position, clamped at the last color for additional tiers; these are visual colors only, not displayed letter ranks. Use a neutral CSS portrait placeholder for missing/failed artwork. Hide empty rows during search and show `No pilots match your search.` when all are filtered out.
- [ ] **Step 5: Verify and commit this deliverable.** Rerun the focused tests and `npm run lint`. Require all cases to pass. Suggested commit: `feat: render custom pilot tier rows and portrait fallbacks`.

### Task 4: Reveal the Pilots category through the existing Easter egg

**Interfaces:**
- Extend `TierListTab({ onItemClick, isEasterEggActive = false })`.
- For the `tiers` route only, App supplies `{ onItemClick: openItemDetails, isEasterEggActive }`; preserve all other route props.
- Append `{ label: 'Pilots', value: 'Pilots' }` to existing category tabs only when activated. Render Task 3's component only when that category is selected. Use the existing search control with `Search pilots in tier lists...`.

- [ ] **Step 1: Add failing TierListTab and App integration tests.** Assert Pilots is absent by default, revealed on activation without changing selection, selectable after activation, and uses the existing search reset when switching categories. When Pilots is selected, omit the equipment power-ranking copy and Tier Tag Guide/RoleGuide. Verify returning to Robots restores the normal copy, legend, search, and detail behavior. Extend App's tier-component mock to expose the received flag and assert that the fourth CrimsonHawk click forwards true.
- [ ] **Step 2: Run `npx vitest run src/App.test.jsx src/components/tiers/TierListTab.test.jsx` and confirm the new assertions fail.**
- [ ] **Step 3: Wire the flag and pilot branch.** Import the pilot JSON and renderer in TierListTab, append the conditional category, and keep the normal renderer isolated behind the equipment-category branch. Preserve existing React hook ordering. If a test rerenders with the flag false while Pilots was selected, derive Robots as the effective category so hidden pilot content does not remain visible.
- [ ] **Step 4: Add `tests/browser/pilot-tiers.spec.js`.** Use the actual footer and category buttons. Confirm three clicks do not reveal Pilots; the fourth does; activation from the homepage carries into `/tiers`; in-app navigation preserves activation; reload hides Pilots again; and activating only Adazahi does not reveal it. Check source link, search, source tier order, and regular equipment detail dialogs after switching back. Read expected labels/names from the tracked dataset where appropriate rather than requiring today's complete source contents forever.

  In `four CrimsonHawk clicks reveal Pilots until reload`, begin at `/tiers` and pin the activation boundary with the real footer:

  ```javascript
  const pilots = page.getByRole('button', { name: 'Pilots', exact: true });
  const credit = page.locator('footer').getByText('CrimsonHawk', { exact: true });
  for (let i = 0; i < 3; i++) await credit.click();
  await expect(pilots).toHaveCount(0);
  await credit.click();
  await expect(pilots).toBeVisible();
  await pilots.click();
  await expect(page.getByPlaceholder('Search pilots in tier lists...')).toBeVisible();
  await page.reload();
  await expect(pilots).toHaveCount(0);
  ```

- [ ] **Step 5: Exercise desktop and mobile failure cases.** Block Google spreadsheet requests and confirm the feature remains usable. Simulate a failed pilot portrait and confirm its placeholder. At the existing 390px viewport, assert document width does not exceed viewport width and long labels/names remain visible. Inspect a screenshot at 390px and the desktop viewport; fix layout issues before completion.
- [ ] **Step 6: Run the complete relevant verification once.** Run `python -m unittest discover -s scripts/tests -v`, `npm run validate:data`, `npm run lint`, `npm test`, and `npm run test:browser` (which includes the production build). Require passing results; report any pre-existing data warnings separately. Confirm `dist/src/data/pilot_tiers.json` satisfies the new validator and no frontend fetch of the source spreadsheet exists. Do not trigger CI/deployment, publish, or merge as part of planning or local verification.
- [ ] **Step 7: Commit and hand over the reviewable result.** Suggested commit: `feat: unlock pilot tier list with CrimsonHawk easter egg`. Report verification, remaining portrait gaps, source duplicate warnings, and that live GitHub-runner behavior has not been verified unless an actual authorized run was observed.

## Completion criteria

- Four existing CrimsonHawk clicks reveal a functional Pilots category in Tier Lists; it remains hidden during ordinary browsing and after reload.
- Rankings preserve the spreadsheet's pilot section and custom labels, with usable search and readable desktop/mobile cards.
- Missing artwork and duplicate rankings do not break the experience or silently change source meaning.
- Deployment refreshes a small static JSON snapshot, tolerates expected optional-source outages using validated fallback data, and preserves existing core-data validation.
- PR tests and normal builds remain independent of spreadsheet availability; existing guide categories and Pilot Skills behavior pass regression checks.

## Plan self-review

- Scope coverage: source acquisition and validation are owned by Task 1; continuity across deployments by Task 2; source presentation/artwork by Task 3; activation, routing, and regression verification by Task 4.
- Interface consistency: the JSON contract, Python CLI modes, JS validator, renderer props, and activation prop are defined once above and consumed by later tasks.
- Failure coverage: every Review Focus item has a named owning test step; rollback, invalid fallback, and write failures are explicit.
- Boundaries: no core parser refactor, credential changes, new backend, fabricated pilot rationales, new artwork collection, or unrelated Easter-egg changes.
- Execution is a separate follow-up. No product files, workflows, source data, dependencies, or Git history are changed by this planning task.
