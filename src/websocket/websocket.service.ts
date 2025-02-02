import WebSocket from 'ws';
import { AssistantService } from '../services/assistant.service';
import { TokenService } from '../services/token.service';
import { TimeService } from '../services/time.service';
import { parse as parseCookies } from 'cookie';
import { IncomingMessage } from 'http';
import { Request } from 'express';

export class WebSocketService {
  private wss: WebSocket.Server;
  private assistant: AssistantService;
  private tokenService: TokenService;
  private timeService: TimeService;

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.assistant = AssistantService.getInstance();
    this.tokenService = TokenService.getInstance();
    this.timeService = TimeService.getInstance();
    this.initialize();
  }

  private createRequestFromHeaders(headers: IncomingMessage['headers']): Request {
    const req = {
      cookies: {},
      headers,
      header: (name: string) => headers[name.toLowerCase()],
      get: (name: string) => headers[name.toLowerCase()]
    } as Request;

    if (headers.cookie) {
      req.cookies = parseCookies(headers.cookie);
    }

    return req;
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log('New WebSocket connection');

      const responseHandler = (response: any) => {
        ws.send(JSON.stringify({
          type: response.type,
          content: response.content
        }));
      };

      const alarmHandler = (alarm: any) => {
        ws.send(JSON.stringify({
          type: 'alarm',
          content: alarm
        }));
      };

      this.assistant.on('response', responseHandler);
      this.timeService.onAlarm(alarmHandler);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          console.log('Received:', data);

          if (data.type === 'message') {
            const request = this.createRequestFromHeaders(req.headers);
            const response = await this.assistant.chat(data.content, request);
            
            ws.send(JSON.stringify({
              type: response.type,
              content: response.content
            }));
          } else if (data.type === 'clear') {
            this.assistant.clearConversation();
            ws.send(JSON.stringify({
              type: 'response',
              content: { message: 'Conversation cleared' }
            }));
          }
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            content: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });

      ws.on('close', () => {
        this.assistant.removeListener('response', responseHandler);
        this.timeService.offAlarm(alarmHandler);
        console.log('Client disconnected');
      });
    });
  }
}
