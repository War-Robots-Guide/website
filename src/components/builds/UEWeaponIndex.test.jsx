import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { UEWeaponIndex } from './UEWeaponIndex';

vi.mock('../../data/image_manifest.json', () => ({ default: {
  weapons: { ultimatepulsar: '/images/Ultimate Pulsar.png', ultimateion: '/images/Ultimate Ion.png' },
} }));

const index = { Midrange: 'Pulsar, Ion, Unpictured', Any: 'Anything goes.' };

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('cycles through listed Ultimate artwork, wraps, and preserves the complete weapon list', () => {
  render(<UEWeaponIndex index={index} />);
  const card = within(screen.getByRole('article', { name: 'Midrange Setups' }));
  expect(card.getByRole('img', { name: 'UE Pulsar' })).toHaveAttribute('src', '/images/Ultimate Pulsar.png');
  act(() => vi.advanceTimersByTime(3000));
  expect(card.getByRole('img', { name: 'UE Ion' })).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(3000));
  expect(card.getByRole('img', { name: 'UE Pulsar' })).toBeInTheDocument();
  expect(card.getByText('Pulsar, Ion, Unpictured')).toBeVisible();
});

it('pauses and resumes the preview and releases its timer on unmount', () => {
  const { unmount } = render(<UEWeaponIndex index={index} />);
  const card = within(screen.getByRole('article', { name: 'Midrange Setups' }));
  fireEvent.click(screen.getByRole('button', { name: 'Pause weapon previews' }));
  act(() => vi.advanceTimersByTime(6000));
  expect(card.getByRole('img', { name: 'UE Pulsar' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Play weapon previews' }));
  act(() => vi.advanceTimersByTime(3000));
  expect(card.getByRole('img', { name: 'UE Ion' })).toBeInTheDocument();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('starts paused for reduced motion and allows an explicit play request', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  render(<UEWeaponIndex index={index} />);
  const card = within(screen.getByRole('article', { name: 'Midrange Setups' }));
  act(() => vi.advanceTimersByTime(6000));
  expect(card.getByRole('img', { name: 'UE Pulsar' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Play weapon previews' }));
  act(() => vi.advanceTimersByTime(3000));
  expect(card.getByRole('img', { name: 'UE Ion' })).toBeInTheDocument();
});

it('skips broken artwork and keeps text usable when artwork is unavailable', () => {
  render(<UEWeaponIndex index={index} />);
  const card = within(screen.getByRole('article', { name: 'Midrange Setups' }));
  fireEvent.error(card.getByRole('img', { name: 'UE Pulsar' }));
  expect(card.getByRole('img', { name: 'UE Ion' })).toBeInTheDocument();
  fireEvent.error(card.getByRole('img', { name: 'UE Ion' }));
  expect(card.queryByRole('img')).not.toBeInTheDocument();
  expect(card.getByText('Pulsar, Ion, Unpictured')).toBeVisible();
});
