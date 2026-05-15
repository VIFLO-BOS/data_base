/**
 * JWT Configuration
 */
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '3600s',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
