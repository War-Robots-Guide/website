import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { BuildGuidesTab } from './BuildGuidesTab';

describe('BuildGuidesTab Performance', () => {
  it('measures render time', () => {
    const iterations = 20;

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<BuildGuidesTab />);
      unmount();
    }
    const end = performance.now();

    console.log(`Rendered ${iterations} times in ${end - start} ms`);
    console.log(`Average render time: ${(end - start) / iterations} ms`);
  });
});
