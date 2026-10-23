const ROLE_ORDER = { main: 0, primary: 1, secondary: 2 };
const ROLE_WEIGHTS = { main: 1, primary: 0.5, secondary: 0.25 };

export function sortRoles(roles = []) {
  return roles.filter(role => role.type !== 'none')
    .toSorted((a, b) => (ROLE_ORDER[a.type] ?? 3) - (ROLE_ORDER[b.type] ?? 3));
}

export function getRoleWeight(type) {
  return ROLE_WEIGHTS[type] || 0;
}

export function formatRoleScore(score) {
  return Number(score.toFixed(2)).toString();
}
