import { kv } from '@vercel/kv';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const STORAGE_KEY = 'gitfolio_articles';

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
            const articles = await kv.get(STORAGE_KEY);
            return response.status(200).json(articles || []);
        }

        if (request.method === 'POST') {
            const decoded = await verifyAuth(request);
            if (!decoded || !decoded.isAdmin) {
                return response.status(401).json({ error: 'Unauthorized: Admin login required' });
            }

            const article = request.body;

            // Get current list
            let articles: any[] = (await kv.get(STORAGE_KEY)) || [];

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
                await kv.set(STORAGE_KEY, articles);
                return response.status(201).json(newArticle);
            } else {
                // Update existing
                const index = articles.findIndex((a: any) => a.id === article.id);
                if (index !== -1) {
                    articles[index] = article;
                    await kv.set(STORAGE_KEY, articles);
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
