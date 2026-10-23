"""Latest named additions, independent of artwork and equipment power rankings."""
import re


def clean_name(name):
    return re.sub(r'[⬆⬇👁👥‼\ufe0f*]', '', name).strip()


def name_key(name):
    return re.sub(r'[^a-z0-9]+', ' ', clean_name(name).lower()).strip()


def newest_tier_items(changelog, tiers, releases):
    catalog = {}
    for category, ranks in tiers.items():
        if category == 'disclaimers':
            continue
        names = {}
        for rank in ranks.values():
            for item in rank.get('items', []):
                for name in re.split(r'[,/.]', item['name']):
                    name = clean_name(name)
                    if name:
                        names[name_key(name)] = name
        catalog[category] = names

    events = []
    known_keys = {key for names in catalog.values() for key in names}
    for entry in changelog:
        additions = {}
        for clause in re.findall(r'\badded\s+([^\n.]+)', entry.get('text', ''), re.I):
            found = []
            recommendation = False
            # Read just the initial list. Later robot/stat/drone commentary is
            # not evidence that those items were introduced in this entry.
            parts = re.split(r'\s*(?:,|&|\+|/|\band\b)\s*', clause, flags=re.I)
            for part in parts:
                if not part.strip():
                    continue
                candidate, *suffix = re.split(r'\s+\b(at|to|in|for|as)\b\s+', part.strip(), maxsplit=1, flags=re.I)
                key = name_key(candidate)
                if key not in known_keys:
                    # An unlisted item in an otherwise valid list can precede
                    # a known one; prose marks the end of the list.
                    words = candidate.split()
                    if words and all(word[0].isupper() for word in words) and candidate.isalpha():
                        continue
                    break
                if suffix:
                    connector, detail = suffix
                    is_placement = re.search(r'\b(tier|list)s?\b', detail, re.I)
                    if (connector.lower() in ('to', 'for', 'as') and not is_placement) or re.search(r'\b(option|suggestion|recommendation|build)s?\b', detail, re.I):
                        recommendation = True
                        break
                found.append(key)
                if suffix:
                    break
            if not recommendation:
                for key in found:
                    for category, names in catalog.items():
                        if key in names:
                            additions.setdefault(category, []).append(names[key])
        events.append({'date': entry.get('date', ''), 'items': additions})
    events.extend(releases)

    result = {category: [] for category in catalog}
    dates = {}
    for event in sorted(events, key=lambda event: event['date']):
        for category, names in event.get('items', {}).items():
            known = catalog.get(category, {})
            matched = [known[name_key(name)] for name in names if name_key(name) in known]
            if not matched:
                continue
            if dates.get(category) != event['date']:
                result[category] = []
                dates[category] = event['date']
            result[category] = list(dict.fromkeys(result[category] + matched))
    return result
