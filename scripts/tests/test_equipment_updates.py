import copy
from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from equipment_updates import refresh_release_history


def announcement(version='12.5', date='2026-10-26', contents=None):
    return {
        'title': f'WAR ROBOTS {version} UPDATE NOTES',
        'date': int(datetime.fromisoformat(date).replace(tzinfo=timezone.utc).timestamp()),
        'feedname': 'steam_community_announcements',
        'url': 'https://steamcommunity.com/games/767560/announcements/detail/123',
        'contents': contents if contents is not None else '''[list]
[*] New robot: Nekton
[*] New robot weapons: Mesmer L-M-H
[*] Neon special editions: Martian Nekton, Martian Mesmer L/H
[*] New drone: Object
[*] New mothership: Roswell
[*] New ultimate editions: Ultimate Loki, Ultimate Gust
[*] New pilots: The Martian (Nekton, Mesmer L/H), Orson Barret (Ultimate Rhino)
[/list]
[h1]BALANCE CHANGES[/h1]
Loki, Gust, Dedopali, Iaraghi
New robot: Dedopali''',
    }


def feed(*items):
    return {'appnews': {'appid': 767560, 'newsitems': list(items)}}


TIERS = {
    'Robots': {'S': {'items': [{'name': 'Loki'}, {'name': 'UE Rhino'}]}},
    'Robot Weapons': {'S': {'items': [{'name': 'Gust'}]}},
}


class EquipmentUpdatesTests(unittest.TestCase):
    def test_refresh_discovers_latest_release_and_expands_families_and_ultimate_names(self):
        history = [{'version': '12.4', 'date': '2026-09-22', 'items': {'Robots': ['Dedopali']}}]
        original = copy.deepcopy(history)
        result = refresh_release_history(feed(announcement()), history, TIERS)
        self.assertEqual(history, original)
        self.assertEqual(result[-1]['version'], '12.5')
        self.assertEqual(result[-1]['date'], '2026-10-26')
        self.assertEqual(result[-1]['items'], {
            'Robots': ['Nekton', 'Martian Nekton', 'Ultimate Loki'],
            'Robot Weapons': ['Mesmer L', 'Mesmer M', 'Mesmer H', 'Martian Mesmer L', 'Martian Mesmer H', 'Ultimate Gust'],
            'Drones': ['Object'], 'Motherships': ['Roswell'],
        })

    def test_older_republished_notes_and_unrelated_news_do_not_replace_latest_release(self):
        unrelated = announcement('99.0')
        unrelated['title'] = 'Test server preview 99.0'
        result = refresh_release_history(feed(announcement('12.4', '2026-10-29'), unrelated, announcement()), [], TIERS)
        self.assertEqual(result[-1]['version'], '12.5')

    def test_balance_only_release_clears_badges_across_all_categories(self):
        result = refresh_release_history(feed(announcement(contents='[h1]BALANCE CHANGES[/h1]Loki: 10 → 20')), [], TIERS)
        self.assertEqual(result[-1]['items'], {})

    def test_stale_feed_cannot_roll_back_known_release(self):
        history = [{'version': '12.6', 'date': '2026-11-30', 'items': {}}]
        self.assertEqual(refresh_release_history(feed(announcement()), history, TIERS), history)

    def test_parenthesized_weapon_weights_are_expanded(self):
        result = refresh_release_history(feed(announcement(contents='[list][*] New robot weapons: Iaraghi (L, M, H)[/list]')), [], TIERS)
        self.assertEqual(result[-1]['items']['Robot Weapons'], ['Iaraghi L', 'Iaraghi M', 'Iaraghi H'])

    def test_alpha_and_beta_titan_weapon_families_are_expanded(self):
        result = refresh_release_history(feed(announcement(contents='[list][*] New titan weapons: Barq (A, B)[/list]')), [], TIERS)
        self.assertEqual(result[-1]['items']['Titan Weapons'], ['Barq A', 'Barq B'])

    def test_wrong_app_or_missing_patch_notes_is_rejected(self):
        with self.assertRaises(ValueError):
            refresh_release_history({'appnews': {'appid': 123, 'newsitems': [announcement()]}}, [], TIERS)
        with self.assertRaises(ValueError):
            refresh_release_history(feed(), [], TIERS)
