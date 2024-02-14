import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { log } from 'console';
import { BlogsQueryRepoPSQL } from '../db-psql/blogs.query.repo.PSQL';
import { Blog } from '../db-psql/entity/blog.entity';

@ValidatorConstraint({ name: 'IsBLogIdExist', async: true })
@Injectable()
export class IsBlogIdAlreadyExistConstraint implements ValidatorConstraintInterface {
  
  constructor(protected blogsQueryRepo: BlogsQueryRepoPSQL) { }
  async validate(value: any): Promise<boolean> {
    const foundBlog: Blog | null =
      await this.blogsQueryRepo.getBlogDBById(value);
    if (!foundBlog) {
      return false;
    }
    return true;
  }
  defaultMessage() {
    return `BlogId not found`;
  }
}

export function IsBLogIdExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsBLogIdExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogIdAlreadyExistConstraint,
    });
  };
}