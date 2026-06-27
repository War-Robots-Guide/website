import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { DetailModal } from './DetailModal';

describe('DetailModal Benchmark', () => {
  it('renders quickly', () => {
    const selectedItem = {
      type: 'Weapons',
      name: 'Cryo',
      data: { description: 'A test weapon' }
    };

    const start = performance.now();
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <DetailModal selectedItem={selectedItem} onClose={() => {}} />
      );
      unmount();
    }
    const end = performance.now();

    console.log(`Render time for 500 iterations: ${end - start} ms`);
  });

  it('renders robots quickly', () => {
    const selectedItem = {
      type: 'Robots',
      name: 'Destrier',
      data: { description: 'A test robot' }
    };

    const start = performance.now();
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <DetailModal selectedItem={selectedItem} onClose={() => {}} />
      );
      unmount();
    }
    const end = performance.now();

    console.log(`Render time for 500 iterations (Robots): ${end - start} ms`);
  });
});
