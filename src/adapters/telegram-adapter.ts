import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class TelegramAdapter {
    private axiosInstanse: AxiosInstance
    constructor() {
        const token = process.env.TELEGRAM_BOT_KEY
        this.axiosInstanse = axios.create({
            baseURL: `https://api.telegram.org/bot${token}/`
        })
    }
    async setWebHook(url: string) {
        await this.axiosInstanse.post(`setWebHook`, {
            url: url
        })
    }


}