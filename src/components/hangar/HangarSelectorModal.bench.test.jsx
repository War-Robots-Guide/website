import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { HangarSelectorModal } from './HangarSelectorModal';

describe('HangarSelectorModal Performance', () => {
  it('measures render time with filtering', () => {
    const iterations = 50;

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(
        <HangarSelectorModal
          activeSlot={1}
          selectorSearchQuery="a"
          setSelectorSearchQuery={() => {}}
          onClose={() => {}}
          onSelect={() => {}}
        />
      );
      unmount();
    }
    const end = performance.now();

    console.log(`[Optimized] Rendered ${iterations} times in ${end - start} ms`);
    console.log(`[Optimized] Average render time: ${(end - start) / iterations} ms`);
  }, 10000);
});
