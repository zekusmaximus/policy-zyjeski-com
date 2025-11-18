/**
 * Type definitions for ECC Portal data structures
 */

// ==================== LORE DATA TYPES ====================

export interface ECCData {
  name: string;
  established: number;
  tagline: string;
  overview: string;
  governance: GovernanceData;
  territory: TerritoryData;
  relationships: RelationshipsData;
}

export interface GovernanceData {
  structure: string;
  description: string;
  principles: string[];
}

export interface TerritoryData {
  regions: string[];
  population: string;
  capital: string;
}

export interface RelationshipsData {
  allies: string[];
  neutral: string[];
  contested: string[];
}

export interface TimelineEvent {
  year: number;
  month: string;
  title: string;
  description: string;
  category: 'technological' | 'social' | 'legal' | 'political';
  significance: 'foundational' | 'critical' | 'major' | 'minor';
}

export interface Faction {
  name: string;
  position: string;
  leader: string;
}

export interface PoliticalContext {
  currentSituation: string;
  stakes: {
    ethical: string;
    economic: string;
    social: string;
    political: string;
  };
  factions: {
    supporters: Faction[];
    opponents: Faction[];
    moderates: Faction[];
  };
  keyQuestions: string[];
}

export interface LoreData {
  ecc: ECCData;
  timeline: TimelineEvent[];
  politicalContext: PoliticalContext;
}

// ==================== NEWS DATA TYPES ====================

export interface NewsArticle {
  id: string;
  headline: string;
  byline: string;
  date: string;
  category: 'breaking' | 'opinion' | 'feature' | 'analysis';
  excerpt: string;
  fullText: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface NewsData {
  articles: NewsArticle[];
}

// ==================== SOCIAL CARD TYPES ====================

export interface SocialCardData {
  viewpointId: string;
  viewpointAuthor: string;
  citizenId: string;
  timestamp: string;
}

// ==================== EXISTING TYPES (from main.ts) ====================

export interface ViewpointData {
  id: string;
  text: string;
  attribution: string;
}

export interface EndorsementResponse {
  success: boolean;
  remaining?: number;
  message?: string;
  error?: string;
  retryAfter?: number;
}

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface FirestoreCounts {
  [key: string]: number;
}

// ==================== PHASE 2: SITE CONFIG TYPES ====================

export interface VoteEventConfig {
  enabled: boolean;
  voteDate: string;
  voteDateDisplay: string;
  billNumber: string;
  billTitle: string;
  locked: boolean;
  resultsAnnounced: boolean;
}

export interface FeatureFlags {
  countdown: boolean;
  scenarioExplorer: boolean;
  characterBios: boolean;
  publishedWorks: boolean;
  newsletter: boolean;
  easterEggs: boolean;
}

export interface AnalyticsConfig {
  trackScenarios: boolean;
  trackCharacters: boolean;
  trackNewsletter: boolean;
  trackEasterEggs: boolean;
}

export interface SiteConfig {
  voteEvent: VoteEventConfig;
  features: FeatureFlags;
  analytics: AnalyticsConfig;
}

// ==================== PHASE 2: CHARACTER TYPES ====================

export type CharacterFaction = 'progressive' | 'conservative' | 'corporate' | 'ai' | 'moderate';
export type CharacterPosition = 'support' | 'oppose' | 'conflicted' | 'neutral';

export interface CharacterRelationship {
  characterId: string;
  type: 'ally' | 'opponent' | 'colleague' | 'family' | 'mentor' | 'student';
  description: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  age?: number;
  activationDate?: string;
  type: 'human' | 'ai';
  faction: CharacterFaction;
  position: CharacterPosition;
  bio: string;
  quote: string;
  portraitUrl?: string;
  appearsIn?: string[];
  timelineEvents: string[];
  relationships: CharacterRelationship[];
  classifiedDossier?: {
    unlockHint: string;
    content: string;
  };
}

export interface CharactersData {
  characters: Character[];
}

// ==================== PHASE 2: OUTCOME SCENARIO TYPES ====================

export interface ConsequenceEvent {
  year: number;
  month: string;
  title: string;
  description: string;
}

export interface FlashForwardHeadline {
  date: string;
  headline: string;
  excerpt: string;
}

export interface CharacterOutcome {
  characterId: string;
  outcome: string;
}

export interface OutcomeScenario {
  id: string;
  title: string;
  category: 'pass-progressive' | 'pass-conservative' | 'fail-status-quo' | 'fail-backlash';
  description: string;
  probability?: number;
  timeline: {
    start: number;
    end: number;
  };
  consequences: ConsequenceEvent[];
  economicImpact: string;
  socialImpact: string;
  politicalImpact: string;
  characterOutcomes: CharacterOutcome[];
  headlines: FlashForwardHeadline[];
}

export interface OutcomesData {
  scenarios: OutcomeScenario[];
}

// ==================== PHASE 2: PUBLISHED WORKS TYPES ====================

export interface Book {
  id: string;
  title: string;
  series?: string;
  publishDate?: string;
  status: 'published' | 'upcoming' | 'planned';
  description: string;
  purchaseUrl?: string;
  coverUrl?: string;
}

export interface BooksData {
  books: Book[];
}

export interface CrossReference {
  id: string;
  type: 'character' | 'location' | 'event' | 'organization';
  name: string;
  inPortal: string;
  inBook: string;
  bookId: string;
  description: string;
  hint?: string;
}

export interface CrossReferencesData {
  references: CrossReference[];
}

// ==================== PHASE 2: NEWSLETTER TYPES ====================

export interface NewsletterSubscription {
  email: string;
  timestamp: string;
  source: string;
  confirmed: boolean;
}
