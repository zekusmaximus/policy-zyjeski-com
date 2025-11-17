import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  getDocs,
  type Firestore,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { renderLorePage } from './lore';
import { renderNewsSection } from './news';
import { initializeFuturisticUI } from './futuristic-ui';
import { showSocialCardModal } from './social-card';
import type { ViewpointData, EndorsementResponse, ToastType, FirestoreCounts } from './types';


// --- FIREBASE CONFIGURATION ---
// Use environment variables in production, fallback to hardcoded values for development
// Note: These Firebase client-side keys are safe to be public (not secrets)
// Real security comes from Firestore Security Rules and Cloud Functions, not hiding these keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbVlJhifVnJxA360gPXteRskc6qlo2D0Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "policy-zyjeski-com.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "policy-zyjeski-com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "policy-zyjeski-com.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1035563939084",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1035563939084:web:a76c2924e6e09f126a4529",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WRWW11X8J1"
};

// Cloud Function URL for endorsement submission
const CLOUD_FUNCTION_URL = import.meta.env.VITE_CLOUD_FUNCTION_URL ||
  'https://us-central1-policy-zyjeski-com.cloudfunctions.net/submitEndorsement';

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

// Initialize Firebase Analytics
let analytics: Analytics | null = null;
try {
  analytics = getAnalytics(app);
  logEvent(analytics, 'app_initialized');
} catch (error) {
  // Analytics may not be available in development or when blocked
  if (import.meta.env.DEV) {
    console.log('Analytics not initialized:', error);
  }
}

// Register Service Worker for offline support
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    showToast('App ready to work offline', 'success');
  },
});

// --- PAGE ROUTER LOGIC ---
const pages = document.querySelectorAll<HTMLElement>('.page');
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.main-nav a');
let viewpointsLoaded = false; // Flag to prevent multiple loads
let loreLoaded = false; // Flag to prevent multiple lore loads
let newsLoaded = false; // Flag to prevent multiple news loads
let viewpointsUnsubscribe: Unsubscribe | null = null; // Store unsubscribe function to prevent memory leaks

function showPage(pageId: string): void {
    const targetPage = document.getElementById(pageId) || document.getElementById('page-404');
    if (!targetPage) return;

    pages.forEach(page => page.classList.remove('active'));
    targetPage.classList.add('active');

    const currentHash = `#${pageId.replace('page-', '')}`;
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentHash);
    });

    // Track page views in analytics
    if (analytics) {
        logEvent(analytics, 'page_view', {
            page_title: pageId.replace('page-', ''),
            page_location: window.location.href,
            page_path: window.location.pathname + window.location.hash
        });
    }

    // Load page-specific content
    if (pageId === 'page-home' && !newsLoaded) {
        renderNewsSection();
        newsLoaded = true;
    }

    if (pageId === 'page-bill-2077' && !viewpointsLoaded) {
        loadAndDisplayViewpoints();
        viewpointsLoaded = true;
    }

    if (pageId === 'page-lore' && !loreLoaded) {
        renderLorePage();
        loreLoaded = true;
        // Track lore page view in analytics
        if (analytics) {
            logEvent(analytics, 'lore_page_view');
        }
    }
}

function handleNavigation(): void {
    const hash = window.location.hash.substring(1);
    const pageId = `page-${hash || 'home'}`;
    showPage(pageId);
}

window.addEventListener('hashchange', handleNavigation);
document.addEventListener('DOMContentLoaded', () => {
    initializeFuturisticUI(); // Initialize atmospheric UI elements
    handleNavigation();
});


// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message: string, type: ToastType = 'info'): void {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}


// --- BILL 2077: FIRESTORE ENDORSEMENT LOGIC ---

// Store loaded viewpoints for social card generation
let loadedViewpoints: ViewpointData[] = [];

/**
 * Load viewpoints data from JSON file
 */
async function loadViewpointsData(): Promise<ViewpointData[]> {
    try {
        const response = await fetch('/data/viewpoints.json');
        if (!response.ok) {
            throw new Error(`Failed to load viewpoints: ${response.statusText}`);
        }
        const data = await response.json();
        return data.viewpoints as ViewpointData[];
    } catch (error) {
        console.error('Error loading viewpoints data:', error);
        // Return empty array on error - will be handled by caller
        return [];
    }
}

function getEndorsedSessionState(): Set<string> {
    const state = sessionStorage.getItem('endorsedViewpoints');
    return state ? new Set<string>(JSON.parse(state)) : new Set<string>();
}

function setEndorsedSessionState(endorsedSet: Set<string>): void {
    sessionStorage.setItem('endorsedViewpoints', JSON.stringify(Array.from(endorsedSet)));
}

async function loadAndDisplayViewpoints(): Promise<void> {
    const container = document.getElementById('viewpoints-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-message">Loading testimony...</p>';
    const endorsedViewpoints = getEndorsedSessionState();

    try {
        // Load viewpoints data from JSON
        const viewpointsData = await loadViewpointsData();

        // Store for social card generation
        loadedViewpoints = viewpointsData;

        if (viewpointsData.length === 0) {
            throw new Error('No viewpoints data available');
        }

        // Load endorsement counts from Firestore
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "viewpoints"));
        const firestoreCounts: FirestoreCounts = {};
        querySnapshot.forEach(doc => {
            firestoreCounts[doc.id] = (doc.data().endorsements as number) || 0;
        });

        container.innerHTML = ''; // Clear loading message

        viewpointsData.forEach(vp => {
            const count = firestoreCounts[vp.id] !== undefined ? firestoreCounts[vp.id]! : 0;
            container.innerHTML += createViewpointHTML(vp, count, endorsedViewpoints.has(vp.id));
        });

        attachRealtimeListeners();
        attachEndorsementHandler();

    } catch (error) {
        // User-friendly error message
        container.innerHTML = `
            <div class="error-message">
                <h3>Unable to Load Testimony</h3>
                <p>We're having trouble connecting to the legislative database.
                   Please check your internet connection and try refreshing the page.</p>
                <button onclick="window.location.reload()" class="retry-btn">Retry</button>
            </div>`;

        showToast('Failed to load testimony data', 'error');

        // Log detailed error for debugging (only in development)
        if (import.meta.env.DEV) {
            console.error('Error loading viewpoints:', error);
        }
    }
}

function createViewpointHTML(viewpoint: ViewpointData, endorsements: number, isEndorsed: boolean): string {
    return `
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
}

function attachEndorsementHandler(): void {
    const container = document.getElementById('viewpoints-container');
    if (!container) return;

    const VALID_VIEWPOINT_IDS = ['viewpoint_1', 'viewpoint_2', 'viewpoint_3', 'viewpoint_4'];

    container.addEventListener('click', async (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.matches('.endorse-btn')) {
            const button = target as HTMLButtonElement;
            const viewpointId = button.dataset.viewpointId;

            // Validate viewpoint ID
            if (!viewpointId || !VALID_VIEWPOINT_IDS.includes(viewpointId)) {
                showToast('Invalid viewpoint selection', 'error');
                return;
            }

            const endorsedViewpoints = getEndorsedSessionState();
            if (endorsedViewpoints.has(viewpointId)) return;

            // Store original button state for rollback
            const originalText = button.textContent || '';
            const originalDisabled = button.disabled;

            // Optimistic UI update
            button.disabled = true;
            button.textContent = 'Submitting...';

            try {
                // Call Cloud Function with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(CLOUD_FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ viewpointId }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                const result = await response.json() as EndorsementResponse;

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Failed to submit endorsement');
                }

                // Success - update UI and session storage
                button.textContent = 'Endorsed';
                button.classList.add('endorsed');
                endorsedViewpoints.add(viewpointId);
                setEndorsedSessionState(endorsedViewpoints);

                // Track successful endorsement in analytics
                if (analytics) {
                    logEvent(analytics, 'endorsement_submitted', {
                        viewpoint_id: viewpointId,
                        remaining_endorsements: result.remaining || 0
                    });
                }

                // Show success message with rate limit info
                const remainingMsg = result.remaining !== undefined
                    ? ` (${result.remaining} remaining this hour)`
                    : '';
                showToast(`Endorsement recorded${remainingMsg}`, 'success');

                // Show social card modal
                const viewpoint = loadedViewpoints.find(v => v.id === viewpointId);
                if (viewpoint) {
                    setTimeout(() => {
                        showSocialCardModal(viewpoint);
                        // Track social card generation
                        if (analytics) {
                            logEvent(analytics, 'social_card_generated', {
                                viewpoint_id: viewpointId
                            });
                        }
                    }, 500); // Small delay after toast
                }

            } catch (error) {
                // Rollback UI on error
                button.disabled = originalDisabled;
                button.textContent = originalText;

                // User-friendly error messages
                let errorMessage = 'Failed to submit endorsement. Please try again.';

                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        errorMessage = 'Request timed out. Please check your connection.';
                    } else if (error.message.includes('Rate limit')) {
                        errorMessage = error.message;
                    }
                }

                if (!navigator.onLine) {
                    errorMessage = 'You appear to be offline. Please check your connection.';
                }

                showToast(errorMessage, 'error');

                // Track error in analytics
                if (analytics && error instanceof Error) {
                    logEvent(analytics, 'endorsement_error', {
                        error_type: error.name,
                        error_message: error.message,
                        viewpoint_id: viewpointId
                    });
                }

                // Log detailed error for debugging (only in development)
                if (import.meta.env.DEV) {
                    console.error('Endorsement submission failed:', error);
                }
            }
        }
    });
}

function attachRealtimeListeners(): void {
    // Unsubscribe from previous listener if it exists (prevent memory leak)
    if (viewpointsUnsubscribe) {
        viewpointsUnsubscribe();
    }

    // Subscribe to real-time updates and store the unsubscribe function
    viewpointsUnsubscribe = onSnapshot(
        collection(db, "viewpoints"),
        (snapshot) => {
            snapshot.forEach((doc) => {
                const el = document.getElementById(doc.id);
                if (el) {
                    const countEl = el.querySelector('.endorsement-count');
                    if (countEl) {
                        const count = (doc.data().endorsements as number) || 0;
                        countEl.textContent = `${count.toLocaleString()} Endorsements`;
                    }
                }
            });
        },
        (error) => {
            // Handle listener errors gracefully
            if (import.meta.env.DEV) {
                console.error('Error in real-time listener:', error);
            }
            showToast('Lost connection to live updates', 'warning');
        }
    );
}
