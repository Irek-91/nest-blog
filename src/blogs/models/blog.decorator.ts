import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../blogs.query.repo';
import { BlogDocument } from './blogs-schema';


@Injectable()


// export const User = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
//   },
// );
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

