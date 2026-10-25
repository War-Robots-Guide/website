# Guide data and display fixes

Approved scope: the ten-point plan in the chat. Implement in the current checkout;
leave the changes available for review without publishing or merging.

## Tasks

- [x] Read the DPS Intro version and dedicated methodology document. Persist
  normalized first-seen item history with successful deployments; new badges
  contain only the current version's additions, across all categories.
- [x] Normalize wrapped equipment options and module abbreviations. Render
  pilot/drone notes with their item and passive/active modules in separate boxes.
- [x] Use explicit specialization recommendations and exact module image aliases;
  preserve robot/Titan/Ultimate distinctions and report unavailable artwork.
- [x] Render every weapon family member on tier lists; fix Sword image aliases
  and T4 orange / Ultimate gold colors.
- [x] Share disclosure styling/placement and update build/DPS copy and metadata.
- [x] Regenerate data; run Python/frontend tests, data validation, lint, build,
  browser checks, and an independent review.

## Decisions and verification

The DPS workbook's `Intro!A3` is currently v12.3. Initial known items are a baseline,
not newly discovered equipment. Only verified version-labelled seed records get
initial badges. Subsequent additions are tracked by normalized category/name;
reranking, tags, and artwork changes do not make an item new. Deployment state
lives in the published branch, read via Git before parsing and advanced only by
a successful deployment. Local parsing uses the tracked baseline or prior local
state. No runtime AI or inference from arbitrary module commentary.

Regression cases: version rollover without additions; same-version accumulation;
reruns, aliases, removals and reintroductions; Nuo and Dedopali drone notes;
Lynx's wrapped pilot name; UE Sword conditional pilots; robot/Titan/Ultimate
module context; two/three-member weapon families including period separators;
keyboard disclosures; mobile layout. Baseline: 248 frontend and 28 Python tests.

## Progress

- Exploration complete; clean starting tree at a518e21.

- Implementation complete in the current checkout on `codex/guide-data-ui-fixes`.
- Source JSON regenerated from the current local documents; current v12.3 history
  was seeded after regeneration so spelling corrections do not become new items.
- Author confirmed BU means Grand Balanced Reactor. Ultimate builds use the
  Ultimate Titan Grand Balanced Reactor image.
- Review: independent reviewer found one P2 (robot active QS resolving to Titan
  Quantum Sensor). Fixed with a failing-then-passing regression; paired Anaksor
  QR source establishes Quantum Radar as the robot active choice. Unknown active
  choices preserve source text without passive artwork.
- Verification: 263 frontend tests, 29 Python tests, lint and production build
  passed. Data schema validation passed with 63 nonblocking catalog/DPS coverage
  warnings. All exposed tier weapon names and concrete build modules resolve.
- Browser verification: complete Nuo notes, conditional Sword pilots and loaded
  Ultimate Sword artwork, explicit specialization images, zero NEW turret badges,
  matching 42px search/disclosure controls, and stacked boxes at 390px width.
- Initial implementation was left locally reviewable. The author subsequently
  requested a conventional commit and local merge into master.
