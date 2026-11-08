import json
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

from docx import Document
from openpyxl import Workbook

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import parse_data


class TierTagTests(unittest.TestCase):
    def test_preserves_tag_explanations_from_document(self):
        with tempfile.TemporaryDirectory() as directory:
            doc = Document()
            doc.add_heading('Tag Explanations', level=1)
            doc.add_paragraph('[👥] Items move up one tier in squads.')
            doc.add_paragraph('\u2060[⬆️] The current source text.')
            doc.add_heading('Robots', level=1)
            doc.save(os.path.join(directory, 'Tier List Rationales.docx'))
            Workbook().save(os.path.join(directory, 'WR tier lists.xlsx'))
            with patch.object(parse_data, 'sample_dir', directory), patch.object(parse_data, 'data_out_dir', directory):
                parse_data.parse_tiers()
            with open(os.path.join(directory, 'tiers.json'), encoding='utf-8') as file:
                disclaimers = json.load(file)['disclaimers']
        self.assertIn('[👥] Items move up one tier in squads.', disclaimers)
        self.assertIn('[⬆️] The current source text.', disclaimers)
