import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Cuenta } from '../../modules/usuarios/entities/cuenta.entity';

interface RequestWithUser {
  user: Cuenta;
}
export const GetUser = createParamDecorator(
  (data: keyof Cuenta | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);
