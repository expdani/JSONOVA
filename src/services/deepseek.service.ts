import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

export class DeepseekService {
  private static instance: DeepseekService;
  private client: OpenAI;
  private model = 'deepseek-chat';
  private conversationHistory: ChatCompletionMessageParam[] = [];

  private constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_API_URL,
    });
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

  async chat(message: string): Promise<string> {
    try {
      if (this.conversationHistory.length === 0) {
        throw new Error('Chat not initialized. Call initializeChat first.');
      }

      this.conversationHistory.push({ role: 'user', content: message });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: this.conversationHistory,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }

      this.conversationHistory.push({ role: 'assistant', content });
      return content;

    } catch (error) {
      console.error('Error in DeepseekService chat:', error);
      throw error;
    }
  }
}
