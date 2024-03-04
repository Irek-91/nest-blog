import { AddTelegramIdBySubscriberCommand } from './../../blogs/application/use-case/add.telegramId.for.subscriber.use.case';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { TelegramAdapter, TelegramUpdateMessage } from './../../adapters/telegram-adapter';
import { Injectable } from "@nestjs/common";

export class HandlerTelegram {
    constructor (public payload : TelegramUpdateMessage) {
    }
}

@CommandHandler(HandlerTelegram)
export class HandleTelegramUseCase {
    constructor(private telegramAdapter : TelegramAdapter,
        private commanBus: CommandBus) {
    }

    async execute(command: HandlerTelegram) {
        const telegramId= command.payload.message.from.id
        const text = command.payload.message.text
        let codeUser
        let match = text.match(/\/start code/);
        if (match !== null && match[0] === '/start code') {
            codeUser = text.substring(12)

            const res: true | null = await this.commanBus.execute(new AddTelegramIdBySubscriberCommand(codeUser, telegramId)) 
        }

        


    }
}