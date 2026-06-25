import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder, ...props }) {
  return (
    <div className="search-input-wrapper">
      <Search size={18} className="search-input-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}
