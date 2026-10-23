import { describe, it, expect } from 'vitest';
import { sortRoles, getRoleWeight, formatRoleScore } from './roles';

describe('role presentation and scoring', () => {
  it('puts the main role first without mutating source data or losing footnotes', () => {
    const roles = [
      { role: 'Support', type: 'secondary', footnote: '**' },
      { role: 'Brawler', type: 'main' },
      { role: 'Midrange', type: 'primary' },
      { role: 'Sniper', type: 'none' },
    ];
    expect(sortRoles(roles).map(role => role.role)).toEqual(['Brawler', 'Midrange', 'Support']);
    expect(sortRoles(roles)[2].footnote).toBe('**');
    expect(roles[0].role).toBe('Support');
    expect(sortRoles()).toEqual([]);
  });
  it('weights blue, green, and yellow roles separately', () => {
    expect(['main', 'primary', 'secondary', 'none'].map(getRoleWeight)).toEqual([1, 0.5, 0.25, 0]);
  });
  it('preserves quarter points in scores', () => {
    expect([0, 0.25, 0.5, 0.75, 1, 1.25].map(formatRoleScore)).toEqual(['0', '0.25', '0.5', '0.75', '1', '1.25']);
  });
});
