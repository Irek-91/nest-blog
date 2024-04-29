import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor() {
    const token = process.env.TELEGRAM_BOT_KEY;
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${token}/`,
    });
  }
  async setWebHook(url: string) {
    await this.axiosInstance.post(`setWebHook`, {
      url: url,
    });
  }

  async deleteWebhook(url: string) {
    await this.axiosInstance.post(`deleteWebhook`, {
      url: url,
    });
  }

  async getUpdates() {
    await this.axiosInstance.post(`getUpdates`, {
      limit: 0,
    });
  }

  async sendMessage(text: string, recipientId: number) {
    await this.axiosInstance.post(`sendMessage`, {
      chat_id: recipientId,
      text: text,
    });
  }
}

export type TelegramUpdateMessage = {
  message: {
    from: {
      id: number;
      first_name: string;
      last_name: string;
    };
    text: string;
  };
};

export type AuthLinkViewModel = {
  link: string;
};
