import { EventEmitter } from 'events';

interface Alarm {
  id: string;
  time: Date;
  message?: string;
  isActive: boolean;
  timeout?: NodeJS.Timeout;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export class TimeService {
  private static instance: TimeService;
  private alarms: Map<string, Alarm>;
  private eventEmitter: EventEmitter;

  private constructor() {
    this.alarms = new Map();
    this.eventEmitter = new EventEmitter();
    console.log('[TimeService] Initialized');
  }

  public static getInstance(): TimeService {
    if (!TimeService.instance) {
      TimeService.instance = new TimeService();
    }
    return TimeService.instance;
  }

  private scheduleAlarm(alarm: Alarm): void {
    const now = Date.now();
    const alarmTime = alarm.time.getTime();
    const delay = alarmTime - now;

    console.log('[TimeService] Scheduling alarm:', {
      id: alarm.id,
      message: alarm.message,
      scheduledTime: alarm.time.toLocaleString(),
      delayMs: delay
    });

    if (delay <= 0) {
      console.error('[TimeService] Invalid delay:', delay);
      throw new Error('Cannot schedule alarm in the past');
    }

    alarm.timeout = setTimeout(() => {
      console.log('[TimeService] Alarm triggered:', {
        id: alarm.id,
        message: alarm.message,
        scheduledTime: alarm.time.toLocaleString(),
        actualTime: new Date().toLocaleString()
      });

      if (alarm.isActive) {
        this.eventEmitter.emit('alarm', alarm);
        alarm.isActive = false;
        this.alarms.delete(alarm.id);
      }
    }, delay);
  }

  public async handleAction(action: string, parameters: any): Promise<ActionResult> {
    console.log('[TimeService] Handling action:', { action, parameters });
    switch (action) {
      case 'set_alarm':
        return this.setAlarm(parameters.time, parameters.message);
      case 'cancel_alarm':
        return this.cancelAlarm(parameters.alarmId);
      case 'list_alarms':
        return this.listAlarms();
      default:
        throw new Error(`Handler for action ${action} not implemented in TimeService`);
    }
  }

  public async setAlarm(time: string, message: string): Promise<ActionResult> {
    try {
      console.log('[TimeService] Setting alarm with input:', { time, message });
      
      const alarmTime = new Date(time);
      console.log('[TimeService] Parsed alarm time:', {
        parsed: alarmTime.toLocaleString(),
        timestamp: alarmTime.getTime(),
        now: Date.now()
      });

      if (isNaN(alarmTime.getTime())) {
        throw new Error('Invalid time format');
      }

      if (alarmTime.getTime() < Date.now()) {
        throw new Error('Cannot set alarm for past time');
      }

      const alarm: Alarm = {
        id: Math.random().toString(36).substring(7),
        time: alarmTime,
        message,
        isActive: true
      };

      console.log('[TimeService] Created alarm object:', {
        id: alarm.id,
        time: alarm.time.toLocaleString(),
        message: alarm.message
      });

      this.scheduleAlarm(alarm);
      this.alarms.set(alarm.id, alarm);

      const timeUntilAlarm = this.formatTimeUntilAlarm(alarmTime);
      console.log('[TimeService] Alarm successfully set:', {
        id: alarm.id,
        timeUntil: timeUntilAlarm,
        activeAlarms: this.alarms.size
      });
      
      return {
        success: true,
        message: `Alarm set for ${timeUntilAlarm} from now (${alarmTime.toLocaleString()}) with message: ${message}`,
        data: {
          id: alarm.id,
          time: alarmTime.toISOString(),
          message: alarm.message
        }
      };
    } catch (error: any) {
      console.error('[TimeService] Error setting alarm:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  public async cancelAlarm(alarmId: string): Promise<ActionResult> {
    try {
      console.log('[TimeService] Canceling alarm:', alarmId);
      const alarm = this.alarms.get(alarmId);
      if (alarm) {
        if (alarm.timeout) {
          clearTimeout(alarm.timeout);
        }
        this.alarms.delete(alarmId);
        return {
          success: true,
          message: 'Alarm cancelled successfully'
        };
      }
      return {
        success: false,
        message: 'Alarm not found'
      };
    } catch (error: any) {
      console.error('[TimeService] Error canceling alarm:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  public async listAlarms(): Promise<ActionResult> {
    try {
      console.log('[TimeService] Listing alarms');
      const alarms = Array.from(this.alarms.values()).map(({ timeout, ...alarm }) => alarm);
      return {
        success: true,
        message: 'Alarms retrieved successfully',
        data: alarms
      };
    } catch (error: any) {
      console.error('[TimeService] Error listing alarms:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  private formatTimeUntilAlarm(alarmTime: Date): string {
    const diff = alarmTime.getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  public onAlarm(listener: (alarm: Alarm) => void): void {
    this.eventEmitter.on('alarm', listener);
  }

  public offAlarm(listener: (alarm: Alarm) => void): void {
    this.eventEmitter.removeListener('alarm', listener);
  }

  public dispose(): void {
    console.log('[TimeService] Disposing service');
    this.alarms.forEach(alarm => {
      if (alarm.timeout) {
        clearTimeout(alarm.timeout);
      }
    });
    this.alarms.clear();
    this.eventEmitter.removeAllListeners();
  }
}
