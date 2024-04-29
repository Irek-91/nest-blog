import { TelegramAdapter } from './infrastructure/adapters/telegram-adapter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './app.settings';
import * as ngrok from 'ngrok';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function connectToNgrok() {
  const url = await ngrok.connect(3000);
  console.log(url);
  return url;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const telegramAdaper = await app.resolve(TelegramAdapter);

  const config = new DocumentBuilder()
    .setTitle(
      'Documentation for applications based on the Nest(NestJS) framework',
    )
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('Blog_Platform')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  appSettings(app);
  await app.listen(3000);
  console.log('App started port 3000');
  const baseUrl = await connectToNgrok();

  await telegramAdaper.setWebHook(baseUrl + '/integrations/telegram/webhook');
}

bootstrap();
