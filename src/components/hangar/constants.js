export const TIER_VALUES = { X: 9, S: 8, A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, Z: 1 };
export const REVERSE_TIER_VALUES = { 9: 'X', 8: 'S', 7: 'A', 6: 'B', 5: 'C', 4: 'D', 3: 'E', 2: 'F', 1: 'Z' };

export const STATUS_COLORS = {
  MET: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    text: 'Met'
  },
  UNDERFILLED: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.1)',
    text: 'Underfilled'
  },
  MISSING: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: 'Missing'
  }
};

export const CORE_ROLES_CONFIG = [
  { name: 'Support', target: 2, key: 'Support' },
  { name: 'Beacon Runner', target: 1, key: 'Beacon Runner' },
  { name: 'Midrange', target: 2, key: 'Midrange' },
  { name: 'Tank-buster', target: 1, key: 'Tank-buster' }
];

export const TOTAL_CORE_TARGETS = CORE_ROLES_CONFIG.reduce((sum, role) => sum + role.target, 0);
export const SUPPORT_TARGET = CORE_ROLES_CONFIG.find(r => r.key === 'Support')?.target || 2;
export const TANK_BUSTER_TARGET = CORE_ROLES_CONFIG.find(r => r.key === 'Tank-buster')?.target || 1;
