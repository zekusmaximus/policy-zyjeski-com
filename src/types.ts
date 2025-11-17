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
