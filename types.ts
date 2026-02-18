
export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  topics: string[];
  // Extended properties for AI features
  aiRationale?: string;
  aiRationaleModel?: string;
  aiThumbnailUrl?: string;
  aiThumbnailModel?: string;
  isAiLoading?: boolean;
}

export interface NostrNote {
  id: string;
  content: string;
  created_at: number;
  pubkey: string;
}

export type ArticleCellType = 'markdown' | 'html' | 'jsx' | 'image';

export interface ArticleCell {
  id: string;
  type: ArticleCellType;
  content: string; // Text content, code, or base64 image data
  height?: number; // Optional custom height for the cell renderer (pixels)
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  cells: ArticleCell[]; // Replaces single 'content' and 'type'
  publishedAt: string;
  readTime: string;
  tags: string[];
}

export enum AiActionType {
  ANALYZE_RATIONALE = 'ANALYZE_RATIONALE',
  GENERATE_THUMBNAIL = 'GENERATE_THUMBNAIL',
}
