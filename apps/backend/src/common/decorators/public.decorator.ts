/**
 * Public Decorator
 * Marks routes as publicly accessible (skips auth guards).
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/*
 * Mark a route as public -skips JWT authentication.
 * Usage: @Public() on any controller method
 */

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
