import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BlogsQueryRepository } from '../blogs.query.repo';
import { log } from 'console';

@ValidatorConstraint({ async: true })
export class IsBlogIdAlreadyExistConstraint implements ValidatorConstraintInterface {
  validate(blogId: any, args: ValidationArguments) {
    return  BlogsQueryRepository.prototype.getByBlogId(blogId).then(user => {
      if (!user) return false;
      return true;
    });
  }
}

export function IsUserAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogIdAlreadyExistConstraint,
    });
  };
}