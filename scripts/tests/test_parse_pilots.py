import json
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import parse_data


class PilotParsingTests(unittest.TestCase):
    def test_intro_category_names_do_not_start_robot_section(self):
        with tempfile.TemporaryDirectory() as output, patch.object(parse_data, 'data_out_dir', output):
            parse_data.parse_pilots()
            with open(os.path.join(output, 'pilots.json'), encoding='utf-8') as file:
                data = json.load(file)
        self.assertIn('Pilot skill priority is different', data['intro'])
        self.assertNotIn('General Info', [skill['name'] for skill in data['robots']["Don't Use"]])
