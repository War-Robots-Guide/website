import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreMeter } from './ScoreMeter';

describe('ScoreMeter Component', () => {
  it('renders correctly with required props', () => {
    const { container } = render(<ScoreMeter label="Test Label" score={5} />);

    // Check if the label is rendered
    expect(screen.getByText('Test Label')).toBeInTheDocument();

    // Check if the score is rendered (since useScaleLabel is false by default, score is just '5')
    expect(screen.getByText('5')).toBeInTheDocument();

    // The percentage formula: Math.max(0, Math.min(100, ((5 - 0) / (10 - 0)) * 100)) = 50%
    const fillElement = container.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '50%' });
  });

  it('renders correctly with a positive score and scale label when enabled', () => {
    const { container } = render(<ScoreMeter label="Test Label" score={8} options={{ useScaleLabel: true }} />);

    // Score should have a '+' prefix when enabled
    expect(screen.getByText('+8')).toBeInTheDocument();

    // The percentage formula: Math.max(0, Math.min(100, ((8 - 0) / (10 - 0)) * 100)) = 80%
    const fillElement = container.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '80%' });
    expect(fillElement).not.toHaveClass('negative');
  });

  it('renders correctly with a negative score', () => {
    const { container } = render(<ScoreMeter label="Test Label" score={-1} />);

    // Score should just be '-1'
    expect(screen.getByText('-1')).toBeInTheDocument();

    // The percentage formula: Math.max(0, Math.min(100, ((-1 - 0) / (10 - 0)) * 100)) = 0%
    const fillElement = container.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '0%' });
    expect(fillElement).toHaveClass('negative');
  });

  it('handles score parsed as string', () => {
    render(<ScoreMeter label="Test Label" score="8" />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('handles non-integer score gracefully (falls back to 0)', () => {
    render(<ScoreMeter label="Test Label" score="abc" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('clamps percentage to 0 when score is below min', () => {
    const { container } = render(<ScoreMeter label="Test Label" score={-5} options={{ min: -2, max: 3 }} />);

    const fillElement = container.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '0%' });
    expect(fillElement).toHaveClass('negative');
  });

  it('clamps percentage to 100 when score is above max', () => {
    const { container } = render(<ScoreMeter label="Test Label" score={5} options={{ min: -2, max: 3 }} />);

    const fillElement = container.querySelector('.score-fill');
    expect(fillElement).toHaveStyle({ width: '100%' });
    expect(fillElement).not.toHaveClass('negative');
  });

  describe('custom options', () => {
    it('uses custom min and max bounds', () => {
      const { container } = render(<ScoreMeter label="Test Label" score={5} options={{ min: 0, max: 10 }} />);

      // The percentage formula: ((5 - 0) / (10 - 0)) * 100 = 50%
      const fillElement = container.querySelector('.score-fill');
      expect(fillElement).toHaveStyle({ width: '50%' });
    });

    it('uses customPercentage instead of calculated percentage', () => {
      const { container } = render(<ScoreMeter label="Test Label" score={0} options={{ customPercentage: 75 }} />);

      const fillElement = container.querySelector('.score-fill');
      expect(fillElement).toHaveStyle({ width: '75%' });
    });

    it('renders customValueLabel and customBadge', () => {
      render(
        <ScoreMeter
          label="Test Label"
          score={0}
          options={{
            customValueLabel: "Custom Value",
            customBadge: <span data-testid="custom-badge">Badge</span>
          }}
        />
      );

      expect(screen.getByText('Custom Value')).toBeInTheDocument();
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
      // Original score should not be rendered when customValueLabel is provided
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('applies customFillColor with correct styles', () => {
      const { container } = render(
        <ScoreMeter
          label="Test Label"
          score={-1}
          options={{ customFillColor: '#ff00ff' }}
        />
      );

      const fillElement = container.querySelector('.score-fill');
      expect(fillElement).toHaveStyle({ backgroundColor: '#ff00ff', backgroundImage: 'none' });
      // When customFillColor is provided, it doesn't get the 'negative' class even if score < 0
      expect(fillElement).not.toHaveClass('negative');
    });

    it('renders score without scale label when useScaleLabel is false', () => {
      render(<ScoreMeter label="Test Label" score={2} options={{ useScaleLabel: false }} />);

      // Should be '2' instead of '+2'
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
