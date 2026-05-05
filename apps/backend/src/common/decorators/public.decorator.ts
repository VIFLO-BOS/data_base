/**
 * Public Decorator
 * Marks routes as publicly accessible (skips auth guards).
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
