/**
 * Newsletter Signup Component
 * Disguised as ECC Legislative Updates, actually author newsletter
 */

import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface NewsletterFormData {
  email: string;
  source: string;
}

/**
 * Validate email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email already subscribed
 */
async function isEmailSubscribed(db: any, email: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'newsletter_subscriptions'),
      where('email', '==', email.toLowerCase())
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Submit newsletter subscription
 */
async function submitSubscription(db: any, data: NewsletterFormData): Promise<boolean> {
  try {
    // Check if already subscribed
    const alreadySubscribed = await isEmailSubscribed(db, data.email);
    if (alreadySubscribed) {
      throw new Error('This email is already subscribed.');
    }

    // Add to Firestore
    await addDoc(collection(db, 'newsletter_subscriptions'), {
      email: data.email.toLowerCase(),
      source: data.source,
      timestamp: new Date().toISOString(),
      confirmed: false // Would be true after email confirmation in production
    });

    return true;
  } catch (error) {
    console.error('Error submitting subscription:', error);
    throw error;
  }
}

/**
 * Create newsletter modal HTML
 */
export function createNewsletterModal(_source: string = 'general'): string {
  return `
    <div class="modal-overlay" id="newsletter-modal">
      <div class="modal-content newsletter-modal-content">
        <button class="modal-close">&times;</button>

        <div class="newsletter-form-container">
          <div class="newsletter-header">
            <h2>📬 ECC Legislative Alert System</h2>
            <p class="newsletter-tagline">Stay informed on future legislation and ECC developments</p>
          </div>

          <form id="newsletter-form" class="newsletter-form">
            <div class="form-field">
              <label for="newsletter-email">Email Address</label>
              <input
                type="email"
                id="newsletter-email"
                name="email"
                required
                placeholder="citizen@ecc.gov"
                autocomplete="email"
              />
            </div>

            <button type="submit" class="newsletter-submit-btn">
              Subscribe to Updates
            </button>

            <p class="newsletter-disclaimer">
              You'll receive notifications about new legislation on this portal and updates from the author.
              <a href="#privacy" class="privacy-link">Privacy Policy</a>
            </p>
          </form>

          <div id="newsletter-success" class="newsletter-success" style="display: none;">
            <div class="success-icon">✓</div>
            <h3>Subscription Confirmed!</h3>
            <p>You'll receive updates on ECC legislation and new releases from the author.</p>
          </div>

          <div id="newsletter-error" class="newsletter-error" style="display: none;">
            <div class="error-icon">✗</div>
            <p id="newsletter-error-message"></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show newsletter modal
 */
export function showNewsletterModal(db: any, source: string = 'general'): void {
  // Remove existing modal
  const existingModal = document.getElementById('newsletter-modal');
  if (existingModal) existingModal.remove();

  // Create and append modal
  const modalHTML = createNewsletterModal(source);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Track modal view
  if (window.analytics) {
    window.analytics.logEvent('newsletter_form_viewed', { source });
  }

  const modal = document.getElementById('newsletter-modal');
  if (!modal) return;

  // Close button
  modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Form submission
  const form = document.getElementById('newsletter-form') as HTMLFormElement;
  const successDiv = document.getElementById('newsletter-success');
  const errorDiv = document.getElementById('newsletter-error');
  const errorMessage = document.getElementById('newsletter-error-message');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('newsletter-email') as HTMLInputElement;
      const email = emailInput.value.trim();

      // Hide previous messages
      if (successDiv) successDiv.style.display = 'none';
      if (errorDiv) errorDiv.style.display = 'none';

      // Validate email
      if (!isValidEmail(email)) {
        if (errorDiv && errorMessage) {
          errorMessage.textContent = 'Please enter a valid email address.';
          errorDiv.style.display = 'block';
        }
        return;
      }

      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';

      try {
        await submitSubscription(db, { email, source });

        // Show success
        form.style.display = 'none';
        if (successDiv) successDiv.style.display = 'block';

        // Track subscription
        if (window.analytics) {
          window.analytics.logEvent('newsletter_subscribed', { source });
        }

        // Close modal after delay
        setTimeout(() => modal.remove(), 3000);

      } catch (error) {
        // Show error
        if (errorDiv && errorMessage) {
          errorMessage.textContent = error instanceof Error
            ? error.message
            : 'Failed to subscribe. Please try again.';
          errorDiv.style.display = 'block';
        }

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
}

/**
 * Create inline newsletter signup widget
 */
export function createNewsletterWidget(containerId: string, db: any, source: string = 'widget'): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="newsletter-widget">
      <h3>📬 Stay Updated on Future Legislation</h3>
      <p>Subscribe to receive notifications when new bills are proposed in the ECC Legislative Portal.</p>
      <button class="newsletter-cta-btn" id="newsletter-widget-btn">
        Subscribe to Legislative Updates
      </button>
    </div>
  `;

  const btn = document.getElementById('newsletter-widget-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      showNewsletterModal(db, source);
    });
  }
}

/**
 * Initialize post-endorsement newsletter prompt
 */
export function initPostEndorsementNewsletter(db: any): void {
  // Listen for successful endorsements
  document.addEventListener('endorsementSuccess', () => {
    // Show modal after short delay
    setTimeout(() => {
      showNewsletterModal(db, 'post-endorsement');
    }, 2000);
  });
}

/**
 * Initialize post-vote newsletter prompt
 */
export function showPostVoteNewsletter(db: any): void {
  showNewsletterModal(db, 'post-vote');
}
