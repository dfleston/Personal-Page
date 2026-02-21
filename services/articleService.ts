import { Article } from '../types.js';
import initialArticles from '../data/articles.json' with { type: 'json' };

const STORAGE_KEY = 'gitfolio_articles';
const API_URL = '/api/articles';

/**
 * Loads articles from API, falls back to LocalStorage, then to static JSON.
 */
export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data)) {
        // Sync to localStorage for offline cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (error) {
    console.warn("Fetch from API failed, falling back to storage", error);
  }

  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored articles", e);
      }
    }
  }

  return initialArticles as Article[];
};

/**
 * Saves article to API.
 */
export const saveArticle = async (article: Article): Promise<Article> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article)
    });

    if (response.ok) {
      const savedArticle = await response.json();
      // Refresh local cache
      const updatedArticles = await fetchArticles();
      return savedArticle;
    }
    throw new Error('API save failed');
  } catch (error) {
    console.error("Save to API failed", error);
    // Optional: implement local fallback saving here if critical
    throw error;
  }
};

/**
 * Utility to reset articles (clears local cache, doesn't affect server).
 */
export const resetArticles = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};