import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

export class DeepseekService {
  private static instance: DeepseekService;
  private client: OpenAI;
  private model: string;
  private conversationHistory: ChatCompletionMessageParam[] = [];

  private constructor() {
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_API_URL,
    });
    console.log('[DeepseekService] Initialized with baseURL:', process.env.DEEPSEEK_API_URL);
  }

  public static getInstance(): DeepseekService {
    if (!DeepseekService.instance) {
      DeepseekService.instance = new DeepseekService();
    }
    return DeepseekService.instance;
  }

  public initializeChat(systemPrompt: string) {
    this.conversationHistory = [
      { role: 'system', content: systemPrompt }
    ];
  }

  public clearChat() {
    this.conversationHistory = [];
  }

  public async checkHealth(): Promise<{ isHealthy: boolean, error?: string }> {
    try {
      console.log('[DeepseekService] Checking API health...');
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 100
      });
      console.log('[DeepseekService] Health check response:', response.choices[0].message.content);
      return { isHealthy: true };
    } catch (error: any) {
      console.error('[DeepseekService] Health check failed:', error);
      return {
        isHealthy: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async chat(message: string): Promise<string> {
    try {
      console.log('[DeepseekService] Sending chat message:', message);
      
      if (this.conversationHistory.length === 0) {
        throw new Error('Chat not initialized. Call initializeChat first.');
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          ...this.conversationHistory,
          { role: 'user', content: message }
        ]
      });

      console.log('[DeepseekService] Received response:', response);

      if (!response.choices[0]?.message?.content) {
        throw new Error('No response content received from API');
      }

      const responseContent = response.choices[0].message.content;
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: responseContent }
      );

      return responseContent;
    } catch (error: any) {
      console.error('[DeepseekService] Chat error:', error);
      throw new Error(`Failed to get response: ${error.message}`);
    }
  }
}
