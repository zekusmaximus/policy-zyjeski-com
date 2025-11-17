/**
 * Lore Page - Timeline and World-Building Module
 * Handles loading and rendering of ECC history, AI sentience timeline, and political context
 */

import type { LoreData, TimelineEvent, PoliticalContext, Faction } from './types';

/**
 * Load lore data from JSON file
 */
export async function loadLoreData(): Promise<LoreData | null> {
  try {
    const response = await fetch('/data/lore.json');
    if (!response.ok) {
      throw new Error(`Failed to load lore data: ${response.statusText}`);
    }
    return await response.json() as LoreData;
  } catch (error) {
    console.error('Error loading lore data:', error);
    return null;
  }
}

/**
 * Render the complete lore page
 */
export async function renderLorePage(): Promise<void> {
  const container = document.getElementById('lore-content');
  if (!container) {
    console.error('Lore content container not found');
    return;
  }

  container.innerHTML = '<p class="loading-message">Loading historical records...</p>';

  const loreData = await loadLoreData();

  if (!loreData) {
    container.innerHTML = `
      <div class="error-message">
        <h3>Unable to Load Historical Records</h3>
        <p>We're having trouble accessing the ECC historical database. Please try again later.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    ${renderECCOverview(loreData)}
    ${renderTimeline(loreData.timeline)}
    ${renderPoliticalContext(loreData.politicalContext)}
  `;
}

/**
 * Render ECC Overview Section
 */
function renderECCOverview(loreData: LoreData): string {
  const { ecc } = loreData;

  return `
    <section class="lore-section ecc-overview" id="ecc-overview">
      <h2 class="lore-section-title">About the East Coast Conglomerate</h2>

      <div class="ecc-header">
        <div class="ecc-seal-large">ECC</div>
        <div class="ecc-title">
          <h3>${ecc.name}</h3>
          <p class="ecc-tagline">"${ecc.tagline}"</p>
          <p class="ecc-established">Established ${ecc.established}</p>
        </div>
      </div>

      <div class="lore-card">
        <h4>Overview</h4>
        <p>${ecc.overview}</p>
      </div>

      <div class="lore-grid">
        <div class="lore-card">
          <h4>Governance Structure</h4>
          <p class="governance-type"><strong>${ecc.governance.structure}</strong></p>
          <p>${ecc.governance.description}</p>
          <h5>Core Principles:</h5>
          <ul class="principles-list">
            ${ecc.governance.principles.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>

        <div class="lore-card">
          <h4>Territory</h4>
          <p><strong>Capital:</strong> ${ecc.territory.capital}</p>
          <p><strong>Population:</strong> ${ecc.territory.population}</p>
          <h5>Administrative Regions:</h5>
          <ul class="territory-list">
            ${ecc.territory.regions.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="lore-card relationships-card">
        <h4>International Relations</h4>
        <div class="relationships-grid">
          <div class="relationship-column">
            <h5 class="relation-allies">Allied States</h5>
            <ul>
              ${ecc.relationships.allies.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div class="relationship-column">
            <h5 class="relation-neutral">Neutral Relations</h5>
            <ul>
              ${ecc.relationships.neutral.map(n => `<li>${n}</li>`).join('')}
            </ul>
          </div>
          <div class="relationship-column">
            <h5 class="relation-contested">Contested Borders</h5>
            <ul>
              ${ecc.relationships.contested.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Render Timeline Section
 */
function renderTimeline(events: TimelineEvent[]): string {
  return `
    <section class="lore-section timeline-section" id="ai-timeline">
      <h2 class="lore-section-title">Timeline: The Path to AI Personhood</h2>
      <p class="timeline-intro">A chronicle of the key events that led to the AI Personhood Act of 2077</p>

      <div class="timeline">
        ${events.map((event, index) => renderTimelineEvent(event, index)).join('')}
      </div>
    </section>
  `;
}

/**
 * Render individual timeline event
 */
function renderTimelineEvent(event: TimelineEvent, index: number): string {
  const position = index % 2 === 0 ? 'left' : 'right';
  const categoryClass = `category-${event.category}`;
  const significanceClass = `significance-${event.significance}`;

  return `
    <div class="timeline-item ${position} ${categoryClass} ${significanceClass}">
      <div class="timeline-marker">
        <span class="timeline-year">${event.year}</span>
      </div>
      <div class="timeline-content">
        <div class="timeline-date">${event.month} ${event.year}</div>
        <h3 class="timeline-title">${event.title}</h3>
        <p class="timeline-description">${event.description}</p>
        <div class="timeline-meta">
          <span class="timeline-category">${event.category}</span>
          <span class="timeline-significance">${event.significance}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Political Context Section
 */
function renderPoliticalContext(context: PoliticalContext): string {
  return `
    <section class="lore-section political-context-section" id="political-context">
      <h2 class="lore-section-title">Political Context: Why This Act Matters</h2>

      <div class="lore-card situation-card">
        <h4>The Current Situation</h4>
        <p>${context.currentSituation}</p>
      </div>

      <div class="lore-card stakes-card">
        <h4>What's at Stake</h4>
        <div class="stakes-grid">
          <div class="stake-item">
            <h5>Ethical Stakes</h5>
            <p>${context.stakes.ethical}</p>
          </div>
          <div class="stake-item">
            <h5>Economic Stakes</h5>
            <p>${context.stakes.economic}</p>
          </div>
          <div class="stake-item">
            <h5>Social Stakes</h5>
            <p>${context.stakes.social}</p>
          </div>
          <div class="stake-item">
            <h5>Political Stakes</h5>
            <p>${context.stakes.political}</p>
          </div>
        </div>
      </div>

      <div class="factions-section">
        <h4>Key Factions and Positions</h4>

        <div class="faction-group supporters">
          <h5 class="faction-group-title">Supporters</h5>
          ${context.factions.supporters.map((f: Faction) => `
            <div class="faction-card">
              <h6>${f.name}</h6>
              <p class="faction-leader">Led by ${f.leader}</p>
              <p class="faction-position">${f.position}</p>
            </div>
          `).join('')}
        </div>

        <div class="faction-group opponents">
          <h5 class="faction-group-title">Opponents</h5>
          ${context.factions.opponents.map((f: Faction) => `
            <div class="faction-card">
              <h6>${f.name}</h6>
              <p class="faction-leader">Led by ${f.leader}</p>
              <p class="faction-position">${f.position}</p>
            </div>
          `).join('')}
        </div>

        <div class="faction-group moderates">
          <h5 class="faction-group-title">Moderates</h5>
          ${context.factions.moderates.map((f: Faction) => `
            <div class="faction-card">
              <h6>${f.name}</h6>
              <p class="faction-leader">Led by ${f.leader}</p>
              <p class="faction-position">${f.position}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="lore-card key-questions-card">
        <h4>Key Questions Facing the Legislative Body</h4>
        <ul class="key-questions-list">
          ${context.keyQuestions.map((q: string) => `<li>${q}</li>`).join('')}
        </ul>
      </div>
    </section>
  `;
}
