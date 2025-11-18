/**
 * Outcome Scenario Explorer
 * Interactive visualization of possible futures based on H.B. 2077's outcome
 */

import type { OutcomeScenario, OutcomesData } from './types';

let scenariosData: OutcomeScenario[] = [];
let selectedScenarios: string[] = [];

/**
 * Load outcomes data
 */
async function loadOutcomesData(): Promise<OutcomeScenario[]> {
  try {
    const response = await fetch('/data/outcomes.json');
    if (!response.ok) {
      throw new Error(`Failed to load outcomes: ${response.statusText}`);
    }
    const data = await response.json() as OutcomesData;
    return data.scenarios;
  } catch (error) {
    console.error('Error loading outcomes data:', error);
    return [];
  }
}

/**
 * Get current endorsement counts to calculate probability
 */
async function getCurrentEndorsementCounts(): Promise<Record<string, number>> {
  try {
    // This would query Firestore for current endorsement counts
    // For now, return mock data
    return {
      viewpoint_1: 1247, // Progressive
      viewpoint_2: 892,  // Moderate
      viewpoint_3: 1089, // Conservative
      viewpoint_4: 234   // Radical
    };
  } catch (error) {
    console.error('Error loading endorsement counts:', error);
    return {};
  }
}

/**
 * Calculate scenario probabilities based on endorsement distribution
 */
async function calculateProbabilities(scenarios: OutcomeScenario[]): Promise<OutcomeScenario[]> {
  const counts = await getCurrentEndorsementCounts();
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    // No endorsements yet, equal probability
    return scenarios.map(s => ({ ...s, probability: 25 }));
  }

  // Calculate based on viewpoint distribution
  const progressive = ((counts.viewpoint_1 || 0) + (counts.viewpoint_4 || 0)) / total;
  const conservative = ((counts.viewpoint_3 || 0) + (counts.viewpoint_2 || 0)) / total;

  return scenarios.map(scenario => {
    let probability = 25; // Default

    switch (scenario.category) {
      case 'pass-progressive':
        probability = progressive > 0.5 ? progressive * 100 * 0.8 : progressive * 100 * 0.3;
        break;
      case 'pass-conservative':
        probability = progressive > 0.45 && progressive < 0.55 ? 30 : 15;
        break;
      case 'fail-status-quo':
        probability = conservative > 0.4 && conservative < 0.6 ? 35 : 20;
        break;
      case 'fail-backlash':
        probability = conservative > 0.6 ? conservative * 100 * 0.6 : conservative * 100 * 0.2;
        break;
    }

    return { ...scenario, probability: Math.round(probability) };
  });
}

/**
 * Create scenario card HTML
 */
function createScenarioCard(scenario: OutcomeScenario, isSelected: boolean = false): string {
  const categoryLabels = {
    'pass-progressive': 'Bill Passes (Progressive)',
    'pass-conservative': 'Bill Passes (Conservative)',
    'fail-status-quo': 'Bill Fails (Status Quo)',
    'fail-backlash': 'Bill Fails (Backlash)'
  };

  const probabilityBar = scenario.probability
    ? `<div class="probability-bar">
         <div class="probability-fill" style="width: ${scenario.probability}%"></div>
         <span class="probability-text">${scenario.probability}% Likely</span>
       </div>`
    : '';

  return `
    <div class="scenario-card ${isSelected ? 'selected' : ''}"
         data-scenario-id="${scenario.id}">
      <div class="scenario-header">
        <h3>${scenario.title}</h3>
        <span class="scenario-category">${categoryLabels[scenario.category]}</span>
      </div>
      ${probabilityBar}
      <p class="scenario-description">${scenario.description}</p>
      <div class="scenario-actions">
        <button class="explore-scenario-btn" data-scenario-id="${scenario.id}">
          Explore This Timeline
        </button>
        <button class="compare-scenario-btn" data-scenario-id="${scenario.id}">
          ${isSelected ? 'Remove from Comparison' : 'Add to Comparison'}
        </button>
      </div>
    </div>
  `;
}

/**
 * Create detailed scenario view
 */
function createScenarioDetailModal(scenario: OutcomeScenario): string {
  return `
    <div class="modal-overlay" id="scenario-modal">
      <div class="modal-content scenario-modal-content">
        <button class="modal-close">&times;</button>
        <div class="scenario-detail">
          <h2>${scenario.title}</h2>
          <p class="scenario-timeline-range">${scenario.timeline.start} - ${scenario.timeline.end}</p>

          <div class="scenario-overview">
            <h3>Overview</h3>
            <p>${scenario.description}</p>
          </div>

          <div class="timeline-section">
            <h3>Timeline of Events</h3>
            <div class="timeline-visualization">
              ${scenario.consequences.map(event => `
                <div class="timeline-event">
                  <div class="timeline-date">
                    <strong>${event.month} ${event.year}</strong>
                  </div>
                  <div class="timeline-content">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="impact-analysis">
            <h3>Impact Analysis</h3>
            <div class="impact-grid">
              <div class="impact-item">
                <h4>💰 Economic Impact</h4>
                <p>${scenario.economicImpact}</p>
              </div>
              <div class="impact-item">
                <h4>👥 Social Impact</h4>
                <p>${scenario.socialImpact}</p>
              </div>
              <div class="impact-item">
                <h4>🏛️ Political Impact</h4>
                <p>${scenario.politicalImpact}</p>
              </div>
            </div>
          </div>

          <div class="character-outcomes-section">
            <h3>What Happens to Key Figures</h3>
            <div class="character-outcomes-list">
              ${scenario.characterOutcomes.map(outcome => `
                <div class="character-outcome">
                  <strong>${outcome.characterId.split('-').map(w =>
                    w.charAt(0).toUpperCase() + w.slice(1)
                  ).join(' ')}</strong>
                  <p>${outcome.outcome}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="flash-forward-section">
            <h3>Headlines from This Future</h3>
            <div class="headlines-list">
              ${scenario.headlines.map(headline => `
                <div class="future-headline">
                  <span class="headline-date">${headline.date}</span>
                  <h4>${headline.headline}</h4>
                  <p>${headline.excerpt}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create comparison view for two scenarios
 */
function createComparisonView(scenario1: OutcomeScenario, scenario2: OutcomeScenario): string {
  return `
    <div class="modal-overlay" id="comparison-modal">
      <div class="modal-content comparison-modal-content">
        <button class="modal-close">&times;</button>
        <h2>Scenario Comparison</h2>

        <div class="comparison-grid">
          <div class="comparison-column">
            <h3>${scenario1.title}</h3>
            <div class="comparison-section">
              <h4>Economic Impact</h4>
              <p>${scenario1.economicImpact}</p>
            </div>
            <div class="comparison-section">
              <h4>Social Impact</h4>
              <p>${scenario1.socialImpact}</p>
            </div>
            <div class="comparison-section">
              <h4>Political Impact</h4>
              <p>${scenario1.politicalImpact}</p>
            </div>
            <div class="comparison-section">
              <h4>Key Events</h4>
              <ul>
                ${scenario1.consequences.slice(0, 4).map(e =>
                  `<li><strong>${e.month} ${e.year}:</strong> ${e.title}</li>`
                ).join('')}
              </ul>
            </div>
          </div>

          <div class="comparison-divider"></div>

          <div class="comparison-column">
            <h3>${scenario2.title}</h3>
            <div class="comparison-section">
              <h4>Economic Impact</h4>
              <p>${scenario2.economicImpact}</p>
            </div>
            <div class="comparison-section">
              <h4>Social Impact</h4>
              <p>${scenario2.socialImpact}</p>
            </div>
            <div class="comparison-section">
              <h4>Political Impact</h4>
              <p>${scenario2.politicalImpact}</p>
            </div>
            <div class="comparison-section">
              <h4>Key Events</h4>
              <ul>
                ${scenario2.consequences.slice(0, 4).map(e =>
                  `<li><strong>${e.month} ${e.year}:</strong> ${e.title}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="comparison-actions">
          <button class="explore-scenario-btn" data-scenario-id="${scenario1.id}">
            Explore ${scenario1.title}
          </button>
          <button class="explore-scenario-btn" data-scenario-id="${scenario2.id}">
            Explore ${scenario2.title}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show scenario detail modal
 */
function showScenarioModal(scenarioId: string): void {
  const scenario = scenariosData.find(s => s.id === scenarioId);
  if (!scenario) return;

  // Remove existing modals
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

  // Create and append modal
  const modalHTML = createScenarioDetailModal(scenario);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Track view
  if (window.analytics) {
    window.analytics.logEvent('scenario_explored', { scenario_id: scenarioId });
  }

  // Attach event listeners
  const modal = document.getElementById('scenario-modal');
  if (modal) {
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}

/**
 * Toggle scenario in comparison
 */
function toggleScenarioComparison(scenarioId: string): void {
  const index = selectedScenarios.indexOf(scenarioId);

  if (index > -1) {
    selectedScenarios.splice(index, 1);
  } else {
    if (selectedScenarios.length >= 2) {
      selectedScenarios.shift(); // Remove oldest
    }
    selectedScenarios.push(scenarioId);
  }

  // Re-render scenarios
  renderScenarios();

  // If two scenarios selected, show comparison
  if (selectedScenarios.length === 2) {
    const scenario1 = scenariosData.find(s => s.id === selectedScenarios[0]);
    const scenario2 = scenariosData.find(s => s.id === selectedScenarios[1]);

    if (scenario1 && scenario2) {
      showComparisonModal(scenario1, scenario2);
    }
  }

  // Track comparison
  if (window.analytics && selectedScenarios.length === 2) {
    window.analytics.logEvent('scenario_compared', {
      scenario_1: selectedScenarios[0],
      scenario_2: selectedScenarios[1]
    });
  }
}

/**
 * Show comparison modal
 */
function showComparisonModal(scenario1: OutcomeScenario, scenario2: OutcomeScenario): void {
  // Remove existing modals
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

  // Create and append modal
  const modalHTML = createComparisonView(scenario1, scenario2);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Attach event listeners
  const modal = document.getElementById('comparison-modal');
  if (modal) {
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Explore scenario buttons
    modal.querySelectorAll('.explore-scenario-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenarioId = (e.target as HTMLElement).dataset.scenarioId;
        if (scenarioId) {
          modal.remove();
          showScenarioModal(scenarioId);
        }
      });
    });
  }
}

/**
 * Render scenarios
 */
function renderScenarios(): void {
  const container = document.getElementById('scenarios-container');
  if (!container) return;

  container.innerHTML = scenariosData.map(scenario =>
    createScenarioCard(scenario, selectedScenarios.includes(scenario.id))
  ).join('');

  // Attach event listeners
  container.querySelectorAll('.explore-scenario-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scenarioId = (e.target as HTMLElement).dataset.scenarioId;
      if (scenarioId) showScenarioModal(scenarioId);
    });
  });

  container.querySelectorAll('.compare-scenario-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scenarioId = (e.target as HTMLElement).dataset.scenarioId;
      if (scenarioId) toggleScenarioComparison(scenarioId);
    });
  });
}

/**
 * Initialize outcomes page
 */
export async function renderOutcomesPage(): Promise<void> {
  const container = document.getElementById('scenarios-container');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">Calculating possible futures...</p>';

  // Load and calculate probabilities
  const scenarios = await loadOutcomesData();
  scenariosData = await calculateProbabilities(scenarios);

  if (scenariosData.length === 0) {
    container.innerHTML = '<p class="error-message">Failed to load scenario data.</p>';
    return;
  }

  // Render scenarios
  renderScenarios();

  // Track page view
  if (window.analytics) {
    window.analytics.logEvent('outcome_probability_viewed');
  }
}
