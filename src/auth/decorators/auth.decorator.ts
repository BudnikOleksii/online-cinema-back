import { applyDecorators, UseGuards } from '@nestjs/common';

import { TypeRole } from '../auth.interface';
import { JwtGuard } from '../guards/jwt.guard';
import { AdminGuard } from '../guards/admin.guard';

export const Auth = (role: TypeRole = 'user') => {
  return applyDecorators(role === 'admin' ? UseGuards(JwtGuard, AdminGuard) : UseGuards(JwtGuard));
};
