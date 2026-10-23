"""Extract the role guide alongside the role ratings from the source workbook."""


def extract_role_guide(sheet):
    rows = list(sheet.iter_rows())
    if not rows:
        return {'notes': [], 'definitions': []}
    headers = [str(cell.value).strip() for cell in rows[0] if cell.value is not None]
    roles = set(headers[1:])
    notes = []
    definitions = []
    for row in rows[1:]:
        values = [str(cell.value).strip() for cell in row[len(headers):] if cell.value is not None]
        if not values or values[0].startswith('*'):
            continue
        if values[0] in roles and len(values) > 1:
            definitions.append({'role': values[0], 'description': '\n'.join(values[1:])})
        elif values[0] not in roles:
            notes.append('\n'.join(values))
    return {'notes': notes, 'definitions': definitions}
