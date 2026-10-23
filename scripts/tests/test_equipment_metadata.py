import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from equipment_metadata import newest_tier_items


class NewEquipmentTests(unittest.TestCase):
    def test_latest_additions_are_tracked_per_category_and_family(self):
        tiers = {
            'Robots': {'X': {'items': [{'name': '⬇️Dedopali'}]}},
            'Titans': {'S': {'items': [{'name': 'Sirocco'}]}},
            'Drones': {'A': {'items': [{'name': 'Prena'}, {'name': 'Seeker'}]}},
            'Robot Weapons': {'X': {'items': [{'name': '👁️Iaraghi L, 👁️Iaraghi M, 👁️Iaraghi H'}]}},
        }
        changelog = [
            {'date': '2026-08-11', 'text': 'Added Fang & Sirocco.'},
            {'date': '2026-09-22', 'text': 'Added Dedopali.'},
            {'date': '2026-10-10', 'text': 'Added Seeker as an option for Loki.'},
        ]
        releases = [{'date': '2026-09-22', 'items': {
            'Drones': ['Prena'], 'Robot Weapons': ['Iaraghi L', 'Iaraghi M', 'Iaraghi H'],
        }}]
        result = newest_tier_items(changelog, tiers, releases)
        self.assertEqual(result['Robots'], ['Dedopali'])
        self.assertEqual(result['Titans'], ['Sirocco'])
        self.assertEqual(result['Drones'], ['Prena'])
        self.assertEqual(result['Robot Weapons'], ['Iaraghi L', 'Iaraghi M', 'Iaraghi H'])

    def test_ignores_recommendations_and_matches_multiword_names_with_boundaries(self):
        tiers = {'Robot Weapons': {'A': {'items': [{'name': 'UE Taran'}, {'name': 'Taran'}]}}}
        changelog = [
            {'date': '2026-01-01', 'text': 'Added UE Taran at total +1.'},
            {'date': '2026-01-02', 'text': 'Added Taran to build suggestions.'},
        ]
        self.assertEqual(newest_tier_items(changelog, tiers, [])['Robot Weapons'], ['UE Taran'])

    def test_empty_data_and_unlisted_releases_do_not_mark_items(self):
        self.assertEqual(newest_tier_items([], {}, []), {})
        tiers = {'Drones': {'A': {'items': [{'name': 'Prena'}]}}}
        self.assertEqual(newest_tier_items([], tiers, [{'date': '2099-01-01', 'items': {'Drones': ['Future drone']}}]), {'Drones': []})

    def test_added_list_stops_before_accessibility_and_drone_commentary(self):
        tiers = {
            'Robots': {'X': {'items': [{'name': name} for name in ['Vulcan', 'Omen Vulcan', 'Ammit']]}},
            'Drones': {'S': {'items': [{'name': name} for name in ['Showdown', 'Scales']]}},
        }
        entry = {'date': '2026-06-30', 'text': 'Added Vulcan & Omen Vulcan, Ammit accessiblity -2 -> -1 due to now being in common data pads & Showdown becoming the new best drone for Ammit over Scales'}
        result = newest_tier_items([entry], tiers, [])
        self.assertCountEqual(result['Robots'], ['Vulcan', 'Omen Vulcan'])
        self.assertEqual(result['Drones'], [])

    def test_ratings_commentary_does_not_hide_the_initial_addition_list(self):
        tiers = {
            'Robots': {'X': {'items': [{'name': 'Fang'}, {'name': 'Anaksor'}]}},
            'Titans': {'X': {'items': [{'name': 'Sirocco'}, {'name': 'Princeps'}]}},
        }
        entry = {'date': '2026-08-11', 'text': 'Added Fang & Sirocco, adjusted accessiblity ratings of Anaksor 1 -> 4 and Princeps 1 -> 3'}
        result = newest_tier_items([entry], tiers, [])
        self.assertEqual(result['Robots'], ['Fang'])
        self.assertEqual(result['Titans'], ['Sirocco'])

    def test_adding_an_existing_drone_to_robots_is_not_a_release(self):
        tiers = {'Drones': {'S': {'items': [{'name': 'Myia'}]}}}
        entry = {'date': '2026-05-21', 'text': 'Added Myia to Loki, Skyros, and Nightingale recommendations.'}
        self.assertEqual(newest_tier_items([entry], tiers, [])['Drones'], [])
