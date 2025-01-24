import { DeepseekService } from './deepseek.service';
import { ActionService } from './action.service';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { SYSTEM_PROMPT, ACTION_SUCCESS_PROMPT, ACTION_ERROR_PROMPT } from '../config/prompts.config';

export class AssistantService extends EventEmitter {
  private static instance: AssistantService;
  private deepseekService: DeepseekService;
  private actionService: ActionService;
  private capabilities: any;

  private constructor() {
    super();
    this.deepseekService = DeepseekService.getInstance();
    this.actionService = new ActionService();
    this.capabilities = JSON.parse(fs.readFileSync(path.join(__dirname, '../capabilities.json'), 'utf-8'));
    this.initializeAssistant();
  }

  private initializeAssistant() {
    this.deepseekService.initializeChat(SYSTEM_PROMPT(this.capabilities));
  }

  public static getInstance(): AssistantService {
    if (!AssistantService.instance) {
      AssistantService.instance = new AssistantService();
    }
    return AssistantService.instance;
  }

  public async chat(message: string, req: Request) {
    return this.processMessage(message, req);
  }

  public clearConversation() {
    this.deepseekService.clearChat();
    this.initializeAssistant();
  }

  private async processMessage(message: string, req: Request): Promise<any> {
    try {
      const response = await this.deepseekService.chat(message);
      console.log('AI Response:', response);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        return {
          type: 'response',
          content: response
        };
      }

      if (parsedResponse.action) {
        if (parsedResponse.message) {
          this.emit('response', {
            type: 'response',
            content: parsedResponse.message
          });
        }

        try {
          const actionResult = await this.actionService.executeAction({
            name: parsedResponse.action.action,
            parameters: parsedResponse.action.data
          }, req);

          const formattedResponse = await this.deepseekService.chat(
            ACTION_SUCCESS_PROMPT(actionResult)
          );

          return {
            type: 'response',
            content: formattedResponse
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          const formattedResponse = await this.deepseekService.chat(
            ACTION_ERROR_PROMPT(errorMsg)
          );

          return {
            type: 'error',
            content: formattedResponse
          };
        }
      }

      if (parsedResponse.message) {
        return {
          type: 'response',
          content: parsedResponse.message
        };
      }

      return {
        type: 'response',
        content: response
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        type: 'error',
        content: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }
}
