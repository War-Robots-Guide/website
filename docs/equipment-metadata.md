# Equipment metadata

Power rankings (X–Z) and equipment rarity (T1–T4/Ultimate) are separate.
`src/data/equipment_rarities.json` records rarity by category and item name.
Family portraits use the first member's rarity, matching the artwork lookup.
Unknown items stay neutral until their rarity is recorded. Robots use the
source guide's sheet classifications; legacy robots and titans retain their
existing explicit mappings in `equipmentTiers.js`.

The palette uses orange for T4 and gold for Ultimate, alongside gray, blue and
purple for T1–T3. These represent equipment rarity, independently of power ranks.
Drone tiers follow the [8.8 migration table](https://warrobots.com/en/posts/364),
including the T3 Wasp drone retained in the source library. Rarity is never
inferred from the power-ranking letter. Older weapon exceptions such as
[Flux (T3)](https://warrobots.wiki/info/weapons/wflux) are recorded explicitly.

`parse_data.py` reads the **Currently updated for War Robots vX.X** marker from
the DPS workbook's Intro sheet and writes `game_version.json`. A missing or
ambiguous marker fails parsing. `content_metadata.py` tracks normalized item
names across every tier-list category in `equipment_newness.json`. Each item
retains its first-seen version, including items removed and later reintroduced.
Tags, rankings, image changes and known spelling/name aliases do not reset it.

The workbook marker tracks source coverage; it does not determine NEW badges.
`equipment_updates.py` refreshes `equipment_updates.json` from the publisher's
[official Steam news feed](https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=767560&count=50&maxlength=0&feeds=steam_community_announcements).
It selects the highest released update version, reads new-equipment overview
bullets, expands weapon weight families, and resolves Ultimate/special editions
against their base equipment. Balance changes and pilot mentions do not count.
The deploy workflow refreshes this metadata after parsing, on every deploy and
daily scheduled run. A failed news refresh fails the deployment instead of
silently publishing stale badges. Refresh locally with
`venv/bin/python scripts/equipment_updates.py`.

The frontend shows NEW only for equipment introduced in the latest recorded
game update, across every category. Categories without new equipment have no
badges. Republished older notes cannot roll the version back. The tag dropdown
displays the badge's update version. Items not yet in the guide appear only when
the source tier lists add them; this refresh never inserts or ranks equipment.

Existing catalog items start as an unbadged baseline. Version-labelled records
in `equipment_updates.json` seed known release cohorts, with source links. The
12.3/12.4 records were checked against official patch notes. Records without a
version never imply newness. The latest cohort is refreshed automatically;
historical records remain available to seed discovery history.

The deploy workflow restores history from the last successful `gh-pages`
deployment before parsing. `prerender.js` already publishes data JSON, so history
advances with the site only after checks pass and deployment succeeds. Missing
history on the first migration uses the committed baseline. Git/network errors
fail the workflow. Local parsing uses the committed or previously generated
history. Keep this file when refreshing local inputs.

Artwork is independent of badges. `sync_images.py` also copies the current
badge lists into the image manifest for compatibility with older consumers.
The frontend reads `equipment_updates.json` directly.

Methodology comes from `Methodology text.docx`, not workbook layout instructions.
Build equipment choices preserve wrapped names and parenthetical notes.
`moduleCatalog.js` expands known abbreviations; specialization detail thumbnails
come from explicit recommendations in `specializations/recommendations.js`, not
from every module mentioned in explanatory text. BU in Ultimate Titan builds
means Ultimate Titan Grand Balanced Reactor, as confirmed by the guide author.
The Anaksor source uses QS in one robot active-module field and QR in its paired
build; this context resolves to Quantum Radar. Titan passive Quantum Sensor is
kept separate. Unknown active choices retain their source text without artwork.

`parse_data.py` extracts role definitions and hangar advice from the source
workbook's Bot Roles and Titan Roles sheets into `robot_guide.json.role_guide`.
Edit the workbook to update those descriptions; do not hand-edit generated
role-guide text.
