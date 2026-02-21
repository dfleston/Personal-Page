import { GithubUser, GithubRepo } from '../types.js';

const BASE_URL = 'https://api.github.com';
const CACHE_KEY_PREFIX = 'gitfolio_cache_';
const CACHE_TTL = 3600000; // 1 hour in ms

export const extractUsername = (input: string): string => {
  const clean = input.trim();
  const urlMatch = clean.match(/github\.com\/([^\/]+)/);
  if (urlMatch) return urlMatch[1];

  try {
    if (clean.includes('/')) {
      const parts = clean.split('/').filter(Boolean);
      return parts[parts.length - 1];
    }
  } catch (e) {
    // ignore
  }

  return clean;
};

const getCachedData = (key: string) => {
  const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

export const fetchGithubUser = async (username: string): Promise<GithubUser> => {
  const cleanUsername = extractUsername(username);

  const cached = getCachedData(`user_${cleanUsername}`);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}/users/${cleanUsername}`, {
      signal: controller.signal
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error(`User "${cleanUsername}" not found`);
      throw new Error('Failed to fetch user');
    }
    const data = await response.json();
    setCachedData(`user_${cleanUsername}`, data);
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchGithubRepos = async (username: string): Promise<GithubRepo[]> => {
  const cleanUsername = extractUsername(username);

  const cached = getCachedData(`repos_${cleanUsername}`);
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}/users/${cleanUsername}/repos?sort=updated&per_page=100`, {
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    const data = await response.json();
    const nonForks = data.filter((repo: GithubRepo) => !repo.fork);
    const result = nonForks.length > 0 ? nonForks : data;

    setCachedData(`repos_${cleanUsername}`, result);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const clearGithubCache = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};