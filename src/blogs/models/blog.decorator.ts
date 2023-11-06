import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs.query.repo';
import { log } from 'console';
import { BlogDocument } from './blogs-schema';


@ValidatorConstraint({ name: 'IsBLogIdExist', async: true })
@Injectable()
export class IsBlogIdAlreadyExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepository) { }
  async validate(value: any): Promise<boolean> {
    const foundBlog: BlogDocument | null =
      await BlogsQueryRepository.prototype.getByBlogId(value);
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
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogIdAlreadyExistConstraint,
    });
  };
}