const SOURCE_URL = 'https://docs.google.com/spreadsheets/d/1RBLXWZDD-PmFxW4ChUOLNrzin8Gzxjp8tfw2gSeol8Y/edit#gid=0';
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string' && value.trim().length > 0;

export function validatePilotTiers(data) {
  if (!isObject(data)) return ['expected an object'];
  const errors = [];
  if (data.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (data.sourceUrl !== SOURCE_URL) errors.push('sourceUrl must identify the pilot source spreadsheet');
  const stamp = data.fetchedAt;
  const time = typeof stamp === 'string' ? Date.parse(stamp) : NaN;
  if (typeof stamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(stamp)
    || !Number.isFinite(time) || new Date(time).toISOString().replace('.000Z', 'Z') !== stamp) {
    errors.push('fetchedAt must be a valid UTC timestamp');
  }
  if (!Array.isArray(data.tiers) || data.tiers.length === 0) return [...errors, 'tiers must be a nonempty array'];
  const labels = new Set();
  data.tiers.forEach((tier, index) => {
    const prefix = `tiers[${index}]`;
    if (!isObject(tier)) { errors.push(`${prefix} must be an object`); return; }
    if (!isText(tier.label)) errors.push(`${prefix}.label must be nonempty text`);
    else {
      const label = tier.label.trim().toLowerCase();
      if (labels.has(label)) errors.push(`${prefix}.label must be unique`);
      labels.add(label);
    }
    if (!Array.isArray(tier.items) || tier.items.length === 0) errors.push(`${prefix}.items must be a nonempty array`);
    else tier.items.forEach((item, position) => {
      if (!isObject(item) || !isText(item.name)) errors.push(`${prefix}.items[${position}].name must be nonempty text`);
    });
  });
  return errors;
}
