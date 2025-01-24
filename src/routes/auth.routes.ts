import { Router, Request, Response } from 'express';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { TokenService } from '../services/token.service';
import { OAuthService } from '../services/oauth.service';

const router = Router();
const calendarService = GoogleCalendarService.getInstance();
const tokenService = TokenService.getInstance();
const oauthService = OAuthService.getInstance();

interface AuthCallbackQuery {
  code?: string;
  error?: string;
}

router.get('/auth/google', (_req: Request, res: Response) => {
  const authUrl = oauthService.getAuthUrl();
  res.redirect(authUrl);
});

router.get('/auth/google/callback', async (req: Request<{}, {}, {}, AuthCallbackQuery>, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('No authorization code provided');
    }

    // Get tokens from Google OAuth
    const tokens = await oauthService.getTokens(code);
    console.log('Received tokens from Google:', tokens);

    // Set credentials for calendar service
    calendarService.setCredentials(tokens);

    // Store tokens in cookie
    tokenService.setTokens(tokens, res);

    res.send('Authentication successful! You can close this window.');
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
});

// Add an endpoint to check authentication status
router.get('/auth/status', (req: Request, res: Response) => {
  const tokens = tokenService.getTokens(req);
  res.json({ 
    authenticated: !!tokens,
    tokens: tokens ? {
      // Only send non-sensitive parts of the token
      scope: tokens.scope,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type
    } : null
  });
});

// Add logout endpoint
router.post('/auth/logout', (_req: Request, res: Response) => {
  tokenService.clearTokens(res);
  res.json({ success: true });
});

export default router;
