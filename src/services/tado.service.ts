// import { Tado } from 'node-tado-client';

// export class TadoService {
//   private static instance: TadoService;
//   private tado: Tado;
//   private homeId: number | null = null;

//   private constructor() {
//     const username = process.env.TADO_USERNAME;
//     const password = process.env.TADO_PASSWORD;

//     if (!username || !password) {
//       throw new Error('Tado credentials not found in environment variables');
//     }

//     this.tado = new Tado();
//   }

//   public static getInstance(): TadoService {
//     if (!TadoService.instance) {
//       TadoService.instance = new TadoService();
//     }
//     return TadoService.instance;
//   }

//   private async ensureAuthenticated(): Promise<void> {
//     if (!this.homeId) {
//       await this.tado.login(process.env.TADO_USERNAME!, process.env.TADO_PASSWORD!);
//       const me = await this.tado.getMe();
//       this.homeId = me.homes[0].id;
//     }
//   }

//   public async getZones(): Promise<any> {
//     await this.ensureAuthenticated();
//     return this.tado.getZones(this.homeId!);
//   }

//   public async getZoneState(zoneId: number): Promise<any> {
//     await this.ensureAuthenticated();
//     return this.tado.getZoneState(this.homeId!, zoneId);
//   }

//   public async setTemperature(zoneId: number, temperature: number): Promise<any> {
//     await this.ensureAuthenticated();
//     return this.tado.setZoneOverlay(this.homeId!, zoneId, {
//       type: 'MANUAL',
//       setting: {
//         type: 'HEATING',
//         power: 'ON',
//         temperature: { celsius: temperature }
//       }
//     });
//   }

//   public async turnOff(zoneId: number): Promise<any> {
//     await this.ensureAuthenticated();
//     return this.tado.setZoneOverlay(this.homeId!, zoneId, {
//       type: 'MANUAL',
//       setting: {
//         type: 'HEATING',
//         power: 'OFF'
//       }
//     });
//   }

//   public async setAuto(zoneId: number): Promise<any> {
//     await this.ensureAuthenticated();
//     return this.tado.deleteZoneOverlay(this.homeId!, zoneId);
//   }

//   public async getHomeState(): Promise<any> {
//     await this.ensureAuthenticated();
//     return this.tado.getHomeState(this.homeId!);
//   }
// }
