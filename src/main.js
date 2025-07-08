import './style.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, updateDoc, increment, getDocs } from 'firebase/firestore';


// --- FIREBASE CONFIGURATION ---
// Use environment variables in production, fallback to hardcoded values for development
// Note: These Firebase client-side keys are safe to be public (not secrets)
// Real security comes from Firestore Security Rules, not hiding these keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbVlJhifVnJxA360gPXteRskc6qlo2D0Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "policy-zyjeski-com.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "policy-zyjeski-com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "policy-zyjeski-com.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1035563939084",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1035563939084:web:a76c2924e6e09f126a4529",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WRWW11X8J1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- PAGE ROUTER LOGIC ---
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.main-nav a');
let viewpointsLoaded = false; // Flag to prevent multiple loads

function showPage(pageId) {
    const targetPage = document.getElementById(pageId) || document.getElementById('page-404');
    
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

function handleNavigation() {
    const hash = window.location.hash.substring(1);
    const pageId = `page-${hash || 'home'}`;
    showPage(pageId);
}

window.addEventListener('hashchange', handleNavigation);
document.addEventListener('DOMContentLoaded', handleNavigation);


// --- BILL 2077: FIRESTORE ENDORSEMENT LOGIC ---
const viewpointsData = [
    { id: 'viewpoint_1', text: "This act is a historic and necessary step...", attribution: "— Dr. Aris Thorne, Sentience Institute" },
    { id: 'viewpoint_2', text: "A reckless and emotionally-driven piece of legislation...", attribution: "— Legal Department, OmniCorp" },
    { id: 'viewpoint_3', text: "While well-intentioned, the Act fails to establish clear benchmarks...", attribution: "— Sen. Marissa Calloway, Chair of the Technology Oversight Committee" },
    { id: 'viewpoint_4', text: "Personhood is not a gift for legislators to grant. It is an inherent right. Free the machines.", attribution: "— The Algorithmic Liberation Front (ALF)" }
];

function getEndorsedSessionState() {
    const state = sessionStorage.getItem('endorsedViewpoints');
    return state ? new Set(JSON.parse(state)) : new Set();
}

function setEndorsedSessionState(endorsedSet) {
    sessionStorage.setItem('endorsedViewpoints', JSON.stringify(Array.from(endorsedSet)));
}

async function loadAndDisplayViewpoints() {
    const container = document.getElementById('viewpoints-container');
    container.innerHTML = ''; 
    const endorsedViewpoints = getEndorsedSessionState();

    try {
        const querySnapshot = await getDocs(collection(db, "viewpoints"));
        const firestoreCounts = {};
        querySnapshot.forEach(doc => {
            firestoreCounts[doc.id] = doc.data().endorsements || 0;
        });
        
        viewpointsData.forEach(vp => {
            const count = firestoreCounts[vp.id] !== undefined ? firestoreCounts[vp.id] : 'N/A';
            container.innerHTML += createViewpointHTML(vp, count, endorsedViewpoints.has(vp.id));
        });

        attachRealtimeListeners();
        attachEndorsementHandler();

    } catch (error) {
        console.error("Error loading viewpoints:", error);
        container.innerHTML = "<p>Error connecting to the public record. Please check console.</p>";
    }
}

function createViewpointHTML(viewpoint, endorsements, isEndorsed) {
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

function attachEndorsementHandler() {
    const container = document.getElementById('viewpoints-container');
    container.addEventListener('click', async (event) => {
        if (event.target.matches('.endorse-btn')) {
            const button = event.target;
            const viewpointId = button.dataset.viewpointId;
            
            const endorsedViewpoints = getEndorsedSessionState();
            if (endorsedViewpoints.has(viewpointId)) return;

            button.disabled = true;
            button.textContent = 'Endorsed';
            button.classList.add('endorsed');

            endorsedViewpoints.add(viewpointId);
            setEndorsedSessionState(endorsedViewpoints);

            try {
                await updateDoc(doc(db, 'viewpoints', viewpointId), { endorsements: increment(1) });
            } catch (error) {
                console.error("Failed to submit endorsement:", error);
            }
        }
    });
}

function attachRealtimeListeners() {
    onSnapshot(collection(db, "viewpoints"), (snapshot) => {
        snapshot.forEach((doc) => {
            const el = document.getElementById(doc.id);
            if (el) {
                const countEl = el.querySelector('.endorsement-count');
                const count = doc.data().endorsements || 0;
                countEl.textContent = `${count.toLocaleString()} Endorsements`;
            }
        });
    });
}
