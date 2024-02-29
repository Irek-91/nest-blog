import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validate as isValidUUID } from 'uuid';
import { log } from 'console';
import sharp from 'sharp';

@Injectable()
export class PipeisValidUUID implements PipeTransform<any> {
  async transform(value: string) {

    if (!isValidUUID(value)) {
      throw new BadRequestException([
        { message: 'If id has invalid format', field: 'paramId' },
      ]);
    }
    return value;
  }

}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    try {
      const { size, format } = await sharp(value.buffer).metadata();
      const oneKb = 102400;
      const correctFormat = ['jpeg', 'png']

      const result = correctFormat.includes(format!)

      if (result === false) {
        throw new BadRequestException([
          { message: 'Invalid image format. Supported formats: JPEG, PNG', field: 'file' },
        ]);
      }

      if (size! > oneKb) {
        throw new BadRequestException([
          { message: 'Maximum file size allowed is 100 KB', field: 'file' },
        ]);
      }
      return value

    } catch (e) {
      throw new BadRequestException([
        { message: 'File incorrect format', field: 'file' },
      ]);
    }

  }
}

@Injectable()
export class FileWallpaperValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    const { width, height } = await sharp(value.buffer).metadata();

    if (width !== 1028 || height !== 312) {
      throw new BadRequestException([
        { message: 'Wallpaper format incorrect', field: 'file' },
      ]);
    }
    return value
  }
}

@Injectable()
export class FileMainValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    const { width, height } = await sharp(value.buffer).metadata();
    if (width !== 156 || height !== 156) {
      throw new BadRequestException([
        { message: 'Main format incorrect', field: 'file' },
      ]);
    }
    return value
  }
}

@Injectable()
export class PostImageValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    const { width, height } = await sharp(value.buffer).metadata();

    if (width !== 940 || height !== 432) {
      throw new BadRequestException([
        { message: 'Post image format incorrect', field: 'file' },
      ]);
    }
    return value
  }
}
