import { DeepseekService } from './deepseek.service';
import { ActionService } from './action.service';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { SYSTEM_PROMPT, ACTION_SUCCESS_PROMPT, ACTION_ERROR_PROMPT } from '../config/prompts.config';

interface AIAction {
  action: string;
  data: Record<string, any>;
}

interface AIResponse {
  message?: string;
  action?: AIAction;
  actions?: AIAction[];
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

interface CombinedActionResults {
  success: boolean;
  results: ActionResult[];
  summary: string;
}

interface AssistantResponse {
  type: 'response' | 'error';
  content: string;
  actionResults?: CombinedActionResults;
}

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

  private async initializeAssistant() {
    try {
      const hueState = await this.actionService.executeAction({
        name: 'list_lights',
        parameters: {}
      }, {} as Request);

      this.deepseekService.initializeChat(SYSTEM_PROMPT({
        ...this.capabilities,
        hue_state: {
          lights: hueState.lights,
          rooms: hueState.rooms
        }
      }));
    } catch (error) {
      console.error('Failed to get Hue state:', error);
      this.deepseekService.initializeChat(SYSTEM_PROMPT(this.capabilities));
    }
  }

  public static getInstance(): AssistantService {
    if (!AssistantService.instance) {
      AssistantService.instance = new AssistantService();
    }
    return AssistantService.instance;
  }

  public async chat(message: string, req: Request): Promise<AssistantResponse> {
    return this.processMessage(message, req);
  }

  public clearConversation() {
    this.deepseekService.clearChat();
    this.initializeAssistant();
  }

  private async processMessage(message: string, req: Request): Promise<AssistantResponse> {
    try {
      const response = await this.deepseekService.chat(message);
      console.log('AI Response:', response);

      let parsedResponse: AIResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        return {
          type: 'response',
          content: response
        };
      }

      if (parsedResponse.action || parsedResponse.actions) {
        if (parsedResponse.message) {
          this.emit('response', {
            type: 'response',
            content: parsedResponse.message
          });
        }

        try {
          let actionResults: ActionResult[] = [];
          
          if (Array.isArray(parsedResponse.actions)) {
            actionResults = await Promise.all(
              parsedResponse.actions.map(async (action: AIAction) => 
                this.actionService.executeAction({
                  name: action.action,
                  parameters: action.data
                }, req)
              )
            );
          } else if (parsedResponse.action) {
            const result = await this.actionService.executeAction({
              name: parsedResponse.action.action,
              parameters: parsedResponse.action.data
            }, req);
            actionResults = [result];
          }

          const combinedResults: CombinedActionResults = {
            success: actionResults.every(result => !result.error),
            results: actionResults,
            summary: `Executed ${actionResults.length} action${actionResults.length > 1 ? 's' : ''}`
          };

          const formattedResponse = await this.deepseekService.chat(
            ACTION_SUCCESS_PROMPT(combinedResults)
          );

          return {
            type: 'response',
            content: formattedResponse,
            actionResults: combinedResults
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
