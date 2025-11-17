/**
 * News Articles Module
 * Handles loading and displaying news articles about the AI Personhood Act
 * Includes modal functionality for full article view
 */

import type { NewsData, NewsArticle } from './types';
import { logEvent, getAnalytics, type Analytics } from 'firebase/analytics';

let currentNews: NewsArticle[] = [];
let analytics: Analytics | null = null;

// Initialize analytics if available (passed from main.ts)
try {
  analytics = getAnalytics();
} catch (error) {
  // Analytics not available
}

/**
 * Load news data from JSON file
 */
export async function loadNewsData(): Promise<NewsData | null> {
  try {
    const response = await fetch('/data/news.json');
    if (!response.ok) {
      throw new Error(`Failed to load news data: ${response.statusText}`);
    }
    return await response.json() as NewsData;
  } catch (error) {
    console.error('Error loading news data:', error);
    return null;
  }
}

/**
 * Render news articles section (for homepage or dedicated page)
 */
export async function renderNewsSection(): Promise<void> {
  const container = document.getElementById('news-content');
  if (!container) {
    console.error('News content container not found');
    return;
  }

  container.innerHTML = '<p class="loading-message">Loading latest news...</p>';

  const newsData = await loadNewsData();

  if (!newsData || newsData.articles.length === 0) {
    container.innerHTML = `
      <div class="error-message">
        <h3>Unable to Load News Articles</h3>
        <p>We're having trouble accessing the news database. Please try again later.</p>
      </div>`;
    return;
  }

  currentNews = newsData.articles;

  container.innerHTML = `
    <div class="news-grid">
      ${newsData.articles.map(article => renderArticleCard(article)).join('')}
    </div>
  `;

  // Attach click handlers for article cards
  attachArticleClickHandlers();
}

/**
 * Render an individual article card
 */
function renderArticleCard(article: NewsArticle): string {
  const categoryClass = `category-${article.category}`;
  const categoryLabel = article.category.charAt(0).toUpperCase() + article.category.slice(1);

  return `
    <article class="news-card ${categoryClass}" data-article-id="${article.id}">
      <div class="news-card-header">
        <span class="news-category">${categoryLabel}</span>
        <time class="news-date">${article.date}</time>
      </div>
      <h3 class="news-headline">${article.headline}</h3>
      <p class="news-byline">${article.byline}</p>
      <p class="news-excerpt">${article.excerpt}</p>
      <button class="read-more-btn" data-article-id="${article.id}">
        Read Full Article →
      </button>
    </article>
  `;
}

/**
 * Attach click handlers to article cards and read more buttons
 */
function attachArticleClickHandlers(): void {
  const readMoreButtons = document.querySelectorAll<HTMLButtonElement>('.read-more-btn');

  readMoreButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const articleId = button.dataset.articleId;
      if (articleId) {
        openArticleModal(articleId);
      }
    });
  });
}

/**
 * Open modal with full article content
 */
function openArticleModal(articleId: string): void {
  const article = currentNews.find(a => a.id === articleId);
  if (!article) {
    console.error(`Article not found: ${articleId}`);
    return;
  }

  // Track article view in analytics
  if (analytics) {
    logEvent(analytics, 'news_article_opened', {
      article_id: articleId,
      article_headline: article.headline,
      article_category: article.category
    });
  }

  // Create modal if it doesn't exist
  let modal = document.getElementById('article-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'article-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  const categoryClass = `category-${article.category}`;
  const categoryLabel = article.category.charAt(0).toUpperCase() + article.category.slice(1);

  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content article-modal-content">
      <button class="modal-close" aria-label="Close article">&times;</button>
      <article class="full-article ${categoryClass}">
        <header class="article-header">
          <div class="article-meta">
            <span class="news-category">${categoryLabel}</span>
            <time class="news-date">${article.date}</time>
          </div>
          <h1 class="article-headline">${article.headline}</h1>
          <p class="article-byline">${article.byline}</p>
        </header>
        <div class="article-body">
          ${article.fullText}
        </div>
        <footer class="article-footer">
          <p class="article-disclaimer">This is a fictional news article created for narrative purposes as part of the ECC Legislative Portal world-building project.</p>
        </footer>
      </article>
    </div>
  `;

  // Show modal with animation
  setTimeout(() => {
    modal!.classList.add('active');
  }, 10);

  // Attach close handlers
  attachModalCloseHandlers(modal);

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

/**
 * Attach handlers to close the modal
 */
function attachModalCloseHandlers(modal: HTMLElement): void {
  const closeButton = modal.querySelector<HTMLButtonElement>('.modal-close');
  const overlay = modal.querySelector<HTMLElement>('.modal-overlay');

  const closeModal = () => {
    modal.classList.remove('active');
    // Allow body scroll again
    document.body.style.overflow = '';

    // Remove modal after animation completes
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  closeButton?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  // Close on Escape key
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}
