import { getModuleImage } from '../../utils/imageUtils';

export function ModuleList({ modules }) {
  return <div className="module-list">
    {modules.map((module, index) => {
      const { name, note } = typeof module === 'string' ? { name: module } : module;
      const image = module.unresolved ? null : getModuleImage(name);
      return <div className="module-option" key={`${name}-${index}`}>
        {image ? <img src={image} alt={name} loading="lazy" /> : <span className="module-image-missing" aria-label={`No artwork available for ${name}`}>—</span>}
        <div><strong>{name}</strong>{note && <small>{note}</small>}</div>
      </div>;
    })}
  </div>;
}
