import { TelegramAdapter } from './adapters/telegram-adapter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { appSettings } from './app.settings';
import {TypeOrmModule} from '@nestjs/typeorm';
import { env } from 'process';
import * as ngrok from 'ngrok'
import { settings } from './settings';
import axios from 'axios';
import { config } from 'dotenv';


async function connectToNgrok() {
  const url = await ngrok.connect(3000)
  console.log(url)
  return url
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const telegramAdaper = await app.resolve(TelegramAdapter)
  appSettings(app)
  await app.listen(3000);
  console.log('App started port 3000')
  const baseUrl = await connectToNgrok()
  
  await telegramAdaper.setWebHook(baseUrl + '/integrations/telegram/webhook')
  }

bootstrap();
