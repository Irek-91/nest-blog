import { UserAuthGuard } from './../auth/guards/auth.guard';
import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";


@Controller('integrations')
export class IntegrationsController {
    @Post('telegram/webhook')
    async forTelegram(@Body() payload: TelegramUpdateMessage) {
        console.log('telegram', payload)
    }


    @UseGuards(UserAuthGuard)
    @Get('telegram/auth-bot-link')
    async GetAuthBotLink(@Request() req: any) {
        const userId = req.userId//исправить после авторизации
        
    }
}




export type TelegramUpdateMessage = {
    message: {
        from : {
            id: number,
            first_name: string,
            last_name: string
        };
        text: string
    }
}

