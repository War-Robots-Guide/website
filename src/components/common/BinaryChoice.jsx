import { useId } from 'react';

// Explicit choices avoid platform-dependent two-item native select menus.
export function BinaryChoice({ label, value, options, onChange }) {
  const name = useId();
  return <fieldset className="binary-choice">
    <legend>{label}</legend>
    {options.map(option => <label key={option.value} className={value === option.value ? 'active' : ''}>
      <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      {option.label}
    </label>)}
  </fieldset>;
}
