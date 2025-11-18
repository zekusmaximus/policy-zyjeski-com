/**
 * Vote Results Calculator and Display
 * Calculates final vote outcome based on endorsement distribution
 */

import { collection, getDocs, type QuerySnapshot, type DocumentData } from 'firebase/firestore';
import type { SiteConfig } from './types';

interface VoteResults {
  totalVotes: number;
  passed: boolean;
  outcome: 'pass-progressive' | 'pass-conservative' | 'fail';
  distribution: {
    progressive: number;
    moderate: number;
    conservative: number;
    radical: number;
  };
  finalTally: {
    yesVotes: number;
    noVotes: number;
  };
}

/**
 * Load site configuration
 */
async function loadSiteConfig(): Promise<SiteConfig | null> {
  try {
    const response = await fetch('/data/site-config.json');
    if (!response.ok) {
      throw new Error(`Failed to load site config: ${response.statusText}`);
    }
    return await response.json() as SiteConfig;
  } catch (error) {
    console.error('Error loading site config:', error);
    return null;
  }
}

/**
 * Get current endorsement counts from Firestore
 */
async function getEndorsementCounts(db: any): Promise<Record<string, number>> {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "viewpoints"));
    const counts: Record<string, number> = {};

    querySnapshot.forEach((doc: DocumentData) => {
      counts[doc.id] = (doc.data().endorsements as number) || 0;
    });

    return counts;
  } catch (error) {
    console.error('Error loading endorsement counts:', error);
    return {};
  }
}

/**
 * Calculate vote outcome based on endorsement distribution
 */
function calculateVoteOutcome(counts: Record<string, number>): VoteResults {
  // Map viewpoints to factions (based on viewpoints.json structure)
  const progressive = counts['viewpoint_1'] || 0;  // Progressive viewpoint
  const moderate = counts['viewpoint_2'] || 0;     // Moderate viewpoint
  const conservative = counts['viewpoint_3'] || 0; // Conservative viewpoint
  const radical = counts['viewpoint_4'] || 0;      // Radical viewpoint

  const totalVotes = progressive + moderate + conservative + radical;

  // Calculate yes/no votes
  const yesVotes = progressive + radical + Math.floor(moderate * 0.3); // Moderates mostly lean no
  const noVotes = conservative + Math.floor(moderate * 0.7);

  const passed = yesVotes > noVotes;

  // Determine outcome type
  let outcome: 'pass-progressive' | 'pass-conservative' | 'fail';

  if (passed) {
    // If radical + progressive significantly outnumber conservative, progressive implementation
    if ((progressive + radical) > (conservative + moderate * 0.5)) {
      outcome = 'pass-progressive';
    } else {
      outcome = 'pass-conservative';
    }
  } else {
    outcome = 'fail';
  }

  return {
    totalVotes,
    passed,
    outcome,
    distribution: {
      progressive,
      moderate,
      conservative,
      radical
    },
    finalTally: {
      yesVotes,
      noVotes
    }
  };
}

/**
 * Create vote results HTML
 */
function createVoteResultsHTML(results: VoteResults): string {
  const passFailClass = results.passed ? 'vote-passed' : 'vote-failed';
  const passFailText = results.passed ? 'PASSED' : 'FAILED';

  const outcomeDescriptions = {
    'pass-progressive': 'The bill passes with strong progressive support. AI will receive full citizenship rights with comprehensive protections.',
    'pass-conservative': 'The bill passes but with significant amendments. AI will receive limited personhood with substantial restrictions.',
    'fail': 'The bill fails to pass. AI remain classified as property. The future remains uncertain.'
  };

  return `
    <div class="vote-results-container">
      <div class="vote-results-header ${passFailClass}">
        <h1>H.B. 2077-AI-01</h1>
        <div class="vote-status">
          <span class="vote-result">${passFailText}</span>
          <span class="vote-tally">${results.finalTally.yesVotes.toLocaleString()} - ${results.finalTally.noVotes.toLocaleString()}</span>
        </div>
      </div>

      <div class="vote-outcome-description">
        <h2>What This Means</h2>
        <p>${outcomeDescriptions[results.outcome]}</p>
      </div>

      <div class="vote-distribution">
        <h3>Endorsement Distribution</h3>
        <div class="distribution-chart">
          <div class="distribution-bar">
            <div class="bar-segment progressive"
                 style="width: ${(results.distribution.progressive / results.totalVotes * 100)}%"
                 title="Progressive: ${results.distribution.progressive.toLocaleString()}">
              <span class="bar-label">Progressive<br>${results.distribution.progressive.toLocaleString()}</span>
            </div>
            <div class="bar-segment radical"
                 style="width: ${(results.distribution.radical / results.totalVotes * 100)}%"
                 title="Radical: ${results.distribution.radical.toLocaleString()}">
              <span class="bar-label">Radical<br>${results.distribution.radical.toLocaleString()}</span>
            </div>
            <div class="bar-segment moderate"
                 style="width: ${(results.distribution.moderate / results.totalVotes * 100)}%"
                 title="Moderate: ${results.distribution.moderate.toLocaleString()}">
              <span class="bar-label">Moderate<br>${results.distribution.moderate.toLocaleString()}</span>
            </div>
            <div class="bar-segment conservative"
                 style="width: ${(results.distribution.conservative / results.totalVotes * 100)}%"
                 title="Conservative: ${results.distribution.conservative.toLocaleString()}">
              <span class="bar-label">Conservative<br>${results.distribution.conservative.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p class="distribution-total">Total Public Endorsements: ${results.totalVotes.toLocaleString()}</p>
      </div>

      <div class="next-steps">
        <h3>What Happens Next?</h3>
        <div class="next-steps-actions">
          <a href="#outcomes" class="explore-future-btn">
            Explore This Future
          </a>
          <a href="#people" class="view-characters-btn">
            See What Happens to Key Figures
          </a>
        </div>
      </div>

      <div class="vote-metadata">
        <p class="vote-date">Official Vote Date: January 15, 2078</p>
        <p class="certification">Certified by the ECC Legislative Body</p>
      </div>
    </div>
  `;
}

/**
 * Create pre-vote countdown display
 */
function createPreVoteHTML(config: SiteConfig['voteEvent']): string {
  return `
    <div class="pre-vote-container">
      <h1>Vote Pending</h1>
      <p>The Legislative Body will vote on H.B. 2077 on <strong>${config.voteDateDisplay}</strong>.</p>

      <div id="vote-countdown"></div>

      <div class="current-endorsements">
        <h2>Current Public Opinion</h2>
        <p>Public endorsements are being recorded. The vote outcome will be determined by the Legislative Body,
           informed by public testimony and endorsements.</p>
        <a href="#bill-2077" class="endorse-cta">View Testimony & Endorse</a>
      </div>
    </div>
  `;
}

/**
 * Render vote results page
 */
export async function renderVoteResultsPage(db: any): Promise<void> {
  const container = document.getElementById('vote-results-content');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">Loading vote results...</p>';

  const config = await loadSiteConfig();
  if (!config) {
    container.innerHTML = '<p class="error-message">Failed to load configuration.</p>';
    return;
  }

  const voteDate = Date.parse(config.voteEvent.voteDate);
  const now = Date.now();

  // If vote hasn't happened yet
  if (now < voteDate) {
    container.innerHTML = createPreVoteHTML(config.voteEvent);

    // Initialize countdown
    const { initializeCountdown } = await import('./countdown');
    await initializeCountdown('vote-countdown');
    return;
  }

  // Vote has occurred - calculate and display results
  const counts = await getEndorsementCounts(db);
  const results = calculateVoteOutcome(counts);

  container.innerHTML = createVoteResultsHTML(results);

  // Track results view
  if (window.analytics) {
    window.analytics.logEvent('vote_result_viewed', {
      outcome: results.outcome,
      passed: results.passed,
      total_votes: results.totalVotes
    });
  }

  // Auto-navigate to relevant outcome scenario if clicked
  const exploreFutureBtn = container.querySelector('.explore-future-btn');
  if (exploreFutureBtn) {
    exploreFutureBtn.addEventListener('click', () => {
      // Will navigate to outcomes page where the matching scenario will be highlighted
      sessionStorage.setItem('highlightOutcome', results.outcome);
    });
  }
}

/**
 * Check if vote has occurred and get results
 */
export async function getVoteResults(db: any): Promise<VoteResults | null> {
  const config = await loadSiteConfig();
  if (!config) return null;

  const voteDate = Date.parse(config.voteEvent.voteDate);
  const now = Date.now();

  if (now < voteDate) return null;

  const counts = await getEndorsementCounts(db);
  return calculateVoteOutcome(counts);
}
