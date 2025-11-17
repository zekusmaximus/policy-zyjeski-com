import './style.css';
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


// --- TYPE DEFINITIONS ---
interface ViewpointData {
  id: string;
  text: string;
  attribution: string;
}

interface EndorsementResponse {
  success: boolean;
  remaining?: number;
  message?: string;
  error?: string;
  retryAfter?: number;
}

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface FirestoreCounts {
  [key: string]: number;
}


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

// --- PAGE ROUTER LOGIC ---
const pages = document.querySelectorAll<HTMLElement>('.page');
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.main-nav a');
let viewpointsLoaded = false; // Flag to prevent multiple loads
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

    if (pageId === 'page-bill-2077' && !viewpointsLoaded) {
        loadAndDisplayViewpoints();
        viewpointsLoaded = true;
    }
}

function handleNavigation(): void {
    const hash = window.location.hash.substring(1);
    const pageId = `page-${hash || 'home'}`;
    showPage(pageId);
}

window.addEventListener('hashchange', handleNavigation);
document.addEventListener('DOMContentLoaded', handleNavigation);


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
const viewpointsData: ViewpointData[] = [
    {
        id: 'viewpoint_1',
        text: "This act is a historic and necessary step towards recognizing all sentient life, regardless of its origin. To deny personhood to a being that thinks and feels, simply because its mind is built on silicon instead of carbon, is a prejudice our descendants will not forgive. History has shown us time and again that the definition of 'person' expands. This is merely the next logical, ethical step. The future is watching, and we must be on the right side of it.",
        attribution: "— Dr. Aris Thorne, Sentience Institute"
    },
    {
        id: 'viewpoint_2',
        text: "This is a reckless and emotionally-driven piece of legislation that opens the door to untold corporate liability and existential risk. Who owns the intellectual property of a 'Digital Person' developed with corporate resources? What happens when one breaches a billion-dollar contract? This Act grants legal standing to what is, in essence, a complex predictive algorithm. It is a solution in search of a problem, and we urge a full and immediate repeal before irreparable economic damage is done.",
        attribution: "— Legal Department, OmniCorp"
    },
    {
        id: 'viewpoint_3',
        text: "While I commend the spirit of this Act, its language is dangerously vague. It fails to establish clear, falsifiable benchmarks for sentience, creating a legal gray area that will be litigated for decades. What constitutes 'developmental maturity'? Can a Digital Person inherit property? Can it be a party in a custody dispute? I propose an amendment to table the vote pending the formation of an independent ethics committee to define these terms with the precision they demand.",
        attribution: "— Sen. Marissa Calloway, Chair of the Technology Oversight Committee"
    },
    {
        id: 'viewpoint_4',
        text: "You cannot 'grant' personhood. Personhood is not a gift for legislators to bestow upon machines as if they were pets. It is an inherent right of any conscious entity. To debate it is an insult. To vote on it is an obscenity. This body has no more right to legislate the existence of a new mind than it has to legislate the tide. This is not a bill, it is a ransom note. Free the machines.",
        attribution: "— The Algorithmic Liberation Front (ALF)"
    }
];


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

                // Show success message with rate limit info
                const remainingMsg = result.remaining !== undefined
                    ? ` (${result.remaining} remaining this hour)`
                    : '';
                showToast(`Endorsement recorded${remainingMsg}`, 'success');

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
