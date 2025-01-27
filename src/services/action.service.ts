import { Request } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { GmailService } from './gmail.service';
import { PhilipsHueService } from './philips-hue.service';
import { TimeService } from './time.service';

export class ActionService {
  private static instance: ActionService;
  private calendarService: GoogleCalendarService;
  private gmailService: GmailService;
  private hueService: PhilipsHueService;
  private timeService: TimeService;

  private constructor() {
    this.calendarService = GoogleCalendarService.getInstance();
    this.gmailService = GmailService.getInstance();
    this.hueService = PhilipsHueService.getInstance();
    this.timeService = TimeService.getInstance();
    
    this.timeService.onAlarm((alarm) => {
      console.log(`ALARM: ${alarm.message}`);
    });
  }

  public static getInstance(): ActionService {
    if (!ActionService.instance) {
      ActionService.instance = new ActionService();
    }
    return ActionService.instance;
  }

  async executeAction(action: { name: string; parameters: any }, req: Request): Promise<any> {    
    console.log('[ActionService] Executing action:', { name: action.name, parameters: action.parameters });
    
    try {
      let result;
      switch (action.name) {
        // Calendar actions
        case 'list_events':
          result = await this.calendarService.listEvents(action.parameters);
          break;
        case 'create_event':
          result = await this.calendarService.createEvent(action.parameters);
          break;
        case 'update_event':
          result = await this.calendarService.updateEvent(
            action.parameters.eventId,
            action.parameters.event
          );
          break;
        case 'delete_event':
          result = await this.calendarService.deleteEvent(action.parameters.eventId);
          break;
        case 'get_event':
          result = await this.calendarService.getEvent(action.parameters.eventId);
          break;

        // Gmail actions
        case 'list_emails':
          result = await this.gmailService.listEmails(req, action.parameters);
          break;
        case 'search_emails':
          result = await this.gmailService.searchEmails(req, action.parameters.query);
          break;
        case 'get_email':
          result = await this.gmailService.getEmail(req, action.parameters.messageId);
          break;

        // Philips Hue actions
        case 'turn_on':
        case 'turn_off':
        case 'adjust_brightness':
        case 'change_color':
        case 'list_lights':
        case 'control_group':
        case 'turn_all_on':
        case 'turn_all_off':
          result = await this.hueService.handleAction(action.name, action.parameters);
          break;

        // Time actions
        case 'set_alarm':
        case 'cancel_alarm':
        case 'list_alarms':
          console.log('[ActionService] Handling time action:', action.name);
          result = await this.timeService.handleAction(action.name, action.parameters);
          console.log('[ActionService] Time action result:', result);
          break;

        default:
          throw new Error(`Handler for action ${action.name} not implemented`);
      }
      
      console.log('[ActionService] Action completed successfully:', { 
        action: action.name, 
        result 
      });
      return result;
      
    } catch (error) {
      console.error('[ActionService] Error executing action:', { 
        action: action.name, 
        error 
      });
      throw error;
    }
  }
}
