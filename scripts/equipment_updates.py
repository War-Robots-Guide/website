"""Refresh equipment release cohorts from the publisher's official Steam news."""
import argparse
from datetime import datetime, timezone
from html import unescape
import json
from pathlib import Path
import re
from urllib.request import urlopen

from content_metadata import equipment_catalog, item_key

ROOT = Path(__file__).resolve().parents[1]
FEED_URL = ('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/'
            '?appid=767560&count=50&maxlength=0&feeds=steam_community_announcements')
CATEGORIES = {
    'robot': 'Robots', 'titan': 'Titans', 'drone': 'Drones',
    'mothership': 'Motherships', 'mothership turret': 'Mothership Turrets',
    'robot weapon': 'Robot Weapons', 'titan weapon': 'Titan Weapons',
}


def version_key(version):
    return tuple(int(part) for part in version.split('.'))


def expand_names(text):
    # Preserve each weight in "Mesmer L-M-H", "Iaraghi (L, M, H)", "Barq (A, B)".
    text = re.sub(
        r'([^,()]+?)\s+\(?([LMHAB](?:\s*[-/,]\s*[LMHAB])+)\)?',
        lambda match: ', '.join(f'{match[1].strip()} {weight}'
                               for weight in re.split(r'\s*[-/,]\s*', match[2])), text)
    return [name.strip().rstrip('.') for name in text.split(',') if name.strip()]


def refresh_release_history(feed, history, tiers):
    news = feed.get('appnews', {})
    if news.get('appid') != 767560:
        raise ValueError('Expected the War Robots news feed')
    releases = []
    for entry in news.get('newsitems', []):
        match = re.fullmatch(r'WAR ROBOTS (\d+\.\d+(?:\.\d+)?) UPDATE NOTES', entry.get('title', ''), re.I)
        if match and entry.get('feedname') == 'steam_community_announcements':
            releases.append((match[1], entry))
    if not releases:
        raise ValueError('No official update notes found')
    version, entry = max(releases, key=lambda release: (version_key(release[0]), release[1]['date']))
    if any(version_key(record['version']) > version_key(version) for record in history if record.get('version')):
        return history

    contents = entry['contents']
    if not contents.strip():
        raise ValueError('Update notes are empty')
    # Only overview bullets announcing NEW equipment count; balance and pilot
    # sections mentioning old equipment must never make it new again.
    overview = re.search(r'\[list[^\]]*\](.*?)\[/list\]', contents, re.S | re.I)
    text = unescape(re.sub(r'<[^>]+>', '\n', overview[1] if overview else contents))
    text = text.replace('[*]', '\n')
    text = re.sub(r'\[/?[^\]]+\]', '', text)
    items, variants = {}, []
    for label, names in re.findall(r'^\s*((?:New|Neon) [^:\n]+):\s*([^\n]+)', text, re.M | re.I):
        kind = re.sub(r'^new\s+', '', label.lower()).removesuffix('s')
        category = CATEGORIES.get(kind)
        if category:
            items.setdefault(category, []).extend(expand_names(names))
        elif 'edition' in label.lower():
            variants.extend(expand_names(names))

    # Ultimate editions inherit the category of their standard counterpart.
    # Special editions inherit it from the newly announced base equipment.
    catalog = equipment_catalog(tiers)
    for name in variants:
        key = item_key(name)
        base = re.sub(r'^ue', '', key)
        for category in dict.fromkeys([*items, *catalog]):
            new_keys = [item_key(candidate) for candidate in items.get(category, [])]
            if key in catalog.get(category, {}) or base in catalog.get(category, {}) or any(key.endswith(candidate) for candidate in new_keys):
                items.setdefault(category, []).append(name)
                break
    for category, names in items.items():
        unique = {}
        for name in names:
            unique.setdefault(item_key(name), name)
        items[category] = list(unique.values())
    record = {
        'date': datetime.fromtimestamp(entry['date'], timezone.utc).date().isoformat(),
        'source': entry['url'], 'version': version, 'items': items,
    }
    return [recorded for recorded in history if recorded.get('version') != version] + [record]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--feed-file', type=Path, help='Use a downloaded news feed for offline verification')
    args = parser.parse_args()
    if args.feed_file:
        feed = json.loads(args.feed_file.read_text(encoding='utf-8'))
    else:
        with urlopen(FEED_URL, timeout=30) as response:
            feed = json.load(response)
    path = ROOT / 'src/data/equipment_updates.json'
    history = json.loads(path.read_text(encoding='utf-8'))
    tiers = json.loads((ROOT / 'src/data/tiers.json').read_text(encoding='utf-8'))
    result = refresh_release_history(feed, history, tiers)
    path.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(f"Equipment release metadata refreshed: {result[-1]['version']}")


if __name__ == '__main__':
    main()
