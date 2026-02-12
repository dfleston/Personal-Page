import { GithubUser, GithubRepo } from '../types';

const BASE_URL = 'https://api.github.com';

export const extractUsername = (input: string): string => {
  const clean = input.trim();
  // Regex to capture username from github.com/username
  const urlMatch = clean.match(/github\.com\/([^\/]+)/);
  if (urlMatch) return urlMatch[1];
  
  // Handle case where user might paste a full url without https or just the username
  // If it looks like a URL but didn't match github, try to parse path
  try {
    if (clean.includes('/')) {
        const parts = clean.split('/').filter(Boolean);
        // last part if no github domain, or assume it is the username
        return parts[parts.length - 1];
    }
  } catch (e) {
      // ignore
  }
  
  return clean;
};

export const fetchGithubUser = async (username: string): Promise<GithubUser> => {
  const cleanUsername = extractUsername(username);
  const response = await fetch(`${BASE_URL}/users/${cleanUsername}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error(`User "${cleanUsername}" not found`);
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export const fetchGithubRepos = async (username: string): Promise<GithubRepo[]> => {
  const cleanUsername = extractUsername(username);
  // Fetch up to 100 repos sorted by updated time
  const response = await fetch(`${BASE_URL}/users/${cleanUsername}/repos?sort=updated&per_page=100`);
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  const data = await response.json();
  // Filter out forks to focus on original work, unless the user has very few repos
  const nonForks = data.filter((repo: GithubRepo) => !repo.fork);
  return nonForks.length > 0 ? nonForks : data;
};