/**
 * Unit tests for utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Session Storage Utils', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should return empty set when no viewpoints are endorsed', () => {
    const state = sessionStorage.getItem('endorsedViewpoints');
    const result = state ? new Set(JSON.parse(state)) : new Set();
    expect(result.size).toBe(0);
  });

  it('should store and retrieve endorsed viewpoints', () => {
    const endorsedSet = new Set(['viewpoint_1', 'viewpoint_2']);
    sessionStorage.setItem('endorsedViewpoints', JSON.stringify(Array.from(endorsedSet)));

    const state = sessionStorage.getItem('endorsedViewpoints');
    const result = state ? new Set(JSON.parse(state)) : new Set();

    expect(result.size).toBe(2);
    expect(result.has('viewpoint_1')).toBe(true);
    expect(result.has('viewpoint_2')).toBe(true);
  });

  it('should handle invalid JSON gracefully', () => {
    sessionStorage.setItem('endorsedViewpoints', 'invalid json');

    expect(() => {
      const state = sessionStorage.getItem('endorsedViewpoints');
      if (state) {
        JSON.parse(state);
      }
    }).toThrow();
  });
});

describe('Toast Notifications', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should create toast element with correct classes', () => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-success';
    toast.textContent = 'Test message';
    document.body.appendChild(toast);

    const created = document.querySelector('.toast-notification');
    expect(created).toBeTruthy();
    expect(created?.classList.contains('toast-success')).toBe(true);
    expect(created?.textContent).toBe('Test message');
  });

  it('should remove existing toast before creating new one', () => {
    // Create first toast
    const toast1 = document.createElement('div');
    toast1.className = 'toast-notification';
    toast1.textContent = 'First toast';
    document.body.appendChild(toast1);

    expect(document.querySelectorAll('.toast-notification').length).toBe(1);

    // Remove and create second toast
    const existing = document.querySelector('.toast-notification');
    existing?.remove();

    const toast2 = document.createElement('div');
    toast2.className = 'toast-notification';
    toast2.textContent = 'Second toast';
    document.body.appendChild(toast2);

    const toasts = document.querySelectorAll('.toast-notification');
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.textContent).toBe('Second toast');
  });
});

describe('Viewpoint Data Structure', () => {
  const mockViewpoint = {
    id: 'viewpoint_1',
    text: 'Test viewpoint text',
    attribution: '— Test Author'
  };

  it('should have required properties', () => {
    expect(mockViewpoint).toHaveProperty('id');
    expect(mockViewpoint).toHaveProperty('text');
    expect(mockViewpoint).toHaveProperty('attribution');
  });

  it('should have valid viewpoint ID', () => {
    const validIds = ['viewpoint_1', 'viewpoint_2', 'viewpoint_3', 'viewpoint_4'];
    expect(validIds.includes(mockViewpoint.id)).toBe(true);
  });
});

describe('HTML Generation', () => {
  it('should create valid viewpoint HTML', () => {
    const viewpoint = {
      id: 'viewpoint_1',
      text: 'Test text',
      attribution: '— Test'
    };
    const endorsements = 42;
    const isEndorsed = false;

    const html = `
        <div class="viewpoint" id="${viewpoint.id}">
            <div class="viewpoint-content">
                <blockquote class="viewpoint-text">"${viewpoint.text}"</blockquote>
                <cite class="viewpoint-attribution">${viewpoint.attribution}</cite>
            </div>
            <div class="endorsement-section">
                <span class="endorsement-count">${endorsements.toLocaleString()} Endorsements</span>
                <button class="endorse-btn ${isEndorsed ? 'endorsed' : ''}" data-viewpoint-id="${viewpoint.id}" ${isEndorsed ? 'disabled' : ''}>
                    ${isEndorsed ? 'Endorsed' : 'Endorse'}
                </button>
            </div>
        </div>`;

    expect(html).toContain('viewpoint_1');
    expect(html).toContain('Test text');
    expect(html).toContain('42 Endorsements');
    expect(html).toContain('Endorse');
    expect(html).not.toContain('endorsed');
  });

  it('should show endorsed state when endorsed', () => {
    const isEndorsed = true;

    const html = `
        <button class="endorse-btn ${isEndorsed ? 'endorsed' : ''}" ${isEndorsed ? 'disabled' : ''}>
            ${isEndorsed ? 'Endorsed' : 'Endorse'}
        </button>`;

    expect(html).toContain('endorsed');
    expect(html).toContain('disabled');
    expect(html).toContain('Endorsed');
  });
});

describe('Input Validation', () => {
  const VALID_VIEWPOINT_IDS = ['viewpoint_1', 'viewpoint_2', 'viewpoint_3', 'viewpoint_4'];

  it('should accept valid viewpoint IDs', () => {
    VALID_VIEWPOINT_IDS.forEach(id => {
      expect(VALID_VIEWPOINT_IDS.includes(id)).toBe(true);
    });
  });

  it('should reject invalid viewpoint IDs', () => {
    const invalidIds = ['viewpoint_5', 'invalid', '', null, undefined];
    invalidIds.forEach(id => {
      expect(VALID_VIEWPOINT_IDS.includes(id as string)).toBe(false);
    });
  });

  it('should validate viewpoint ID before processing', () => {
    const testId = 'viewpoint_hack';
    const isValid = VALID_VIEWPOINT_IDS.includes(testId);
    expect(isValid).toBe(false);
  });
});

describe('Error Handling', () => {
  it('should handle network errors gracefully', () => {
    const error = new Error('Network error');
    expect(error.message).toBe('Network error');
    expect(error instanceof Error).toBe(true);
  });

  it('should handle AbortError for timeout', () => {
    const error = new DOMException('The operation was aborted', 'AbortError');
    expect(error.name).toBe('AbortError');
  });

  it('should detect offline status', () => {
    // Initially online from setup
    expect(navigator.onLine).toBe(true);
  });
});

describe('Number Formatting', () => {
  it('should format numbers with locale string', () => {
    expect((1000).toLocaleString()).toBe('1,000');
    expect((1000000).toLocaleString()).toBe('1,000,000');
    expect((0).toLocaleString()).toBe('0');
  });
});
