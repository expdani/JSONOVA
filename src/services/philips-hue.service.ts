import axios from 'axios';
import { TokenService } from './token.service';

export interface Light {
  id: string;
  name: string;
  state: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
  };
}

export interface Room {
  id: string;
  name: string;
  lights: string[];
}

export class PhilipsHueService {
  private static instance: PhilipsHueService;
  private tokenService: TokenService;
  private baseUrl: string;
  private bridgeIp: string | null = null;
  private username: string | null = null;

  private constructor() {
    this.tokenService = TokenService.getInstance();
    this.baseUrl = process.env.PHILIPS_HUE_API_URL || 'https://api.meethue.com/bridge';
    this.username = process.env.PHILIPS_HUE_USERNAME || null;
    this.bridgeIp = process.env.PHILIPS_HUE_BRIDGE_IP || null;
  }

  public static getInstance(): PhilipsHueService {
    if (!PhilipsHueService.instance) {
      PhilipsHueService.instance = new PhilipsHueService();
    }
    return PhilipsHueService.instance;
  }

  public async getBridgeIp(): Promise<string> {
    if (this.bridgeIp) {
      return this.bridgeIp;
    }

    try {
      const response = await axios.get('https://discovery.meethue.com');
      if (response.data && response.data.length > 0) {
        const ip = response.data[0].internalipaddress;
        if (!ip) {
          throw new Error('No bridge IP found in discovery response');
        }
        this.bridgeIp = ip;
        return ip;
      }
      throw new Error('No Philips Hue bridge found');
    } catch (error) {
      console.error('Error discovering Hue bridge:', error);
      throw error;
    }
  }

  public async createUser(): Promise<string> {
    try {
      const bridgeIp = await this.getBridgeIp();
      const response = await axios.post(`http://${bridgeIp}/api`, {
        devicetype: 'my_assistant#device'
      });

      if (!response.data?.[0]?.success?.username) {
        const error = response.data?.[0]?.error?.description || 'Unknown error creating user';
        throw new Error(error);
      }

      const username = response.data[0].success.username;
      this.username = username;
      return username;
    } catch (error) {
      console.error('Error creating Hue user:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.username) {
      throw new Error('No Hue username available. Please run bridge setup first.');
    }
  }

  public async getAllLights(): Promise<Light[]> {
    try {
      await this.ensureAuthenticated();
      const bridgeIp = await this.getBridgeIp();
      const response = await axios.get(`http://${bridgeIp}/api/${this.username}/lights`);
      
      return Object.entries(response.data).map(([id, light]: [string, any]) => ({
        id,
        name: light.name,
        state: light.state
      }));
    } catch (error) {
      console.error('Error getting lights:', error);
      throw error;
    }
  }

  public async getAllRooms(): Promise<Room[]> {
    try {
      await this.ensureAuthenticated();
      const bridgeIp = await this.getBridgeIp();
      const response = await axios.get(`http://${bridgeIp}/api/${this.username}/groups`);
      
      return Object.entries(response.data).map(([id, room]: [string, any]) => ({
        id,
        name: room.name,
        lights: room.lights
      }));
    } catch (error) {
      console.error('Error getting rooms:', error);
      throw error;
    }
  }

  public async setLightState(lightId: string, state: { on?: boolean; bri?: number; hue?: number; sat?: number }): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const bridgeIp = await this.getBridgeIp();
      await axios.put(`http://${bridgeIp}/api/${this.username}/lights/${lightId}/state`, state);
    } catch (error) {
      console.error(`Error setting light state for light ${lightId}:`, error);
      throw error;
    }
  }

  public async setRoomState(roomId: string, state: { on?: boolean; bri?: number; hue?: number; sat?: number }): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const bridgeIp = await this.getBridgeIp();
      await axios.put(`http://${bridgeIp}/api/${this.username}/groups/${roomId}/action`, state);
    } catch (error) {
      console.error(`Error setting room state for room ${roomId}:`, error);
      throw error;
    }
  }

  public async turnAllLightsOff(): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const lights = await this.getAllLights();
      await Promise.all(lights.map(light => this.setLightState(light.id, { on: false })));
    } catch (error) {
      console.error('Error turning off all lights:', error);
      throw error;
    }
  }

  public async turnAllLightsOn(): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const lights = await this.getAllLights();
      await Promise.all(lights.map(light => this.setLightState(light.id, { on: true })));
    } catch (error) {
      console.error('Error turning on all lights:', error);
      throw error;
    }
  }

  public async handleAction(action: string, data: any): Promise<string> {
    switch (action) {
      case 'turn_on':
        if (data.groupId) {
          await this.setRoomState(data.groupId, { on: true });
          return `Turned on lights in group ${data.groupId}`;
        } else {
          await this.setLightState(data.lightId, { on: true });
          return `Turned on light ${data.lightId}`;
        }

      case 'turn_off':
        if (data.groupId) {
          await this.setRoomState(data.groupId, { on: false });
          return `Turned off lights in group ${data.groupId}`;
        } else {
          await this.setLightState(data.lightId, { on: false });
          return `Turned off light ${data.lightId}`;
        }

      case 'adjust_brightness':
        const bri = Math.round((data.brightness / 100) * 254); // Convert 0-100 to 0-254
        if (data.groupId) {
          await this.setRoomState(data.groupId, { bri });
          return `Set brightness to ${data.brightness}% for group ${data.groupId}`;
        } else {
          await this.setLightState(data.lightId, { bri });
          return `Set brightness to ${data.brightness}% for light ${data.lightId}`;
        }

      case 'change_color':
        const colorMap: { [key: string]: { hue: number; sat: number } } = {
          red: { hue: 0, sat: 254 },
          blue: { hue: 46920, sat: 254 },
          green: { hue: 25500, sat: 254 },
          yellow: { hue: 12750, sat: 254 },
          purple: { hue: 56100, sat: 254 },
          pink: { hue: 56100, sat: 175 },
          white: { hue: 0, sat: 0 }
        };

        const colorSettings = colorMap[data.color.toLowerCase()];
        if (!colorSettings) {
          throw new Error(`Unsupported color: ${data.color}`);
        }

        if (data.groupId) {
          await this.setRoomState(data.groupId, colorSettings);
          return `Changed color to ${data.color} for group ${data.groupId}`;
        } else {
          await this.setLightState(data.lightId, colorSettings);
          return `Changed color to ${data.color} for light ${data.lightId}`;
        }

      case 'list_lights':
        const lights = await this.getAllLights();
        return `Found ${lights.length} lights:\n${lights.map(light => 
          `- ${light.name} (${light.id}): ${light.state.on ? 'On' : 'Off'}, Brightness: ${Math.round((light.state.bri / 254) * 100)}%`
        ).join('\n')}`;

      case 'control_group':
        const state = { on: data.action === 'on' };
        await this.setRoomState(data.groupId, state);
        return `${data.action === 'on' ? 'Turned on' : 'Turned off'} lights in group ${data.groupId}`;

      case 'turn_all_on':
        await this.turnAllLightsOn();
        return 'Turned on all lights';

      case 'turn_all_off':
        await this.turnAllLightsOff();
        return 'Turned off all lights';

      default:
        throw new Error(`Unknown Hue action: ${action}`);
    }
  }
}
