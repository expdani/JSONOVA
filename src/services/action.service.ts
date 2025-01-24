import { Request } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { TokenService } from './token.service';
import { GmailService } from './gmail.service';
import { PhilipsHueService } from './philips-hue.service';

export class ActionService {
  private calendarService: GoogleCalendarService;
  private tokenService: TokenService;
  private gmailService: GmailService;
  private hueService: PhilipsHueService;

  constructor() {
    this.calendarService = GoogleCalendarService.getInstance();
    this.tokenService = TokenService.getInstance();
    this.gmailService = GmailService.getInstance();
    this.hueService = PhilipsHueService.getInstance();
  }

  async executeAction(action: { name: string; parameters: any }, req: Request): Promise<any> {
    // Check if we have valid tokens
    const tokens = this.tokenService.getTokens(req);
    if (!tokens && action.name !== 'list_lights') {
      throw new Error('No authentication tokens found');
    }

    switch (action.name) {
      // Calendar actions
      case 'list_events':
        return this.calendarService.listEvents(action.parameters);
      case 'create_event':
        return this.calendarService.createEvent(action.parameters);
      case 'update_event':
        return this.calendarService.updateEvent(
          action.parameters.eventId,
          action.parameters.event
        );
      case 'delete_event':
        return this.calendarService.deleteEvent(action.parameters.eventId);
      case 'get_event':
        return this.calendarService.getEvent(action.parameters.eventId);

      // Gmail actions
      case 'list_emails':
        return this.gmailService.listEmails(req, action.parameters);
      case 'search_emails':
        return this.gmailService.searchEmails(req, action.parameters.query);
      case 'get_email':
        return this.gmailService.getEmail(req, action.parameters.messageId);
        
      // Philips Hue actions
      case 'turn_on':
      case 'turn_off':
      case 'adjust_brightness':
      case 'change_color':
      case 'list_lights':
      case 'control_group':
      case 'turn_all_on':
      case 'turn_all_off':
        return this.hueService.handleAction(action.name, action.parameters);

      default:
        throw new Error(`Handler for action ${action.name} not implemented`);
    }
  }
}
