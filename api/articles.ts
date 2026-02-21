import { Redis } from 'ioredis';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const STORAGE_KEY = 'gitfolio_articles';

// Initialize Redis client
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.warn('REDIS_URL is not defined in environment variables');
}
const redis = new Redis(redisUrl || 'redis://localhost:6379', {
    connectTimeout: 2000,      // fail fast
    maxRetriesPerRequest: 0,   // don't retry on error
    retryStrategy: () => null, // don't reconnect
    lazyConnect: true
});

redis.on('error', () => { /* suppress logs after first failure */ });

async function verifyAuth(request: VercelRequest) {
    const token = request.cookies.gitfolio_session;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    } catch (e) {
        return null;
    }
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    try {
        if (request.method === 'GET') {
            try {
                const data = await redis.get(STORAGE_KEY);
                const articles = data ? JSON.parse(data) : [];
                return response.status(200).json(articles);
            } catch (redisErr) {
                console.error('Error fetching articles from Redis:', redisErr);
                return response.status(200).json([]); // Return empty list rather than hanging/crashing
            }
        }

        if (request.method === 'POST') {
            const decoded = await verifyAuth(request);
            if (!decoded || !decoded.isAdmin) {
                return response.status(401).json({ error: 'Unauthorized: Admin login required' });
            }

            const article = request.body;

            // Get current list
            const data = await redis.get(STORAGE_KEY);
            let articles: any[] = data ? JSON.parse(data) : [];

            if (!article.id) {
                // Create new
                const newArticle = {
                    ...article,
                    id: Date.now().toString(),
                    publishedAt: new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }),
                };
                articles.unshift(newArticle);
                await redis.set(STORAGE_KEY, JSON.stringify(articles));
                return response.status(201).json(newArticle);
            } else {
                // Update existing
                const index = articles.findIndex((a: any) => a.id === article.id);
                if (index !== -1) {
                    articles[index] = article;
                    await redis.set(STORAGE_KEY, JSON.stringify(articles));
                    return response.status(200).json(article);
                }
                return response.status(404).json({ error: 'Article not found' });
            }
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

