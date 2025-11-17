/**
 * Countdown Timer Component for Vote Event
 * Displays real-time countdown to the scheduled vote
 */

import type { SiteConfig } from './types';

let countdownInterval: number | null = null;
let voteConfig: SiteConfig['voteEvent'] | null = null;

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
 * Calculate time remaining until vote
 */
function calculateTimeRemaining(voteDate: string): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = Date.parse(voteDate) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

/**
 * Format time unit with leading zero
 */
function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Update countdown display
 */
function updateCountdownDisplay(containerId: string): void {
  if (!voteConfig) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const timeRemaining = calculateTimeRemaining(voteConfig.voteDate);

  // If vote has passed
  if (timeRemaining.total <= 0) {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    if (voteConfig.resultsAnnounced) {
      container.innerHTML = `
        <div class="countdown-expired">
          <p class="vote-status">Vote Complete</p>
          <a href="#vote-results" class="view-results-btn">View Results</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="countdown-expired">
          <p class="vote-status">Vote in Progress</p>
          <p class="vote-message">Results will be announced shortly...</p>
        </div>
      `;
    }
    return;
  }

  // Update countdown display
  container.innerHTML = `
    <div class="countdown-active">
      <p class="vote-label">Vote Scheduled</p>
      <p class="vote-date">${voteConfig.voteDateDisplay}</p>
      <div class="countdown-timer">
        <div class="time-unit">
          <span class="time-value">${formatTimeUnit(timeRemaining.days)}</span>
          <span class="time-label">Days</span>
        </div>
        <div class="time-separator">:</div>
        <div class="time-unit">
          <span class="time-value">${formatTimeUnit(timeRemaining.hours)}</span>
          <span class="time-label">Hours</span>
        </div>
        <div class="time-separator">:</div>
        <div class="time-unit">
          <span class="time-value">${formatTimeUnit(timeRemaining.minutes)}</span>
          <span class="time-label">Minutes</span>
        </div>
        <div class="time-separator">:</div>
        <div class="time-unit">
          <span class="time-value">${formatTimeUnit(timeRemaining.seconds)}</span>
          <span class="time-label">Seconds</span>
        </div>
      </div>
      <p class="countdown-bill">${voteConfig.billNumber}: ${voteConfig.billTitle}</p>
    </div>
  `;

  // Add pulsing animation class when less than 24 hours remain
  if (timeRemaining.days === 0) {
    container.classList.add('countdown-urgent');
  }
}

/**
 * Initialize countdown timer
 */
export async function initializeCountdown(containerId: string): Promise<void> {
  const config = await loadSiteConfig();
  if (!config || !config.voteEvent.enabled || !config.features.countdown) {
    return;
  }

  voteConfig = config.voteEvent;

  // Initial update
  updateCountdownDisplay(containerId);

  // Update every second
  countdownInterval = window.setInterval(() => {
    updateCountdownDisplay(containerId);
  }, 1000);
}

/**
 * Stop countdown timer (cleanup)
 */
export function stopCountdown(): void {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

/**
 * Check if vote has occurred and should be locked
 */
export async function checkVoteLockStatus(): Promise<boolean> {
  const config = await loadSiteConfig();
  if (!config) return false;

  const voteDate = Date.parse(config.voteEvent.voteDate);
  const now = Date.now();

  // Vote should be locked if the date has passed
  return now >= voteDate;
}

/**
 * Get vote configuration
 */
export async function getVoteConfig(): Promise<SiteConfig['voteEvent'] | null> {
  const config = await loadSiteConfig();
  return config ? config.voteEvent : null;
}
