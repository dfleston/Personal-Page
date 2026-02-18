import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { code } = request.query;
    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, GITHUB_USERNAME } = process.env;

    if (!code) return response.status(400).json({ error: 'No code provided' });

    try {
        // 1. Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return response.status(401).json({ error: 'Failed to get access token' });
        }

        // 2. Get user info from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();

        // 3. Verify user matches the admin username
        if (userData.login.toLowerCase() !== GITHUB_USERNAME?.toLowerCase()) {
            return response.status(403).json({ error: 'Unauthorized: You are not the owner of this portfolio.' });
        }

        // 4. Create JWT session
        const sessionToken = jwt.sign(
            {
                id: userData.id,
                login: userData.login,
                avatar: userData.avatar_url,
                isAdmin: true
            },
            JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        // 5. Set session cookie
        const cookie = serialize('gitfolio_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_VERSION === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        response.setHeader('Set-Cookie', cookie);

        // Redirect back to home
        return response.redirect('/');
    } catch (error) {
        console.error('Auth Callback Error:', error);
        return response.status(500).json({ error: 'Authentication failed' });
    }
}
