# Equipment metadata

Power rankings (X–Z) and equipment rarity (T1–T4/Ultimate) are separate.
`src/data/equipment_rarities.json` records rarity by category and item name.
Family portraits use the first member's rarity, matching the artwork lookup.
Unknown items stay neutral until their rarity is recorded. Robots use the
source guide's sheet classifications; legacy robots and titans retain their
existing explicit mappings in `equipmentTiers.js`.

The standard palette follows the [official item tier system](https://warrobots.com/en/posts/346).
Drone tiers follow the [8.8 migration table](https://warrobots.com/en/posts/364),
including the T3 Wasp drone retained in the source library. Rarity is never
inferred from the power-ranking letter. Older weapon exceptions such as
[Flux (T3)](https://warrobots.wiki/info/weapons/wflux) are recorded explicitly.

`src/data/equipment_updates.json` supplements the guide's editorial changelog
with dated equipment additions and their source links. Add a record when a
release introduces equipment missing from that changelog. Dates order the
addition records within each category; multiple additions on the same date
share the badge. Records are filtered against the current tier-list catalog,
so unlisted items do not receive badges. Future patches require corresponding
records when the guide does not record their additions.

`sync_images.py` generates `new_tier_items_by_category` using those records and
initial “Added …” lists in the guide changelog. Each category keeps its latest
recorded additions. Recommendation edits and trailing balance commentary do
not introduce items. The flat `new_tier_items` list remains for consumers that
do not supply a category.

`parse_data.py` extracts role definitions and hangar advice from the source
workbook's Bot Roles and Titan Roles sheets into `robot_guide.json.role_guide`.
Edit the workbook to update those descriptions; do not hand-edit generated
role-guide text.
