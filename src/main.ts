import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: any = [];
        errors.forEach((e) => {
          const constraintKeys = Object.keys(e.constraints!)
          constraintKeys.forEach((ckey) => {
            errorsForResponse.push({
              message: e.constraints![ckey],
              field: e.property,
            });
          })
        })
        throw new BadRequestException(errorsForResponse)
      }
    })
  );


  app.useGlobalFilters( new HttpExceptionFilter())
  // const config = new DocumentBuilder()
  //   .setTitle('Nest-blog example')
  //   .setDescription('The cats API description')
  //   .setVersion('1.0')
  //   .addTag('swagger')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
