import { registerAs } from '@nestjs/config';
export default registerAs('jwt', () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return {
    secret: process.env.JWT_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  };
});
