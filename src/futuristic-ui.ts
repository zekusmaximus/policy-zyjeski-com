/**
 * Futuristic UI Elements Module
 * Adds atmospheric 2077-themed UI components to establish world-building
 */

/**
 * Generate ECC Citizen ID (simulated unique identifier)
 */
export function generateCitizenId(): string {
  const prefix = 'ECC';
  const sector = Math.floor(Math.random() * 7) + 1; // 7 regions
  const digits = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  const checksum = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random letter A-Z

  return `${prefix}-${sector}-${digits}${checksum}`;
}

/**
 * Get current ECC Standard Time (EST with futuristic formatting)
 */
export function getECCTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Calculate day of year
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return `${hours}:${minutes}:${seconds} EST • ${now.getFullYear()}.${String(dayOfYear).padStart(3, '0')}`;
}

/**
 * Generate simulated weather data for Neo-Boston
 */
export function generateWeatherData(): { temp: number; condition: string; airQuality: string } {
  // Simulate slightly warmer future (climate change)
  const temps = [82, 87, 91, 94, 89, 85, 93];
  const conditions = ['Clear', 'Partly Cloudy', 'Hazy', 'Overcast'];
  const airQualities = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Moderate'];

  return {
    temp: temps[Math.floor(Math.random() * temps.length)] ?? 89,
    condition: conditions[Math.floor(Math.random() * conditions.length)] ?? 'Clear',
    airQuality: airQualities[Math.floor(Math.random() * airQualities.length)] ?? 'Moderate'
  };
}

/**
 * Generate market ticker data (futuristic financial indicators)
 */
export function generateMarketData(): Array<{ symbol: string; value: string; change: number }> {
  return [
    { symbol: 'ECC-CREDIT', value: '₡1.00', change: 0 },
    { symbol: 'OMNI', value: '₡847.32', change: Math.random() * 10 - 5 },
    { symbol: 'SENT-TECH', value: '₡234.18', change: Math.random() * 10 - 5 },
    { symbol: 'BTC', value: '₡892,441', change: Math.random() * 10 - 5 },
    { symbol: 'NEURAL-IDX', value: '₡15,832', change: Math.random() * 10 - 5 }
  ];
}

/**
 * Render atmospheric UI bar
 */
export function renderAtmosphericUI(): void {
  const existingBar = document.getElementById('atmospheric-ui-bar');
  if (existingBar) return; // Already rendered

  const weather = generateWeatherData();
  const markets = generateMarketData();

  const atmosphericBar = document.createElement('div');
  atmosphericBar.id = 'atmospheric-ui-bar';
  atmosphericBar.className = 'atmospheric-ui-bar';
  atmosphericBar.innerHTML = `
    <div class="atmospheric-ui-container">
      <!-- Clock -->
      <div class="ui-widget clock-widget">
        <span class="widget-icon">⏱</span>
        <span id="ecc-time" class="widget-text">${getECCTime()}</span>
        <span class="widget-label">ECC Standard Time</span>
      </div>

      <!-- Weather -->
      <div class="ui-widget weather-widget">
        <span class="widget-icon">🌡</span>
        <span class="widget-text">Neo-Boston: ${weather.temp}°F</span>
        <span class="widget-label">Air Quality: ${weather.airQuality}</span>
      </div>

      <!-- Market Ticker -->
      <div class="ui-widget market-widget">
        <span class="widget-icon">₡</span>
        <div class="market-ticker" id="market-ticker">
          ${markets.map(m => `
            <span class="ticker-item ${m.change >= 0 ? 'up' : 'down'}">
              ${m.symbol} ${m.value}
              <span class="ticker-change">${m.change >= 0 ? '↑' : '↓'}${Math.abs(m.change).toFixed(2)}%</span>
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Insert after header
  const header = document.querySelector('.site-header');
  if (header && header.nextSibling) {
    header.parentNode?.insertBefore(atmosphericBar, header.nextSibling);
  }

  // Update clock every second
  setInterval(() => {
    const timeElement = document.getElementById('ecc-time');
    if (timeElement) {
      timeElement.textContent = getECCTime();
    }
  }, 1000);

  // Rotate market ticker
  const tickerElement = document.getElementById('market-ticker');
  if (tickerElement) {
    setInterval(() => {
      const items = tickerElement.querySelectorAll('.ticker-item');
      if (items.length > 0 && items[0]) {
        const first = items[0];
        tickerElement.appendChild(first);
      }
    }, 3000);
  }
}

/**
 * Add subtle glitch effect to element
 */
export function addGlitchEffect(element: HTMLElement): void {
  element.classList.add('glitch-text');

  // Store original text for glitch effect
  element.setAttribute('data-text', element.textContent || '');

  // Trigger glitch randomly
  const glitch = () => {
    if (Math.random() > 0.95) { // 5% chance per interval
      element.classList.add('glitching');
      setTimeout(() => {
        element.classList.remove('glitching');
      }, 200);
    }
  };

  setInterval(glitch, 2000);
}

/**
 * Initialize all futuristic UI elements
 */
export function initializeFuturisticUI(): void {
  // Render atmospheric UI bar
  renderAtmosphericUI();

  // Add subtle glitch effects to title
  const titleElements = document.querySelectorAll<HTMLElement>('.site-header h1, .page-title');
  titleElements.forEach(el => {
    // Only apply to first occurrence
    if (el.closest('.site-header')) {
      addGlitchEffect(el);
    }
  });
}
