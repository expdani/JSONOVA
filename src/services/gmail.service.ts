import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Request } from 'express';
import { TokenService } from './token.service';
import { OAuthService } from './oauth.service';

export class GmailService {
  private static instance: GmailService;
  private tokenService: TokenService;
  private oauthService: OAuthService;

  private constructor() {
    this.tokenService = TokenService.getInstance();
    this.oauthService = OAuthService.getInstance();
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  private async getAuthClient(req: Request): Promise<OAuth2Client> {
    const tokens = this.tokenService.getTokens(req);
    if (!tokens) {
      throw new Error('No authentication tokens found');
    }
    
    const oauth2Client = this.oauthService.getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }

  public async listEmails(req: Request, query: {
    maxResults?: number;
    q?: string;
    labelIds?: string[];
  } = {}): Promise<any> {
    try {
      const auth = await this.getAuthClient(req);
      const gmail = google.gmail({ version: 'v1', auth });

      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: query.maxResults || 10,
        q: query.q,
        labelIds: query.labelIds
      });

      const messages = response.data.messages || [];
      const emailDetails = await Promise.all(
        messages.map(async (message) => {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date']
          });

          const headers = detail.data.payload?.headers;
          return {
            id: message.id,
            threadId: message.threadId,
            from: headers?.find(h => h.name === 'From')?.value,
            subject: headers?.find(h => h.name === 'Subject')?.value,
            date: headers?.find(h => h.name === 'Date')?.value,
            snippet: detail.data.snippet
          };
        })
      );

      return emailDetails;
    } catch (error) {
      console.error('Error listing emails:', error);
      throw error;
    }
  }

  public async getEmail(req: Request, messageId: string): Promise<any> {
    try {
      const auth = await this.getAuthClient(req);
      const gmail = google.gmail({ version: 'v1', auth });

      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  }

  public async searchEmails(req: Request, searchQuery: string): Promise<any> {
    return this.listEmails(req, {
      q: searchQuery,
      maxResults: 10
    });
  }
}
