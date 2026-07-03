import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePathRouting } from './usePathRouting';

describe('usePathRouting', () => {
  let originalPathname;

  beforeEach(() => {
    originalPathname = window.location.pathname;
    window.history.pushState(null, '', '/');
  });

  afterEach(() => {
    window.history.pushState(null, '', originalPathname);
  });

  it('should initialize with the default tab if the path is empty', () => {
    const { result } = renderHook(() => usePathRouting('dashboard'));
    expect(result.current[0]).toBe('dashboard');
  });

  it('should initialize with the default tab if the path is invalid', () => {
    window.history.pushState(null, '', '/invalid-tab');
    const { result } = renderHook(() => usePathRouting('dashboard'));
    expect(result.current[0]).toBe('dashboard');
  });

  it('should initialize with the correct tab if the path is a valid tab', () => {
    window.history.pushState(null, '', '/robots');
    const { result } = renderHook(() => usePathRouting('dashboard'));
    expect(result.current[0]).toBe('robots');
  });

  it('should update the state correctly when a valid popstate event occurs', () => {
    const { result } = renderHook(() => usePathRouting('dashboard'));

    expect(result.current[0]).toBe('dashboard');

    act(() => {
      window.history.pushState(null, '', '/weapons');
      window.dispatchEvent(new Event('popstate'));
    });

    expect(result.current[0]).toBe('weapons');
  });

  it('should fallback to the default tab state if an invalid popstate event occurs', () => {
    window.history.pushState(null, '', '/robots');
    const { result } = renderHook(() => usePathRouting('dashboard'));

    expect(result.current[0]).toBe('robots');

    act(() => {
      window.history.pushState(null, '', '/invalid-tab');
      window.dispatchEvent(new Event('popstate'));
    });

    expect(result.current[0]).toBe('dashboard');
  });

  it('should correctly modify window.location.pathname when the setter function is called with a valid tab', () => {
    const { result } = renderHook(() => usePathRouting('dashboard'));

    act(() => {
      result.current[1]('hangar');
    });

    expect(window.location.pathname).toBe('/hangar');
  });

  it('should ignore setter calls when an invalid tab is passed', () => {
    window.history.pushState(null, '', '/builds');
    const { result } = renderHook(() => usePathRouting('dashboard'));

    act(() => {
      result.current[1]('invalid-tab');
    });

    expect(window.location.pathname).toBe('/builds');
  });
});
