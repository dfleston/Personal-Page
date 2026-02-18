import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const token = request.cookies.gitfolio_session;
    const { JWT_SECRET } = process.env;

    if (!token) {
        return response.status(200).json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET || 'fallback_secret') as any;
        return response.status(200).json({
            authenticated: true,
            user: {
                login: decoded.login,
                avatar: decoded.avatar,
                isAdmin: decoded.isAdmin
            }
        });
    } catch (error) {
        return response.status(200).json({ authenticated: false });
    }
}
