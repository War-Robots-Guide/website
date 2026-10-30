import { Fragment } from 'react';
import guide from '../../data/robot_guide.json';
import { getRoleIcon } from '../../utils/imageUtils';

export function RoleGuide({ category }) {
  const roleGuide = guide.role_guide?.[category === 'Titans' ? 'titans' : 'robots'];
  if (!roleGuide) return null;
  return <section className="role-guide" aria-label="Role guide">
    <strong>{category === 'Titans' ? 'Titan' : 'Robot'} Role Guide</strong>
    <div className="role-guide-colors">
      <span className="role-badge main">Blue: main role</span>
      <span className="role-badge primary">Green: very good at this role</span>
      <span className="role-badge secondary">Yellow: partially fills this role</span>
    </div>
    {category === 'Titans' && roleGuide.notes.filter(note => !/^blue indicates/i.test(note)).map((note, index) => <p key={index}>{note}</p>)}
    <dl>{roleGuide.definitions.map(({ role, description }) => <Fragment key={role}>
      <dt>{getRoleIcon(role) && <img src={getRoleIcon(role)} alt={`${role} role`} />}<span>{role}</span></dt><dd>{description}</dd>
    </Fragment>)}</dl>
  </section>;
}
