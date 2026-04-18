import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LogErrorDto } from './dto/log-error.dto';
import { ErrorsService } from './errors.service';

@Controller('errors')
export class ErrorsController {
  constructor(private readonly errorsService: ErrorsService) {}

  @Post('log')
  @HttpCode(HttpStatus.OK)
  async log(@Body() dto: LogErrorDto): Promise<{ status: string }> {
    await this.errorsService.log(dto);
    return { status: 'saved' };
  }
}
