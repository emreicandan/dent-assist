import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class AiService implements OnModuleInit {
  private model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const statusCode: number = error.status ?? error.httpStatusCode ?? error.statusCode;
      if (statusCode === 429) {
        throw new HttpException(
          'AI API rate limit exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (statusCode === 401 || statusCode === 403) {
        throw new HttpException(
          'Invalid or unauthorized AI API key.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        error.message ?? 'AI service is currently unavailable.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
