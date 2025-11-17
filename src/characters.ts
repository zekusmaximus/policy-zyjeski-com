/**
 * Character Bios and Relationship Visualization
 * Displays character profiles with filtering and interactive features
 */

import type {
  Character,
  CharactersData,
  CharacterFaction,
  CharacterPosition,
  BooksData
} from './types';

let charactersData: Character[] = [];
let booksData: BooksData | null = null;
let currentFilter: { faction?: CharacterFaction; position?: CharacterPosition } = {};
let unlockedDossiers: Set<string> = new Set();

/**
 * Load characters data
 */
async function loadCharactersData(): Promise<Character[]> {
  try {
    const response = await fetch('/data/characters.json');
    if (!response.ok) {
      throw new Error(`Failed to load characters: ${response.statusText}`);
    }
    const data = await response.json() as CharactersData;
    return data.characters;
  } catch (error) {
    console.error('Error loading characters data:', error);
    return [];
  }
}

/**
 * Load books data for cross-references
 */
async function loadBooksData(): Promise<BooksData | null> {
  try {
    const response = await fetch('/data/books.json');
    if (!response.ok) {
      throw new Error(`Failed to load books: ${response.statusText}`);
    }
    return await response.json() as BooksData;
  } catch (error) {
    console.error('Error loading books data:', error);
    return null;
  }
}

/**
 * Get unlocked dossiers from local storage
 */
function loadUnlockedDossiers(): void {
  const stored = localStorage.getItem('unlockedDossiers');
  if (stored) {
    unlockedDossiers = new Set(JSON.parse(stored));
  }
}

/**
 * Save unlocked dossiers to local storage
 */
function saveUnlockedDossiers(): void {
  localStorage.setItem('unlockedDossiers', JSON.stringify(Array.from(unlockedDossiers)));
}

/**
 * Unlock a character's classified dossier
 */
function unlockDossier(characterId: string): void {
  if (!unlockedDossiers.has(characterId)) {
    unlockedDossiers.add(characterId);
    saveUnlockedDossiers();

    // Track in analytics if available
    if (window.analytics) {
      window.analytics.logEvent('dossier_unlocked', { character_id: characterId });
    }
  }
}

/**
 * Create faction badge HTML
 */
function createFactionBadge(faction: CharacterFaction): string {
  const factionLabels: Record<CharacterFaction, string> = {
    progressive: 'Progressive',
    conservative: 'Conservative',
    corporate: 'Corporate',
    ai: 'AI Rights',
    moderate: 'Moderate'
  };
  return `<span class="faction-badge faction-${faction}">${factionLabels[faction]}</span>`;
}

/**
 * Create position badge HTML
 */
function createPositionBadge(position: CharacterPosition): string {
  const positionLabels: Record<CharacterPosition, string> = {
    support: 'Supports H.B. 2077',
    oppose: 'Opposes H.B. 2077',
    conflicted: 'Conflicted',
    neutral: 'Neutral'
  };
  const positionIcons: Record<CharacterPosition, string> = {
    support: '✓',
    oppose: '✗',
    conflicted: '~',
    neutral: '○'
  };
  return `<span class="position-badge position-${position}">${positionIcons[position]} ${positionLabels[position]}</span>`;
}

/**
 * Create character card HTML
 */
function createCharacterCard(character: Character): string {
  const ageDisplay = character.type === 'human'
    ? `Age ${character.age}`
    : `Activated ${character.activationDate}`;

  const typeIcon = character.type === 'human' ? '👤' : '🤖';

  const hasDossier = !!character.classifiedDossier;
  const isDossierUnlocked = unlockedDossiers.has(character.id);

  const appearsInHTML = character.appearsIn && character.appearsIn.length > 0
    ? `<div class="appears-in">
         <strong>Appears in:</strong> ${character.appearsIn.map(book =>
           `<span class="book-reference">${book}</span>`
         ).join(', ')}
       </div>`
    : '';

  return `
    <div class="character-card" data-character-id="${character.id}">
      <div class="character-header">
        <div class="character-type-icon">${typeIcon}</div>
        <div>
          <h3 class="character-name">${character.name}</h3>
          <p class="character-title">${character.title}</p>
          <p class="character-age">${ageDisplay}</p>
        </div>
      </div>
      <div class="character-badges">
        ${createFactionBadge(character.faction)}
        ${createPositionBadge(character.position)}
      </div>
      <blockquote class="character-quote">"${character.quote}"</blockquote>
      <button class="view-details-btn" data-character-id="${character.id}">
        View Full Profile
      </button>
      ${hasDossier ? `
        <button class="dossier-btn ${isDossierUnlocked ? 'unlocked' : 'locked'}"
                data-character-id="${character.id}">
          ${isDossierUnlocked ? '📂 View Classified Dossier' : '🔒 Classified Dossier'}
        </button>
      ` : ''}
      ${appearsInHTML}
    </div>
  `;
}

/**
 * Create character detail modal HTML
 */
function createCharacterModal(character: Character): string {
  const ageDisplay = character.type === 'human'
    ? `<p><strong>Age:</strong> ${character.age}</p>`
    : `<p><strong>Activated:</strong> ${character.activationDate}</p>`;

  const relationshipsHTML = character.relationships && character.relationships.length > 0
    ? `<div class="relationships-section">
         <h4>Key Relationships</h4>
         <ul class="relationships-list">
           ${character.relationships.map(rel => {
             const relatedChar = charactersData.find(c => c.id === rel.characterId);
             return `<li class="relationship-item">
               <span class="relationship-type">${rel.type}</span>
               <strong>${relatedChar?.name || rel.characterId}</strong>: ${rel.description}
             </li>`;
           }).join('')}
         </ul>
         <button class="view-relationships-btn" data-character-id="${character.id}">
           View Relationship Map
         </button>
       </div>`
    : '';

  const appearsInHTML = character.appearsIn && character.appearsIn.length > 0
    ? `<div class="appears-in-section">
         <h4>Featured In</h4>
         <ul class="books-list">
           ${character.appearsIn.map(bookTitle => {
             const book = booksData?.books.find(b => b.title === bookTitle);
             return `<li class="book-item">
               <strong>${bookTitle}</strong>
               ${book ? `<p>${book.description}</p>` : ''}
               ${book?.purchaseUrl ? `<a href="${book.purchaseUrl}" class="book-link" target="_blank">Learn More</a>` : ''}
             </li>`;
           }).join('')}
         </ul>
       </div>`
    : '';

  return `
    <div class="modal-overlay" id="character-modal">
      <div class="modal-content character-modal-content">
        <button class="modal-close">&times;</button>
        <div class="character-detail">
          <h2>${character.name}</h2>
          <p class="character-title-modal">${character.title}</p>
          ${ageDisplay}
          <div class="character-badges-modal">
            ${createFactionBadge(character.faction)}
            ${createPositionBadge(character.position)}
          </div>

          <div class="bio-section">
            <h3>Biography</h3>
            <p>${character.bio}</p>
          </div>

          <div class="quote-section">
            <h3>Key Quote</h3>
            <blockquote>"${character.quote}"</blockquote>
          </div>

          ${relationshipsHTML}
          ${appearsInHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * Create relationship visualization modal
 */
function createRelationshipModal(character: Character): string {
  // Simple text-based relationship visualization
  // For a full implementation, would use D3.js or Cytoscape.js
  const relationships = character.relationships || [];

  const relatedChars = relationships.map(rel => {
    const relChar = charactersData.find(c => c.id === rel.characterId);
    return { ...rel, character: relChar };
  });

  return `
    <div class="modal-overlay" id="relationship-modal">
      <div class="modal-content relationship-modal-content">
        <button class="modal-close">&times;</button>
        <h2>Relationship Map: ${character.name}</h2>
        <div class="relationship-visualization">
          <div class="center-character">
            <div class="character-node main-node">
              <strong>${character.name}</strong>
              <p>${character.title}</p>
            </div>
          </div>
          <div class="connected-characters">
            ${relatedChars.map(rel => `
              <div class="relationship-connection">
                <div class="connection-line ${rel.type}"></div>
                <div class="character-node ${rel.type}-node">
                  <span class="relationship-label">${rel.type}</span>
                  <strong>${rel.character?.name || 'Unknown'}</strong>
                  <p>${rel.description}</p>
                  ${rel.character ? `
                    <button class="view-character-btn" data-character-id="${rel.characterId}">
                      View Profile
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <p class="visualization-note">For a full interactive relationship graph, explore all characters and their connections.</p>
      </div>
    </div>
  `;
}

/**
 * Show character detail modal
 */
function showCharacterModal(characterId: string): void {
  const character = charactersData.find(c => c.id === characterId);
  if (!character) return;

  // Remove existing modal
  const existingModal = document.getElementById('character-modal');
  if (existingModal) existingModal.remove();

  // Create and append modal
  const modalHTML = createCharacterModal(character);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Track view
  if (window.analytics) {
    window.analytics.logEvent('character_viewed', { character_id: characterId });
  }

  // Attach event listeners
  const modal = document.getElementById('character-modal');
  if (modal) {
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Relationship map button
    modal.querySelector('.view-relationships-btn')?.addEventListener('click', (e) => {
      const charId = (e.target as HTMLElement).dataset.characterId;
      if (charId) showRelationshipModal(charId);
    });

    // Book links
    modal.querySelectorAll('.book-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.analytics) {
          window.analytics.logEvent('book_link_clicked', {
            character_id: characterId,
            source: 'character_modal'
          });
        }
      });
    });
  }
}

/**
 * Show relationship visualization modal
 */
function showRelationshipModal(characterId: string): void {
  const character = charactersData.find(c => c.id === characterId);
  if (!character) return;

  // Remove existing modals
  document.getElementById('character-modal')?.remove();
  document.getElementById('relationship-modal')?.remove();

  // Create and append modal
  const modalHTML = createRelationshipModal(character);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Track view
  if (window.analytics) {
    window.analytics.logEvent('relationship_graph_viewed', { character_id: characterId });
  }

  // Attach event listeners
  const modal = document.getElementById('relationship-modal');
  if (modal) {
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // View character buttons
    modal.querySelectorAll('.view-character-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const charId = (e.target as HTMLElement).dataset.characterId;
        if (charId) {
          modal.remove();
          showCharacterModal(charId);
        }
      });
    });
  }
}

/**
 * Show classified dossier
 */
function showDossier(characterId: string): void {
  const character = charactersData.find(c => c.id === characterId);
  if (!character || !character.classifiedDossier) return;

  const isUnlocked = unlockedDossiers.has(characterId);

  if (!isUnlocked) {
    // Show unlock hint
    alert(`🔒 Classified Dossier Locked\n\nHint: ${character.classifiedDossier.unlockHint}\n\nFind and explore this content to unlock the dossier!`);
    return;
  }

  // Show dossier content
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content dossier-modal-content">
      <button class="modal-close">&times;</button>
      <div class="dossier-header">
        <h2>🔓 CLASSIFIED DOSSIER</h2>
        <p class="dossier-subject">Subject: ${character.name}</p>
      </div>
      <div class="dossier-content">
        <p>${character.classifiedDossier.content}</p>
      </div>
      <div class="dossier-footer">
        <p>Classification Level: RESTRICTED</p>
        <p>Authorized Personnel Only</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

/**
 * Filter characters
 */
function filterCharacters(): void {
  let filtered = charactersData;

  if (currentFilter.faction) {
    filtered = filtered.filter(c => c.faction === currentFilter.faction);
  }

  if (currentFilter.position) {
    filtered = filtered.filter(c => c.position === currentFilter.position);
  }

  renderCharacters(filtered);

  // Track filter usage
  if (window.analytics && (currentFilter.faction || currentFilter.position)) {
    window.analytics.logEvent('character_filtered', {
      faction: currentFilter.faction || 'all',
      position: currentFilter.position || 'all'
    });
  }
}

/**
 * Render characters list
 */
function renderCharacters(characters: Character[]): void {
  const container = document.getElementById('characters-container');
  if (!container) return;

  if (characters.length === 0) {
    container.innerHTML = '<p class="no-results">No characters match the current filters.</p>';
    return;
  }

  container.innerHTML = characters.map(c => createCharacterCard(c)).join('');

  // Attach event listeners
  container.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const characterId = (e.target as HTMLElement).dataset.characterId;
      if (characterId) showCharacterModal(characterId);
    });
  });

  container.querySelectorAll('.dossier-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const characterId = (e.target as HTMLElement).dataset.characterId;
      if (characterId) showDossier(characterId);
    });
  });
}

/**
 * Initialize character bios page
 */
export async function renderCharactersPage(): Promise<void> {
  const container = document.getElementById('characters-container');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">Loading character profiles...</p>';

  // Load data
  charactersData = await loadCharactersData();
  booksData = await loadBooksData();
  loadUnlockedDossiers();

  if (charactersData.length === 0) {
    container.innerHTML = '<p class="error-message">Failed to load character data.</p>';
    return;
  }

  // Render characters
  renderCharacters(charactersData);

  // Setup filter controls
  setupFilterControls();
}

/**
 * Setup filter controls
 */
function setupFilterControls(): void {
  const factionFilter = document.getElementById('faction-filter') as HTMLSelectElement;
  const positionFilter = document.getElementById('position-filter') as HTMLSelectElement;

  if (factionFilter) {
    factionFilter.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      currentFilter.faction = value ? value as CharacterFaction : undefined;
      filterCharacters();
    });
  }

  if (positionFilter) {
    positionFilter.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      currentFilter.position = value ? value as CharacterPosition : undefined;
      filterCharacters();
    });
  }
}

/**
 * Easter egg: Unlock dossier (called from external triggers)
 */
export function triggerDossierUnlock(characterId: string): void {
  unlockDossier(characterId);

  // Show notification
  const notification = document.createElement('div');
  notification.className = 'toast-notification toast-success';
  notification.textContent = '🔓 Classified Dossier Unlocked!';
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Expose to window for global access
declare global {
  interface Window {
    analytics?: any;
    triggerDossierUnlock?: typeof triggerDossierUnlock;
  }
}

if (typeof window !== 'undefined') {
  window.triggerDossierUnlock = triggerDossierUnlock;
}
