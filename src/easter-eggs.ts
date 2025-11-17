/**
 * Easter Eggs and Cross-References System
 * Hidden references page that connects portal content to published works
 */

import type { CrossReference, CrossReferencesData, BooksData, Book } from './types';

let referencesData: CrossReference[] = [];
let booksData: Book[] = [];
let discoveredReferences: Set<string> = new Set();

/**
 * Load cross-references data
 */
async function loadCrossReferences(): Promise<CrossReference[]> {
  try {
    const response = await fetch('/data/cross-references.json');
    if (!response.ok) {
      throw new Error(`Failed to load cross-references: ${response.statusText}`);
    }
    const data = await response.json() as CrossReferencesData;
    return data.references;
  } catch (error) {
    console.error('Error loading cross-references:', error);
    return [];
  }
}

/**
 * Load books data
 */
async function loadBooksData(): Promise<Book[]> {
  try {
    const response = await fetch('/data/books.json');
    if (!response.ok) {
      throw new Error(`Failed to load books: ${response.statusText}`);
    }
    const data = await response.json() as BooksData;
    return data.books;
  } catch (error) {
    console.error('Error loading books:', error);
    return [];
  }
}

/**
 * Load discovered references from localStorage
 */
function loadDiscoveredReferences(): void {
  const stored = localStorage.getItem('discoveredReferences');
  if (stored) {
    discoveredReferences = new Set(JSON.parse(stored));
  }
}

/**
 * Save discovered references to localStorage
 */
function saveDiscoveredReferences(): void {
  localStorage.setItem('discoveredReferences', JSON.stringify(Array.from(discoveredReferences)));
}

/**
 * Mark reference as discovered
 */
export function discoverReference(referenceId: string): void {
  if (!discoveredReferences.has(referenceId)) {
    discoveredReferences.add(referenceId);
    saveDiscoveredReferences();

    // Track discovery
    if (window.analytics) {
      window.analytics.logEvent('easter_egg_discovered', {
        reference_id: referenceId
      });
    }

    // Show notification
    showDiscoveryNotification(referenceId);

    // Check for achievement
    checkAchievements();
  }
}

/**
 * Show discovery notification
 */
function showDiscoveryNotification(referenceId: string): void {
  const reference = referencesData.find(r => r.id === referenceId);
  if (!reference) return;

  const notification = document.createElement('div');
  notification.className = 'toast-notification toast-discovery';
  notification.innerHTML = `
    <div class="discovery-notification">
      <span class="discovery-icon">🔍</span>
      <div>
        <strong>Reference Discovered!</strong>
        <p>${reference.name}</p>
      </div>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Check for achievements
 */
function checkAchievements(): void {
  const totalReferences = referencesData.length;
  const discovered = discoveredReferences.size;

  // Easter Egg Hunter achievement (5+ references)
  if (discovered === 5 && !localStorage.getItem('achievement_hunter')) {
    localStorage.setItem('achievement_hunter', 'true');
    showAchievementNotification('Easter Egg Hunter', 'Discovered 5 cross-references');
  }

  // Complete the Collection achievement (all references)
  if (discovered === totalReferences && !localStorage.getItem('achievement_completionist')) {
    localStorage.setItem('achievement_completionist', 'true');
    showAchievementNotification('Completionist', 'Discovered all cross-references!');
  }
}

/**
 * Show achievement notification
 */
function showAchievementNotification(title: string, description: string): void {
  const notification = document.createElement('div');
  notification.className = 'toast-notification toast-achievement';
  notification.innerHTML = `
    <div class="achievement-notification">
      <span class="achievement-icon">🏆</span>
      <div>
        <strong>${title}</strong>
        <p>${description}</p>
      </div>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);

  // Track achievement
  if (window.analytics) {
    window.analytics.logEvent('achievement_unlocked', {
      achievement: title
    });
  }
}

/**
 * Create reference card HTML
 */
function createReferenceCard(reference: CrossReference, isDiscovered: boolean): string {
  const typeIcons: Record<typeof reference.type, string> = {
    character: '👤',
    location: '📍',
    event: '⏰',
    organization: '🏢'
  };

  const book = booksData.find(b => b.id === reference.bookId);

  if (!isDiscovered) {
    return `
      <div class="reference-card locked">
        <div class="reference-header">
          <span class="reference-icon">🔒</span>
          <span class="reference-type">${reference.type}</span>
        </div>
        <div class="reference-hint">
          <p><strong>Hint:</strong> ${reference.hint || 'Explore the portal to discover this reference'}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="reference-card discovered">
      <div class="reference-header">
        <span class="reference-icon">${typeIcons[reference.type]}</span>
        <h3>${reference.name}</h3>
        <span class="reference-type">${reference.type}</span>
      </div>
      <div class="reference-content">
        <div class="reference-location">
          <strong>In Portal:</strong> ${reference.inPortal}
        </div>
        <div class="reference-book">
          <strong>In Fiction:</strong> ${reference.inBook}
        </div>
        <p class="reference-description">${reference.description}</p>
        ${book ? `
          <div class="reference-book-info">
            <strong>Featured in: ${book.title}</strong>
            ${book.description ? `<p>${book.description}</p>` : ''}
            ${book.purchaseUrl ? `
              <a href="${book.purchaseUrl}" class="book-link" data-book-id="${book.id}" target="_blank">
                Learn More →
              </a>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render references page
 */
export async function renderReferencesPage(): Promise<void> {
  const container = document.getElementById('references-container');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">Loading cross-references...</p>';

  // Load data
  referencesData = await loadCrossReferences();
  booksData = await loadBooksData();
  loadDiscoveredReferences();

  if (referencesData.length === 0) {
    container.innerHTML = '<p class="error-message">Failed to load references data.</p>';
    return;
  }

  const discoveredCount = discoveredReferences.size;
  const totalCount = referencesData.length;

  // Create header with progress
  const header = `
    <div class="references-header">
      <h2>Hidden References & Easter Eggs</h2>
      <p class="references-intro">
        This portal contains hidden references to characters, locations, and events from the author's published works.
        Explore the site to discover them all!
      </p>
      <div class="discovery-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(discoveredCount / totalCount * 100)}%"></div>
        </div>
        <p class="progress-text">
          Discovered: ${discoveredCount} / ${totalCount}
          ${discoveredCount === totalCount ? ' 🏆 All Found!' : ''}
        </p>
      </div>
    </div>
  `;

  // Group references by type
  const byType: Record<string, CrossReference[]> = {
    character: [],
    location: [],
    event: [],
    organization: []
  };

  referencesData.forEach(ref => {
    if (byType[ref.type]) {
      byType[ref.type]!.push(ref);
    }
  });

  // Create sections for each type
  let sectionsHTML = '';
  Object.entries(byType).forEach(([type, refs]) => {
    if (refs.length === 0) return;

    sectionsHTML += `
      <div class="references-section">
        <h3>${type.charAt(0).toUpperCase() + type.slice(1)} References</h3>
        <div class="references-grid">
          ${refs.map(ref => createReferenceCard(ref, discoveredReferences.has(ref.id))).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = header + sectionsHTML;

  // Track page view
  if (window.analytics) {
    window.analytics.logEvent('reference_page_visited', {
      discovered_count: discoveredCount,
      total_count: totalCount
    });
  }

  // Attach book link tracking
  container.querySelectorAll('.book-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const bookId = (e.target as HTMLElement).dataset.bookId;
      if (window.analytics) {
        window.analytics.logEvent('book_link_clicked', {
          book_id: bookId,
          source: 'references_page'
        });
      }
    });
  });
}

/**
 * Auto-discover references when visiting certain pages/sections
 */
export function setupAutoDiscovery(): void {
  // Discover references based on page visits and interactions

  // Example: Discover character references when viewing character bios
  document.addEventListener('characterViewed', ((e: CustomEvent) => {
    const characterId = e.detail.characterId;
    const reference = referencesData.find(r =>
      r.type === 'character' && r.name.toLowerCase().includes(characterId.replace('-', ' '))
    );
    if (reference) {
      discoverReference(reference.id);
    }
  }) as EventListener);

  // Discover references when reading lore timeline
  const loreSection = document.getElementById('page-lore');
  if (loreSection) {
    loreSection.addEventListener('click', () => {
      // Auto-discover timeline event references
      const eventRefs = referencesData.filter(r => r.type === 'event');
      eventRefs.forEach(ref => {
        // Discover after spending time on lore page
        setTimeout(() => discoverReference(ref.id), 5000);
      });
    }, { once: true });
  }
}

// Expose to window for global access
declare global {
  interface Window {
    discoverReference?: typeof discoverReference;
  }
}

if (typeof window !== 'undefined') {
  window.discoverReference = discoverReference;
}
