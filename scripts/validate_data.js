import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(rootDir, 'src', 'data');
const errors = [];

function readJson(filename) {
  return JSON.parse(readFileSync(join(dataDir, filename), 'utf8'));
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

function expectStringOrNumber(value, path) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    addError(path, 'expected a string or number');
  }
}

function expectNumber(value, path) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    addError(path, 'expected a number');
  }
}

function validateTiers(data) {
  for (const [category, tiers] of Object.entries(expectObject(data, 'tiers'))) {
    for (const [tier, tierInfo] of Object.entries(expectObject(tiers, `tiers.${category}`))) {
      const tierPath = `tiers.${category}.${tier}`;
      expectString(tierInfo.casual_name, `${tierPath}.casual_name`);
      expectArray(tierInfo.items, `${tierPath}.items`).forEach((item, index) => {
        expectString(item.name, `${tierPath}.items[${index}].name`);
        expectString(item.description, `${tierPath}.items[${index}].description`);
      });
    }
  }
}

function validateRobotGuide(data) {
  const guide = expectObject(data, 'robot_guide');

  expectArray(guide.changelog, 'robot_guide.changelog').forEach((log, index) => {
    expectString(log.date, `robot_guide.changelog[${index}].date`);
    expectString(log.text, `robot_guide.changelog[${index}].text`);
  });

  expectArray(guide.builds, 'robot_guide.builds').forEach((build, index) => {
    for (const key of ['build_name', 'robot', 'best_weapons', 'explanation']) {
      expectString(build[key], `robot_guide.builds[${index}].${key}`);
    }
  });

  expectArray(guide.robots, 'robot_guide.robots').forEach((robot, index) => {
    const path = `robot_guide.robots[${index}]`;
    expectString(robot.name, `${path}.name`);
    expectString(robot.comments, `${path}.comments`);
    expectString(robot.sheet, `${path}.sheet`);
    expectNumber(robot.value_rating, `${path}.value_rating`);
    validateScores(robot.scores, `${path}.scores`);
    expectArray(robot.roles, `${path}.roles`).forEach((role, roleIndex) => {
      expectString(role.role, `${path}.roles[${roleIndex}].role`);
      if (!['primary', 'secondary', 'none'].includes(role.type)) {
        addError(`${path}.roles[${roleIndex}].type`, 'expected primary, secondary, or none');
      }
      expectString(role.footnote, `${path}.roles[${roleIndex}].footnote`);
    });
  });

  expectArray(guide.titans, 'robot_guide.titans').forEach((titan, index) => {
    const path = `robot_guide.titans[${index}]`;
    expectString(titan.name, `${path}.name`);
    expectString(titan.comments, `${path}.comments`);
    expectNumber(titan.value_rating, `${path}.value_rating`);
    validateScores(titan.scores, `${path}.scores`);
  });
}

function validateScores(scores, path) {
  const scoreObj = expectObject(scores, path);
  for (const key of ['longevity', 'lethality', 'mobility', 'utility', 'accessibility', 'overall']) {
    expectNumber(scoreObj[key], `${path}.${key}`);
  }
}

function validateWeapons(data) {
  for (const [weaponClass, weapons] of Object.entries(expectObject(data, 'weapons_dps'))) {
    expectArray(weapons, `weapons_dps.${weaponClass}`).forEach((weapon, index) => {
      const path = `weapons_dps.${weaponClass}[${index}]`;
      expectString(weapon.name, `${path}.name`);
      expectString(weapon.range, `${path}.range`);
      expectString(weapon.notes, `${path}.notes`);
      expectStringOrNumber(weapon.burst_dps, `${path}.burst_dps`);
      expectStringOrNumber(weapon.cycle_dps, `${path}.cycle_dps`);
    });
  }
}

function validateSpecializations(data) {
  expectString(data.intro, 'specializations.intro');
  expectArray(data.sections, 'specializations.sections').forEach((section, index) => {
    const path = `specializations.sections[${index}]`;
    expectString(section.title, `${path}.title`);
    expectString(section.description, `${path}.description`);
    expectArray(section.slots, `${path}.slots`).forEach((slot, slotIndex) => {
      expectString(slot.name, `${path}.slots[${slotIndex}].name`);
      expectString(slot.content, `${path}.slots[${slotIndex}].content`);
    });
  });
}

function validatePilots(data) {
  expectString(data.intro, 'pilots.intro');
  for (const section of ['robots', 'titans']) {
    const sectionData = expectObject(data[section], `pilots.${section}`);
    for (const category of ['Must Use', 'Usually Use', 'Sometimes Use', "Don't Use"]) {
      expectArray(sectionData[category], `pilots.${section}.${category}`).forEach((skill, index) => {
        expectString(skill.name, `pilots.${section}.${category}[${index}].name`);
        expectString(skill.description, `pilots.${section}.${category}[${index}].description`);
      });
    }
  }
}

validateTiers(readJson('tiers.json'));
validateRobotGuide(readJson('robot_guide.json'));
validateWeapons(readJson('weapons_dps.json'));
validateSpecializations(readJson('specializations.json'));
validatePilots(readJson('pilots.json'));

if (errors.length > 0) {
  console.error('Data validation failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Data validation passed.');
