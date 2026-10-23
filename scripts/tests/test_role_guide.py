import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from role_guide import extract_role_guide


class Sheet:
    def __init__(self, rows):
        self.rows = rows

    def iter_rows(self):
        return iter([[SimpleNamespace(value=value) for value in row] for row in self.rows])


class RoleGuideTests(unittest.TestCase):
    def test_extracts_source_legend_and_definitions_without_bot_names_or_footnotes(self):
        sheet = Sheet([
            ['Bot', 'Support', 'Brawler', None, None],
            ['Raven', None, None, 'Blue indicates the main role.', None],
            ['Leech', None, None, 'Support', 'Helps teammates.'],
            ['Fang', None, None, 'Brawler', 'Fights in close quarters.'],
            ['Fenrir', '*', None, '*Only with Traditionalist', None],
        ])
        result = extract_role_guide(sheet)
        self.assertEqual(result['notes'], ['Blue indicates the main role.'])
        self.assertEqual(result['definitions'], [
            {'role': 'Support', 'description': 'Helps teammates.'},
            {'role': 'Brawler', 'description': 'Fights in close quarters.'},
        ])
