import manifest from '../data/image_manifest.json';
import { ACTIVE_MODULE_NAMES, moduleKey, resolveModuleName } from './moduleCatalog';

const optionKey = value => moduleKey(value.replace(/"Cat"/i, ''));
const wrappedPilotNames = [
  'Sati "Cat" Felidae', 'Monique Lenormond', 'Ricardo Gonzales', 'Sergeius Hayward',
  'Thomas Mindread', 'Vepkho Lovidze', 'Lisel and B4R0N3T', 'Bernadette Wolff',
];
const pilotKeys = new Set([...Object.keys(manifest.pilots || {}), ...wrappedPilotNames.map(optionKey)]);

// Newlines inside parentheses wrap a note; outside them they delimit choices.
export function parseEquipmentOptions(text = '', kind = 'drone') {
  if (!text.trim() || /^(N\/A|-)$/.test(text.trim())) return [];
  const lines = [];
  let pending = '', depth = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    pending = `${pending} ${line}`.trim();
    depth += [...line].reduce((sum, char) => sum + (char === '(' ? 1 : char === ')' ? -1 : 0), 0);
    if (depth <= 0) { if (pending) lines.push(pending); pending = ''; depth = 0; }
  }
  if (pending) lines.push(pending);
  const options = [];
  for (let index = 0; index < lines.length; index++) {
    let line = lines[index];
    if (kind === 'pilot' && !line.startsWith('(')) {
      // Longest exact catalog match joins a name split across spreadsheet lines.
      let joined = line, end = index;
      for (let next = index + 1; next < lines.length && !lines[next].includes('('); next++) {
        joined += ` ${lines[next]}`;
        if (pilotKeys.has(optionKey(joined))) { line = joined; end = next; }
      }
      index = end;
    }
    const note = [...line.matchAll(/\(([^)]*)\)?/g)].map(match => match[1].trim()).join(' ');
    const name = line.replace(/\([^)]*\)?/g, '').replace(/\*+$/g, '').trim();
    if (!name) {
      if (options.length) options[options.length - 1].note = [options.at(-1).note, note || line].filter(Boolean).join(' ');
      else options.push({ name: '', note: note || line });
    } else {
      const names = kind === 'drone' ? name.split(/\s*[/,]\s*/) : [name];
      options.push(...names.filter(Boolean).map(name => ({ name, note })));
    }
  }
  return options;
}

export function parseBuildSpecialization(text = '', isTitan = false) {
  const flat = text.replace(/\s+/g, ' ').trim();
  const passive = [];
  let end = 0;
  const pattern = /([^()]+)\(([^()]*)\)/g;
  let match;
  while ((match = pattern.exec(flat))) {
    const name = match[1].trim().replace(/^Sabotuer$/i, 'Saboteur');
    // Active-module conditions also use parentheses; they are not specializations.
    if (!/^(?:Damage Dealer|Raider|Support|Brawler|Tank|Saboteur|Attack|Defense|Engineer|Ultimate)\b/i.test(name)) break;
    const ultimate = /^Ultimate\b/i.test(name);
    passive.push({ name, modules: match[2].split(/\s*(?:\+|\/|\bor\b)\s*/i).filter(Boolean).map(value => resolveModuleName(value, isTitan, ultimate)) });
    end = pattern.lastIndex;
  }
  let activeText = flat.slice(end).trim();
  if (!passive.length) {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length) passive.push({ name: lines.shift().trim(), modules: [] });
    activeText = lines.join(' ').trim();
  }
  const active = activeText.split(/\s*(?:,\s*(?:or\s+)?|\bor\b)\s*/i).filter(Boolean).map(value => {
    const note = value.match(/\(([^)]*)\)/)?.[1] || '';
    const rawName = value.replace(/\([^)]*\)/g, '').trim();
    // One Anaksor build says QS; its paired build says QR. A robot's active
    // slot can equip Quantum Radar, never the Titan's passive Quantum Sensor.
    const name = resolveModuleName(moduleKey(rawName) === 'qs' ? 'Quantum Radar' : rawName);
    return ACTIVE_MODULE_NAMES.has(name) ? { name, note }
      : { name: rawName, note: [note, 'Unrecognized active module in source.'].filter(Boolean).join(' '), unresolved: true };
  });
  return { passive, active };
}
