import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useHashRouting } from './useHashRouting';

describe('useHashRouting', () => {
  beforeEach(() => {
    // Reset hash before each test
    window.location.hash = '';
  });

  afterEach(() => {
    // Clean up
    window.location.hash = '';
  });

  it('should initialize with the default tab if the hash is empty', () => {
    const { result } = renderHook(() => useHashRouting('dashboard'));
    expect(result.current[0]).toBe('dashboard');
  });

  it('should initialize with the default tab if the hash is invalid', () => {
    window.location.hash = '#invalid-tab';
    const { result } = renderHook(() => useHashRouting('dashboard'));
    expect(result.current[0]).toBe('dashboard');
  });

  it('should initialize with the correct tab if the hash is a valid tab', () => {
    window.location.hash = '#robots';
    const { result } = renderHook(() => useHashRouting('dashboard'));
    expect(result.current[0]).toBe('robots');
  });

  it('should update the state correctly when a valid hashchange event occurs', () => {
    const { result } = renderHook(() => useHashRouting('dashboard'));

    expect(result.current[0]).toBe('dashboard');

    act(() => {
      window.location.hash = '#weapons';
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(result.current[0]).toBe('weapons');
  });

  it('should fallback to the default tab state if an invalid hashchange event occurs', () => {
    window.location.hash = '#robots';
    const { result } = renderHook(() => useHashRouting('dashboard'));

    expect(result.current[0]).toBe('robots');

    act(() => {
      window.location.hash = '#invalid-tab';
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(result.current[0]).toBe('dashboard');
  });

  it('should correctly modify window.location.hash when the setter function is called with a valid tab', () => {
    const { result } = renderHook(() => useHashRouting('dashboard'));

    act(() => {
      result.current[1]('hangar');
    });

    expect(window.location.hash).toBe('#hangar');
  });

  it('should ignore setter calls when an invalid tab is passed', () => {
    window.location.hash = '#builds';
    const { result } = renderHook(() => useHashRouting('dashboard'));

    act(() => {
      result.current[1]('invalid-tab');
    });

    expect(window.location.hash).toBe('#builds');
  });
});
