import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(rootDir, 'src', 'data');
const errors = [];

// Track items for cross-file verification
const definedRobots = new Set();
const definedTitans = new Set();
const definedWeapons = new Set();

const referencedRobots = [];
const referencedTitans = [];
const referencedWeapons = [];

function readJson(filename) {
  const filepath = join(dataDir, filename);
  if (!existsSync(filepath)) {
    addError('file_system', `Required data file not found: ${filename}. Please run parse_data.py first.`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(filepath, 'utf8'));
  } catch (e) {
    addError(filename, `Failed to parse JSON content: ${e.message}`);
    return null;
  }
}

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function expectArray(value, path) {
  if (!Array.isArray(value)) {
    addError(path, 'expected an array');
    return [];
  }
  return value;
}

function expectObject(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    addError(path, 'expected an object');
    return {};
  }
  return value;
}

function expectString(value, path) {
  if (typeof value !== 'string') {
    addError(path, 'expected a string');
  }
}

function expectNonEmptyString(value, path) {
  if (typeof value !== 'string') {
    addError(path, 'expected a string');
  } else if (value.trim() === '') {
    addError(path, 'expected a non-empty string');
  }
}

// Accept strings that are explicitly "N/A" or hyphen, or actual numbers
function expectDpsValue(value, path) {
  if (typeof value === 'string') {
    if (!['N/A', '-', ''].includes(value.trim())) {
      addError(path, `expected numeric value or 'N/A'/'-', got '${value}'`);
    }
  } else if (typeof value !== 'number' || Number.isNaN(value)) {
    addError(path, 'expected a number');
  }
}

function expectNumberInRange(value, path, min, max) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    addError(path, 'expected a number');
  } else if (value < min || value > max) {
    addError(path, `expected a number between ${min} and ${max}, got ${value}`);
  }
}

function validateTiers(data) {
  if (!data) return;
  for (const [category, tiers] of Object.entries(expectObject(data, 'tiers'))) {
    for (const [tier, tierInfo] of Object.entries(expectObject(tiers, `tiers.${category}`))) {
      const tierPath = `tiers.${category}.${tier}`;
      expectNonEmptyString(tierInfo.casual_name, `${tierPath}.casual_name`);
      expectArray(tierInfo.items, `${tierPath}.items`).forEach((item, index) => {
        expectNonEmptyString(item.name, `${tierPath}.items[${index}].name`);
        expectString(item.description, `${tierPath}.items[${index}].description`);

        // Record for cross-file consistency checks
        if (category === 'Robots') {
          referencedRobots.push({ name: item.name, path: `${tierPath}.items[${index}].name` });
        } else if (category === 'Titans') {
          referencedTitans.push({ name: item.name, path: `${tierPath}.items[${index}].name` });
        } else if (['Robot Weapons', 'Titan Weapons'].includes(category)) {
          referencedWeapons.push({ name: item.name, path: `${tierPath}.items[${index}].name` });
        }
      });
    }
  }
}

function validateRobotGuide(data) {
  if (!data) return;
  const guide = expectObject(data, 'robot_guide');

  expectArray(guide.changelog, 'robot_guide.changelog').forEach((log, index) => {
    expectNonEmptyString(log.date, `robot_guide.changelog[${index}].date`);
    expectNonEmptyString(log.text, `robot_guide.changelog[${index}].text`);
  });

  expectArray(guide.builds, 'robot_guide.builds').forEach((build, index) => {
    for (const key of ['build_name', 'robot', 'best_weapons', 'explanation']) {
      expectNonEmptyString(build[key], `robot_guide.builds[${index}].${key}`);
    }
  });

  expectArray(guide.robots, 'robot_guide.robots').forEach((robot, index) => {
    const path = `robot_guide.robots[${index}]`;
    expectNonEmptyString(robot.name, `${path}.name`);
    expectString(robot.comments, `${path}.comments`);
    expectNonEmptyString(robot.sheet, `${path}.sheet`);
    expectNumberInRange(robot.value_rating, `${path}.value_rating`, -2, 5);
    validateScores(robot.scores, `${path}.scores`, 'robot');
    expectArray(robot.roles, `${path}.roles`).forEach((role, roleIndex) => {
      expectNonEmptyString(role.role, `${path}.roles[${roleIndex}].role`);
      if (!['primary', 'secondary', 'none'].includes(role.type)) {
        addError(`${path}.roles[${roleIndex}].type`, 'expected primary, secondary, or none');
      }
      expectString(role.footnote, `${path}.roles[${roleIndex}].footnote`);
    });

    // Track uniqueness (Warning only)
    const normName = robot.name.toLowerCase().trim();
    if (definedRobots.has(normName)) {
      console.warn(`[Data Warning] Duplicate robot name defined: '${robot.name}' at ${path}`);
    } else {
      definedRobots.add(normName);
    }
  });

  expectArray(guide.titans, 'robot_guide.titans').forEach((titan, index) => {
    const path = `robot_guide.titans[${index}]`;
    expectNonEmptyString(titan.name, `${path}.name`);
    expectString(titan.comments, `${path}.comments`);
    expectNumberInRange(titan.value_rating, `${path}.value_rating`, -2, 3);
    validateScores(titan.scores, `${path}.scores`, 'titan');

    // Track uniqueness (Warning only)
    const normName = titan.name.toLowerCase().trim();
    if (definedTitans.has(normName)) {
      console.warn(`[Data Warning] Duplicate titan name defined: '${titan.name}' at ${path}`);
    } else {
      definedTitans.add(normName);
    }
  });
}

function validateScores(scores, path, unitType = 'robot') {
  const scoreObj = expectObject(scores, path);
  const maxVal = unitType === 'titan' ? 3 : 5;
  for (const key of ['longevity', 'lethality', 'mobility', 'utility', 'accessibility']) {
    expectNumberInRange(scoreObj[key], `${path}.${key}`, -3, 3);
  }
  expectNumberInRange(scoreObj['overall'], `${path}.overall`, -3, maxVal);
}

function validateWeapons(data) {
  if (!data) return;
  for (const [weaponClass, weapons] of Object.entries(expectObject(data, 'weapons_dps'))) {
    expectArray(weapons, `weapons_dps.${weaponClass}`).forEach((weapon, index) => {
      const path = `weapons_dps.${weaponClass}[${index}]`;
      expectNonEmptyString(weapon.name, `${path}.name`);
      expectNonEmptyString(weapon.range, `${path}.range`);
      expectString(weapon.notes, `${path}.notes`);
      expectDpsValue(weapon.burst_dps, `${path}.burst_dps`);
      expectDpsValue(weapon.cycle_dps, `${path}.cycle_dps`);

      // Track uniqueness (Warning only if notes also match, otherwise it is a variant)
      const normName = weapon.name.toLowerCase().trim();
      const uniqueKey = `${normName}::${weapon.notes.toLowerCase().trim()}`;
      if (definedWeapons.has(uniqueKey)) {
        console.warn(`[Data Warning] Duplicate weapon definition: '${weapon.name}' at ${path}`);
      } else {
        definedWeapons.add(uniqueKey);
      }
    });
  }
}

function validateSpecializations(data) {
  if (!data) return;
  expectString(data.intro, 'specializations.intro');
  expectArray(data.sections, 'specializations.sections').forEach((section, index) => {
    const path = `specializations.sections[${index}]`;
    expectNonEmptyString(section.title, `${path}.title`);
    expectNonEmptyString(section.description, `${path}.description`);
    expectArray(section.slots, `${path}.slots`).forEach((slot, slotIndex) => {
      expectNonEmptyString(slot.name, `${path}.slots[${slotIndex}].name`);
      expectNonEmptyString(slot.content, `${path}.slots[${slotIndex}].content`);
    });
  });
}

function validatePilots(data) {
  if (!data) return;
  expectString(data.intro, 'pilots.intro');
  for (const section of ['robots', 'titans']) {
    const sectionData = expectObject(data[section], `pilots.${section}`);
    for (const category of ['Must Use', 'Usually Use', 'Sometimes Use', "Don't Use"]) {
      expectArray(sectionData[category], `pilots.${section}.${category}`).forEach((skill, index) => {
        expectNonEmptyString(skill.name, `pilots.${section}.${category}[${index}].name`);
        expectNonEmptyString(skill.description, `pilots.${section}.${category}[${index}].description`);
      });
    }
  }
}

// --------------------------------------------------
// CROSS-FILE DATA INTEGRITY VERIFICATION
// --------------------------------------------------
function runCrossFileChecks() {
  let warningCount = 0;

  // 1. Verify robots referenced in tiers exist in robot_guide
  for (const robot of referencedRobots) {
    if (!definedRobots.has(robot.name.toLowerCase().trim())) {
      console.warn(`[Data Integrity Warning] ${robot.path}: Robot '${robot.name}' referenced in tiers is missing from robot_guide.json`);
      warningCount++;
    }
  }

  // 2. Verify titans referenced in tiers exist in robot_guide
  for (const titan of referencedTitans) {
    if (!definedTitans.has(titan.name.toLowerCase().trim())) {
      console.warn(`[Data Integrity Warning] ${titan.path}: Titan '${titan.name}' referenced in tiers is missing from robot_guide.json`);
      warningCount++;
    }
  }

  // 3. Verify weapons referenced in tiers exist in weapons_dps
  for (const weapon of referencedWeapons) {
    const normName = weapon.name.toLowerCase().trim();
    
    // Family/broad names that do not need individual weapon verification
    if (normName.includes('family') || 
        normName.includes('weapons') || 
        normName.includes('series') ||
        normName === 'gas') {
      continue;
    }

    // Split by comma, slash, 'and', 'or' to get individual weapons in a group
    const parts = weapon.name.split(/,|\/|\band\b|\bor\b/)
      .map(part => part.trim().toLowerCase())
      .filter(part => part.length > 0);

    let foundMatch = false;
    for (const part of parts) {
      // Direct exact match
      // Note: definedWeapons stores "name::notes" lowercase, so we need to match the name prefix
      let hasExact = false;
      for (const uniqueKey of definedWeapons) {
        const weaponNameInDps = uniqueKey.split('::')[0];
        if (weaponNameInDps === part || weaponNameInDps.includes(part) || part.includes(weaponNameInDps)) {
          hasExact = true;
          break;
        }
      }
      if (hasExact) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      console.warn(`[Data Integrity Warning] ${weapon.path}: Weapon family/combo '${weapon.name}' referenced in tiers has no matching weapons in weapons_dps.json`);
      warningCount++;
    }
  }

  if (warningCount > 0) {
    console.log(`Data validation finished with ${warningCount} integrity warnings.`);
  }
}

// Run validations
const tiers = readJson('tiers.json');
const robotGuide = readJson('robot_guide.json');
const weapons = readJson('weapons_dps.json');
const specializations = readJson('specializations.json');
const pilots = readJson('pilots.json');

validateTiers(tiers);
validateRobotGuide(robotGuide);
validateWeapons(weapons);
validateSpecializations(specializations);
validatePilots(pilots);

// Run cross-file verification warning checks
runCrossFileChecks();

if (errors.length > 0) {
  console.error('Data validation failed with critical schema errors:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Data validation passed successfully.');

