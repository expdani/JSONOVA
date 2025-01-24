import { Request, Response } from 'express';
import { GoogleTokens } from './google-calendar.service';

export class TokenService {
  private static instance: TokenService;
  private readonly COOKIE_NAME = 'google_calendar_tokens';
  private readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: true as const
  };

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  setTokens(tokens: GoogleTokens, res: Response) {
    console.log('Setting tokens:', tokens);
    res.cookie(this.COOKIE_NAME, JSON.stringify(tokens), this.COOKIE_OPTIONS);
  }

  getTokens(req: Request): GoogleTokens | null {
    const tokenStr = req.cookies[this.COOKIE_NAME];
    console.log('Raw cookie value:', tokenStr);
    if (!tokenStr) return null;
    
    try {
      const tokens = JSON.parse(tokenStr) as GoogleTokens;
      console.log('Parsed tokens:', tokens);
      
      if (!tokens.access_token) {
        console.error('Invalid token format: missing access_token');
        return null;
      }
      
      return tokens;
    } catch (e) {
      console.error('Error parsing tokens:', e);
      return null;
    }
  }

  clearTokens(res: Response) {
    res.clearCookie(this.COOKIE_NAME);
  }

  isAuthenticated(req: Request): boolean {
    const hasTokens = !!this.getTokens(req);
    console.log('isAuthenticated:', hasTokens);
    return hasTokens;
  }
}
