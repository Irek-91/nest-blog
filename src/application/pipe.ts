import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class CustomPipe implements PipeTransform<any> {
  async transform(value: string) {
    
    if (!isValidUUID(value)) {
        throw new BadRequestException([
            { message: 'If id has invalid format', field: 'paramId' },
        ]);
    }
    return value;
  }

}