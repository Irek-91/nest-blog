import {
  AuthLinkViewModel,
  TelegramUpdateMessage,
} from '../infrastructure/adapters/telegram-adapter';
import { GetLinkForSuscriber } from './../users/application/use-case/get.link.for.suscriber.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { UserAuthGuard } from './../auth/guards/auth.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HandlerTelegram } from './use-case/handle.telegram.use.case';
import { ApiTags } from '@nestjs/swagger';

@Controller('integrations')
@ApiTags('Integrations')
export class IntegrationsController {
  constructor(private commandBus: CommandBus) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('telegram/webhook')
  async forTelegram(@Body() payload: TelegramUpdateMessage) {
    console.log(payload);
    await this.commandBus.execute(new HandlerTelegram(payload));
    return true;
  }

  @UseGuards(UserAuthGuard)
  @Get('telegram/auth-bot-link')
  async GetAuthBotLink(@Request() req: any) {
    const userId = req.userId; //исправить после авторизации

    const link: AuthLinkViewModel | null = await this.commandBus.execute(
      new GetLinkForSuscriber(userId),
    );
    if (!link) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    return link;
  }
}
