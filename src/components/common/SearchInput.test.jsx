import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput Component', () => {
  it('renders correctly with placeholder', () => {
    render(<SearchInput placeholder="Search items..." />);

    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('renders the search icon', () => {
    const { container } = render(<SearchInput placeholder="Search..." />);

    // The lucide-react icon renders as an svg
    const svgElement = container.querySelector('svg.search-input-icon');
    expect(svgElement).toBeInTheDocument();
  });

  it('respects the value prop', () => {
    render(<SearchInput value="test value" onChange={() => {}} placeholder="Search..." />);

    const inputElement = screen.getByPlaceholderText('Search...');
    expect(inputElement).toHaveValue('test value');
  });

  it('fires the onChange event when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchInput value="" onChange={handleChange} placeholder="Search..." />);

    const inputElement = screen.getByPlaceholderText('Search...');
    await user.type(inputElement, 'a');

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('spreads additional props to the underlying input element', () => {
    render(
      <SearchInput
        placeholder="Search..."
        data-testid="search-input-test"
        disabled={true}
        id="search-input-id"
      />
    );

    const inputElement = screen.getByTestId('search-input-test');
    expect(inputElement).toBeDisabled();
    expect(inputElement).toHaveAttribute('id', 'search-input-id');
  });
});
