import { AddTelegramIdBySubscriberCommand } from './../../blogs/application/use-case/add.telegramId.for.subscriber.use.case';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import {
  TelegramAdapter,
  TelegramUpdateMessage,
} from './../../adapters/telegram-adapter';

export class HandlerTelegram {
  constructor(public payload: TelegramUpdateMessage) {}
}

@CommandHandler(HandlerTelegram)
export class HandleTelegramUseCase {
  constructor(
    private telegramAdapter: TelegramAdapter,
    private commanBus: CommandBus,
  ) {}

  async execute(command: HandlerTelegram) {
    try {
      const telegramId = command.payload.message.from.id;
      const text = command.payload.message.text;
      let codeUser;
      const match = text.match(/\/start code/);
      if (match !== null && match[0] === '/start code') {
        codeUser = text.substring(12);

        const res: true | null = await this.commanBus.execute(
          new AddTelegramIdBySubscriberCommand(codeUser, telegramId),
        );
      }
    } catch (e) {
      console.log(e);
      return true;
    }
  }
}
