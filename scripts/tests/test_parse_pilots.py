import json
import os
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from docx import Document

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import parse_data


class PilotParsingTests(unittest.TestCase):
    def test_import_does_not_exit_when_source_documents_are_absent(self):
        script = """
import os
from unittest.mock import patch
original_exists = os.path.exists
with patch('os.path.exists', side_effect=lambda path: False if str(path).endswith('sample data') else original_exists(path)):
    import parse_data
"""
        result = subprocess.run([sys.executable, '-c', script], env={**os.environ, 'PYTHONPATH': os.path.dirname(parse_data.__file__)}, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn('Skipping parsing', result.stdout)

    def test_intro_category_names_do_not_start_robot_section(self):
        with tempfile.TemporaryDirectory() as directory:
            doc = Document()
            doc.add_heading('Intro', level=1)
            doc.add_paragraph('Broadly, skills have categories:')
            doc.add_paragraph('Must use')
            doc.add_paragraph("Don't use (unless needed)")
            doc.add_paragraph('Pilot skill priority is different for robots and titans.')
            doc.add_heading('Robot Pilots', level=1)
            doc.add_paragraph("Don't Use")
            doc.add_paragraph('Ghost: Avoid this skill.')
            doc.save(os.path.join(directory, 'pilot skill guide.docx'))
            with patch.object(parse_data, 'sample_dir', directory), patch.object(parse_data, 'data_out_dir', directory):
                parse_data.parse_pilots()
            with open(os.path.join(directory, 'pilots.json'), encoding='utf-8') as file:
                data = json.load(file)
        self.assertIn('Pilot skill priority is different', data['intro'])
        self.assertEqual(data['robots']["Don't Use"], [{'name': 'Ghost', 'description': 'Avoid this skill.'}])
