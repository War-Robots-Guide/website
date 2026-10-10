import os
import sys
import json
import shutil
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(script_dir)
sample_images_dir = os.path.join(workspace_dir, "sample images")
public_images_dir = os.path.join(workspace_dir, "public", "images")
manifest_path = os.path.join(workspace_dir, "src", "data", "image_manifest.json")
robot_guide_path = os.path.join(workspace_dir, "src", "data", "robot_guide.json")
weapons_dps_path = os.path.join(workspace_dir, "src", "data", "weapons_dps.json")
tiers_path = os.path.join(workspace_dir, "src", "data", "tiers.json")

def clean_key(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def sync_images():
    os.makedirs(public_images_dir, exist_ok=True)
    items_dest = os.path.join(public_images_dir, "items")
    icons_dest = os.path.join(public_images_dir, "icons")
    os.makedirs(items_dest, exist_ok=True)
    os.makedirs(icons_dest, exist_ok=True)

    copied_count = 0
    # Copy from sample images if present, trimming transparent borders with PIL
    all_items_src = os.path.join(sample_images_dir, "ALL ITEMS")
    if os.path.exists(all_items_src):
        for f in os.listdir(all_items_src):
            src_f = os.path.join(all_items_src, f)
            if os.path.isfile(src_f):
                dst_f = os.path.join(items_dest, f)
                if not os.path.exists(dst_f) or os.path.getsize(dst_f) != os.path.getsize(src_f):
                    try:
                        from PIL import Image
                        im = Image.open(src_f)
                        bbox = im.getbbox()
                        if bbox:
                            w, h = im.size
                            pad = 4
                            padded_bbox = (
                                max(0, bbox[0] - pad),
                                max(0, bbox[1] - pad),
                                min(w, bbox[2] + pad),
                                min(h, bbox[3] + pad)
                            )
                            cropped = im.crop(padded_bbox)
                            cropped.save(dst_f, optimize=True)
                        else:
                            shutil.copy2(src_f, dst_f)
                    except Exception:
                        shutil.copy2(src_f, dst_f)
                    copied_count += 1

    icons_src = os.path.join(sample_images_dir, "Icons")
    if os.path.exists(icons_src):
        for f in os.listdir(icons_src):
            src_f = os.path.join(icons_src, f)
            if os.path.isfile(src_f):
                dst_f = os.path.join(icons_dest, f)
                if not os.path.exists(dst_f) or os.path.getsize(dst_f) != os.path.getsize(src_f):
                    shutil.copy2(src_f, dst_f)
                    copied_count += 1

    print(f"Synced {copied_count} new/updated images to public/images/")

    # Build index of available items
    item_files = os.listdir(items_dest) if os.path.exists(items_dest) else []
    icon_files = os.listdir(icons_dest) if os.path.exists(icons_dest) else []
    
    file_lookup = {f.lower(): f for f in item_files}

    manifest = {
        "items": {},
        "weapons": {},
        "pilots": {},
        "drones": {},
        "modules": {},
        "icons": {},
        "all_files": {},
        "new_tier_items": []
    }

    for f in icon_files:
        stem = os.path.splitext(f)[0]
        manifest["icons"][clean_key(stem)] = f"/images/icons/{f}"

    # Load data for intelligent matching
    robot_guide = {}
    if os.path.exists(robot_guide_path):
        with open(robot_guide_path, 'r', encoding='utf-8') as f:
            robot_guide = json.load(f)

    weapons_dps = {}
    if os.path.exists(weapons_dps_path):
        with open(weapons_dps_path, 'r', encoding='utf-8') as f:
            weapons_dps = json.load(f)

    # 1. Match Robots and Titans
    # CRITICAL: Non-Ultimate robots must NEVER match Ultimate images (e.g. Bulgasari -> Ultimate Bulgasari)!
    all_units = robot_guide.get('robots', []) + robot_guide.get('titans', [])
    for u in all_units:
        name = u.get('name', '')
        if not name:
            continue
        clean_name = re.sub(r'[\u2b06\u2b07\ud83d\udc41\ufe0f\*]', '', name).strip()
        is_ue = clean_name.lower().startswith('ue ') or clean_name.lower().startswith('ultimate ')

        if is_ue:
            ue_base = clean_name[3:].strip() if clean_name.lower().startswith('ue ') else clean_name[9:].strip()
            candidates = [
                f"ultimate {ue_base}.png".lower(),
                f"ue {ue_base}.png".lower(),
                f"{clean_name}.png".lower()
            ]
            if clean_name.lower() == 'ue sword unit':
                candidates.extend(['ultimate sword.png', 'ultimate sword unit.png'])
        else:
            # Non-Ultimate: ONLY match standard robot image! Never match "ultimate <name>.png"
            candidates = [
                f"{clean_name}.png".lower(),
                f"{clean_name.replace(' ', '')}.png".lower(),
            ]
            if clean_name.lower() == 'omen vulcan':
                candidates.append('vulcan.png')
            if clean_name.lower() == 'sword unit':
                candidates.append('sword unit.png')

        matched_file = None
        for c in candidates:
            if c in file_lookup:
                matched_file = file_lookup[c]
                break

        if matched_file:
            path = f"/images/items/{matched_file}"
            manifest["items"][clean_key(name)] = path
            manifest["items"][clean_key(clean_name)] = path

    # 2. Index all weapon and item files directly from disk into manifest
    for f in item_files:
        stem = os.path.splitext(f)[0]
        fpath = f"/images/items/{f}"
        lower_f = f.lower()

        if lower_f.startswith("drone "):
            drone_name = stem[6:].strip()
            manifest["drones"][clean_key(drone_name)] = fpath
        elif lower_f.startswith("module_passive "):
            mod_name = stem[15:].strip()
            manifest["modules"][clean_key(mod_name)] = fpath
        elif lower_f.startswith("module_active "):
            mod_name = stem[14:].strip()
            manifest["modules"][clean_key(mod_name)] = fpath
        elif lower_f.startswith("pilot_legend_"):
            p_name = stem[13:].replace("_mini", "").replace("_", " ").strip()
            manifest["pilots"][clean_key(p_name)] = fpath
        elif lower_f.startswith("pilot_titan_"):
            p_name = stem[12:].replace("_mini", "").replace("_", " ").strip()
            manifest["pilots"][clean_key(p_name)] = fpath
        else:
            # Standalone weapon / gear / ship file
            clean_stem = clean_key(stem)
            manifest["all_files"][clean_stem] = fpath
            manifest["weapons"][clean_stem] = fpath

            # Also index with UE alias if starts with Ultimate
            if lower_f.startswith("ultimate "):
                base_stem = clean_key(stem[9:])
                manifest["weapons"][f"ue{base_stem}"] = fpath
                manifest["weapons"][f"ultimate{base_stem}"] = fpath

            # If weapon ends with H/M/L/A/B suffix (e.g. HarmattanH, LumenM, ArmL, BarqA)
            m = re.match(r'^(.+?)([hmlab])$', clean_stem, re.IGNORECASE)
            if m:
                base_w, sfx = m.groups()
                manifest["weapons"][f"{base_w}_{sfx.lower()}"] = fpath
                manifest["weapons"][base_w] = fpath

    # Special weapon name mappings
    special_weapons = {
        "iaraghil": "/images/items/IaraghL.png",
        "iaraghl": "/images/items/IaraghL.png",
        "iaraghim": "/images/items/IaraghiM.png",
        "iaraghih": "/images/items/IaraghiH.png",
        "lumenl": "/images/items/LumenL.png",
        "lumenm": "/images/items/LumenM.png",
        "lumenh": "/images/items/LumenH.png",
        "harmattanl": "/images/items/HarmattanL.png",
        "harmattanm": "/images/items/HarmattanM.png",
        "harmattanh": "/images/items/HarmattanH.png",
        "arml": "/images/items/ArmL.png",
        "armm": "/images/items/ArmM.png",
        "barqa": "/images/items/BarqA.png",
        "barqb": "/images/items/BarqB.png",
        "farenheit": "/images/items/Fahrenheit.png",
        "fahrenheit": "/images/items/Fahrenheit.png",
    }
    for k, p in special_weapons.items():
        if os.path.exists(os.path.join(workspace_dir, "public", p.lstrip('/'))):
            manifest["weapons"][k] = p

    # Special module aliases
    module_aliases = {
        "accelerator": "robot accelerator",
        "robot accelerator": "robot accelerator",
        "overdrive": "overdrive unit",
        "overdrive unit": "overdrive unit",
        "titan overdrive": "titan overdrive",
        "titan overdrive unit": "titan overdrive",
        "last stand": "last stand",
        "titan last stand": "titan last stand",
        "repair amplifier": "repair amplifier",
        "titan repair amplifier": "titan repair amplifier",
        "nuclear amplifier": "nuclear amplifier",
        "titan nuclear amplifier": "titan nuclear amplifier",
        "immune amplifier": "immune amplifier",
        "titan immune amplifier": "titan immune amplifier",
        "anticontrol": "anticontrol",
        "titan anticontrol": "titan anticontrol",
        "heavy armor kit": "heavy armor kit",
        "quantum sensor": "quantum sensor",
        "cannibal reactor": "cannibal reactor",
        "phase shift": "phase shift",
        "repair unit": "repair unit",
        "advanced repair unit": "advanced repair unit",
        "unstable conduit": "unstable conduit",
        "lock down ammo": "lock down ammo",
        "death mark": "death mark",
        "shieldbreaker": "shieldbreaker",
        "quantum radar": "quantum radar",
        "fortifier": "fortifier",
        "integrated power unit": "integrated power unit",
        "titan slayer": "titan slayer",
        "rangefinder": "rangefinder",
        "beacon operator": "beacon operator",
        "cloaking unit": "cloaking unit",
        "self fix unit": "self fix unit",
        "titan self fix unit": "titan self fix unit",
        "onslaught unit": "onslaught unit",
        "damage controller": "damage controller",
    }
    for alias, target in module_aliases.items():
        target_k = clean_key(target)
        if target_k in manifest["modules"]:
            manifest["modules"][clean_key(alias)] = manifest["modules"][target_k]

    # Special pilot aliases
    pilot_aliases = {
        "ash skarsgard": "ashskarsgard",
        "a5h-5k4r": "ashskarsgard",
        "olga minina": "olgaminina",
        "olga minima": "olgaminina",
        "sati cat": "satifelidae",
        "monique lenormand": "moniquelenormands",
        "lenormond": "moniquelenormands",
        "kyle rogers": "kylerogers",
    }
    for alias, target in pilot_aliases.items():
        if target in manifest["pilots"]:
            manifest["pilots"][clean_key(alias)] = manifest["pilots"][target]

    # 4. Determine newest items added to Tier List based on changelog
    changelog = robot_guide.get('changelog', [])
    all_unit_names = {u.get('name', '').lower() for u in all_units}
    newest_items = []
    
    added_pattern = re.compile(r'added\s+([A-Za-z0-9\s,\/&]+?)(?:\s*(?:at|to|in|\bfor\b|-|\.|\n)|$)', re.IGNORECASE)
    for entry in reversed(changelog):
        text = entry.get('text', '')
        matches = added_pattern.findall(text)
        for m in matches:
            items = re.split(r'[,&/\n]|(?:\band\b)', m)
            for item in items:
                clean_item = item.strip()
                if clean_item.lower() in all_unit_names:
                    newest_items.append(clean_item)
        if newest_items:
            break

    manifest["new_tier_items"] = list(set([item.strip() for item in newest_items]))
    print(f"Identified newest tier list items: {manifest['new_tier_items']}")

    # Save manifest
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    print(f"Generated {manifest_path} with {len(manifest['items'])} robots, {len(manifest['weapons'])} weapons, {len(manifest['pilots'])} pilots, {len(manifest['drones'])} drones, {len(manifest['modules'])} modules.")
    return True

if __name__ == "__main__":
    sync_images()
