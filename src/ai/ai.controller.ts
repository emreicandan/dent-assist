import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() generateDto: GenerateDto) {
    const response = await this.aiService.generateContent(generateDto.prompt);
    return { response };
  }
}
