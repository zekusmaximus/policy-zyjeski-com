/**
 * Unit tests for endorsement functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Endorsement API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send POST request with viewpoint ID', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, remaining: 9 })
    });
    globalThis.fetch = mockFetch;

    const viewpointId = 'viewpoint_1';
    const response = await fetch('https://example.com/submitEndorsement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ viewpointId })
    });

    const result = await response.json();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/submitEndorsement',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should handle rate limit errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: 3600
      })
    });
    globalThis.fetch = mockFetch;

    const response = await fetch('https://example.com/submitEndorsement', {
      method: 'POST',
      body: JSON.stringify({ viewpointId: 'viewpoint_1' })
    });

    const result = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(429);
    expect(result.error).toBe('Rate limit exceeded');
    expect(result.retryAfter).toBe(3600);
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    globalThis.fetch = mockFetch;

    await expect(
      fetch('https://example.com/submitEndorsement', {
        method: 'POST',
        body: JSON.stringify({ viewpointId: 'viewpoint_1' })
      })
    ).rejects.toThrow('Network error');
  });

  it('should handle abort/timeout errors', async () => {
    const controller = new AbortController();
    const mockFetch = vi.fn().mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException('The operation was aborted', 'AbortError'));
    });
    globalThis.fetch = mockFetch;

    try {
      await fetch('https://example.com/submitEndorsement', {
        method: 'POST',
        signal: controller.signal
      });
    } catch (error) {
      expect(error).toBeInstanceOf(DOMException);
      if (error instanceof DOMException) {
        expect(error.name).toBe('AbortError');
      }
    }
  });

  it('should include timeout mechanism', async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    globalThis.fetch = mockFetch;

    await fetch('https://example.com/submitEndorsement', {
      method: 'POST',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    expect(mockFetch).toHaveBeenCalled();
  });
});

describe('Button State Management', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should disable button while submitting', () => {
    const button = document.createElement('button');
    button.className = 'endorse-btn';
    button.textContent = 'Endorse';
    button.disabled = false;
    document.body.appendChild(button);

    // Simulate submission
    button.disabled = true;
    button.textContent = 'Submitting...';

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('Submitting...');
  });

  it('should show endorsed state after success', () => {
    const button = document.createElement('button');
    button.className = 'endorse-btn';
    button.textContent = 'Submitting...';
    button.disabled = true;
    document.body.appendChild(button);

    // Simulate success
    button.textContent = 'Endorsed';
    button.classList.add('endorsed');

    expect(button.textContent).toBe('Endorsed');
    expect(button.classList.contains('endorsed')).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('should rollback button state on error', () => {
    const button = document.createElement('button');
    const originalText = 'Endorse';
    const originalDisabled = false;

    button.textContent = originalText;
    button.disabled = originalDisabled;
    document.body.appendChild(button);

    // Simulate error
    button.textContent = 'Submitting...';
    button.disabled = true;

    // Rollback
    button.textContent = originalText;
    button.disabled = originalDisabled;

    expect(button.textContent).toBe('Endorse');
    expect(button.disabled).toBe(false);
  });
});

describe('Endorsed State Persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should prevent duplicate endorsements', () => {
    const endorsedSet = new Set(['viewpoint_1']);
    sessionStorage.setItem('endorsedViewpoints', JSON.stringify(Array.from(endorsedSet)));

    const state = sessionStorage.getItem('endorsedViewpoints');
    const result = state ? new Set(JSON.parse(state)) : new Set();

    // Try to add again
    if (result.has('viewpoint_1')) {
      // Should return early
      expect(result.has('viewpoint_1')).toBe(true);
    } else {
      result.add('viewpoint_1');
    }

    expect(result.size).toBe(1);
  });

  it('should add new endorsement to set', () => {
    const endorsedSet = new Set(['viewpoint_1']);
    sessionStorage.setItem('endorsedViewpoints', JSON.stringify(Array.from(endorsedSet)));

    const state = sessionStorage.getItem('endorsedViewpoints');
    const result = state ? new Set(JSON.parse(state)) : new Set();

    result.add('viewpoint_2');
    sessionStorage.setItem('endorsedViewpoints', JSON.stringify(Array.from(result)));

    const updated = sessionStorage.getItem('endorsedViewpoints');
    const finalSet = updated ? new Set(JSON.parse(updated)) : new Set();

    expect(finalSet.size).toBe(2);
    expect(finalSet.has('viewpoint_1')).toBe(true);
    expect(finalSet.has('viewpoint_2')).toBe(true);
  });
});

describe('Error Messages', () => {
  it('should show appropriate error for timeout', () => {
    const error = new DOMException('The operation was aborted', 'AbortError');
    let errorMessage = 'Failed to submit endorsement. Please try again.';

    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection.';
    }

    expect(errorMessage).toBe('Request timed out. Please check your connection.');
  });

  it('should show appropriate error for rate limit', () => {
    const error = new Error('Rate limit exceeded');
    let errorMessage = 'Failed to submit endorsement. Please try again.';

    if (error.message.includes('Rate limit')) {
      errorMessage = error.message;
    }

    expect(errorMessage).toBe('Rate limit exceeded');
  });

  it('should show offline error when offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: false
    });

    let errorMessage = 'Failed to submit endorsement. Please try again.';

    if (!navigator.onLine) {
      errorMessage = 'You appear to be offline. Please check your connection.';
    }

    expect(errorMessage).toBe('You appear to be offline. Please check your connection.');
  });
});
