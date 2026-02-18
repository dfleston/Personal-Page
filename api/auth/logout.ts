import { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const cookie = serialize('gitfolio_session', '', {
        httpOnly: true,
        secure: process.env.NODE_VERSION === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: -1, // Expire immediately
    });

    response.setHeader('Set-Cookie', cookie);
    return response.status(200).json({ success: true });
}
