import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

    if (!GITHUB_CLIENT_ID) {
        console.error('Environment variables missing. GITHUB_CLIENT_ID not found.');
        return response.status(500).json({
            error: 'GITHUB_CLIENT_ID not configured'
        });
    }

    // Determine the host to construct the redirect_uri dynamically
    // This allows the same code to work on localhost and Vercel (production/preview)
    const host = request.headers.host;
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/callback`;

    // Redirect to GitHub OAuth
    // We pass the explicit redirect_uri to ensure GitHub returns to the correct domain
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return response.redirect(githubAuthUrl);
}
