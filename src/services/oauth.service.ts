import { google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';

export interface GoogleTokens extends Credentials {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export class OAuthService {
  private static instance: OAuthService;
  private auth: OAuth2Client;

  private constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  public static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  public getOAuth2Client(): OAuth2Client {
    return this.auth;
  }

  public getAuthUrl(): string {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
    }

    return this.auth.generateAuthUrl({
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      prompt: 'consent'
    });
  }

  public async getTokens(code: string): Promise<GoogleTokens> {
    const { tokens } = await this.auth.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    const googleTokens: GoogleTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      scope: tokens.scope || '',
      token_type: tokens.token_type || 'Bearer',
      expiry_date: tokens.expiry_date || Date.now() + 3600000
    };

    return googleTokens;
  }
}
