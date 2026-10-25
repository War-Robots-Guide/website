import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function GuideDisclosure({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="guide-disclosure">
    <button type="button" className="guide-disclosure-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <span>{title}</span><ChevronDown size={18} aria-hidden="true" className={open ? 'disclosure-open' : ''} />
    </button>
    {open && <div id={id} className="guide-disclosure-content">{children}</div>}
  </div>;
}
