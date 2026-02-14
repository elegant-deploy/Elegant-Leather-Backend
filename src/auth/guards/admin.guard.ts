import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.DEPT_ADMIN);
  }
}