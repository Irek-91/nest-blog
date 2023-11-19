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

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  appSettings(app)
  await app.listen(3000);
  console.log('App started port 3000')
}

bootstrap();
