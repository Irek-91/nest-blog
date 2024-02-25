import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validate as isValidUUID } from 'uuid';
import { log } from 'console';

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
  transform(value: any, metadata: ArgumentMetadata) {
    const regex = /\d+x\d+/;
    const res = value.originalname.match(regex)

    const oneKb = 102400;
    const correctFormat = ['image/jpeg', 'image/png']
    const correctSize = ['156x156']
    
    const result = correctFormat.includes(value.mimetype)

    if (result === false) {
      throw new BadRequestException([
        { message: 'Invalid image format. Supported formats: JPEG, PNG', field: 'file' },
      ]);
    }

    if (value.size > oneKb) {
      throw new BadRequestException([
        { message: 'Maximum file size allowed is 100 KB', field: 'file' },
      ]);
    }
    return value
  }
}

@Injectable()
export class FileWallpaperValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const regex = /\d+x\d+/;
    const res = value.originalname.match(regex)

    if (res[0] !== '1028x312') {
      throw new BadRequestException([
        { message: 'Wallpaper format incorrect', field: 'file' },
      ]);
    }
    return value
  }
}

@Injectable()
export class FileMainValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const regex = /\d+x\d+/;
    const res = value.originalname.match(regex)

    if (res[0] !== '156x156') {
      throw new BadRequestException([
        { message: 'Main format incorrect', field: 'file' },
      ]);
    }
    return value
  }
}

@Injectable()
export class PostImageValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const regex = /\d+x\d+/;
    const res = value.originalname.match(regex)

    if (res[0] !== '940x432') {
      throw new BadRequestException([
        { message: 'Post image format incorrect', field: 'file' },
      ]);
    }
    return value
  }
}
