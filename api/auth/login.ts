import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

    if (!GITHUB_CLIENT_ID) {
        console.error('Environment variables missing. Keys:', Object.keys(process.env).filter(k => k.includes('GITHUB') || k.includes('JWT')));
        return response.status(500).json({
            error: 'GITHUB_CLIENT_ID not configured',
            envKeysFound: Object.keys(process.env).filter(k => k.includes('GITHUB') || k.includes('JWT'))
        });
    }

    // Redirect to GitHub OAuth
    // We use 'repo' scope if we want to read private repos, or just 'user' for login
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user`;

    return response.redirect(githubAuthUrl);
}
