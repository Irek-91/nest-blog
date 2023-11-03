import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (refreshToken: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return refreshToken ? request.cookies?.[refreshToken] : request.cookies;
  },
);