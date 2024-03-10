import { settings } from './../settings';
import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class TelegramAdapter {
    private axiosInstanse: AxiosInstance
    constructor() {
        const token = settings.TELEGRAM_BOT_KEY
        this.axiosInstanse = axios.create({
            baseURL: `https://api.telegram.org/bot${token}/`
        })
    }
    async setWebHook(url: string) {
        await this.axiosInstanse.post(`setWebHook`, {
            url: url
        })
    }

    async deleteWebhook(url: string) {
        await this.axiosInstanse.post(`deleteWebhook`, {
            url: url
        })
    }

    async getUpdates() {
        await this.axiosInstanse.post(`getUpdates`, {
            limit: 0
        })
    }
    
    async sendMessage(text: string, recipientId: number) {
        await this.axiosInstanse.post(`sendMessage`, {
            chat_id: recipientId,
            text: text
        })
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

export type AuthLinkWiewModel = {
    link: string
}