import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs.query.repo';
import { BlogDocument } from './blogs-schema';

@ValidatorConstraint({ name: 'ValidateBlog', async: true })

@Injectable()
export class ValidateBlogConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepository) {}

  async validate(value: any): Promise<boolean> {
    const foundBlog: BlogDocument | null =
      await this.blogsQueryRepo.getByBlogId(value);
    if (!foundBlog) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return `Blog with provided id does not exist`;
  }
}

export function ValidateBlog(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ValidateBlogConstraint,
    });
  };
}