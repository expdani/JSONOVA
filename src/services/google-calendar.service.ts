import { calendar_v3, google } from 'googleapis';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { OAuthService } from './oauth.service';

export interface GoogleTokens extends Credentials {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface CalendarEventInput {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private calendar: calendar_v3.Calendar;
  private auth: OAuth2Client;
  private oauthService: OAuthService;

  private constructor() {
    this.oauthService = OAuthService.getInstance();
    this.auth = this.oauthService.getOAuth2Client();
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  setCredentials(credentials: Credentials) {
    this.auth.setCredentials(credentials);
  }

  async createEvent(event: CalendarEventInput): Promise<calendar_v3.Schema$Event> {
    try {
      // Add default reminders if not specified
      if (!event.reminders) {
        event.reminders = {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 }
          ]
        };
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async listEvents(params: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    q?: string;
  } = {}): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: params.timeMin || new Date().toISOString(),
        timeMax: params.timeMax,
        maxResults: params.maxResults || 10,
        singleEvents: true,
        orderBy: 'startTime',
        q: params.q
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error listing events:', error);
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });
      return response.data;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEventInput>): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
