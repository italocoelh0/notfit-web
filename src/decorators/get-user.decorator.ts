import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// FIX: The error about 'User' not being an exported member is a symptom of '@prisma/client'
// not being generated correctly. The import itself is correct.
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
