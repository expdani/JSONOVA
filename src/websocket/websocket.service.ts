import WebSocket from 'ws';
import { AssistantService } from '../services/assistant.service';
import { TokenService } from '../services/token.service';
import { parse as parseCookies } from 'cookie';
import { IncomingMessage } from 'http';
import { Request } from 'express';

export class WebSocketService {
  private wss: WebSocket.Server;
  private assistant: AssistantService;
  private tokenService: TokenService;

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.assistant = AssistantService.getInstance();
    this.tokenService = TokenService.getInstance();
    this.initialize();
  }

  private createRequestFromHeaders(headers: IncomingMessage['headers']): Request {
    // Create a partial Request object with the necessary properties
    const req = {
      cookies: {},
      headers,
      header: (name: string) => headers[name.toLowerCase()],
      get: (name: string) => headers[name.toLowerCase()]
    } as Request;

    // Parse cookies if they exist
    if (headers.cookie) {
      req.cookies = parseCookies(headers.cookie);
    }

    return req;
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log('New WebSocket connection');

      // Set up event listener for assistant responses
      const responseHandler = (response: any) => {
        ws.send(JSON.stringify({
          type: response.type,
          content: response.content
        }));
      };

      this.assistant.on('response', responseHandler);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          console.log('Received:', data);

          if (data.type === 'message') {
            const request = this.createRequestFromHeaders(req.headers);
            const response = await this.assistant.chat(data.content, request);
            
            // Send the final response (action result or error)
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
        // Clean up event listener
        this.assistant.removeListener('response', responseHandler);
        console.log('Client disconnected');
      });
    });
  }
}
