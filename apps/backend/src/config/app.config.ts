import { registerAs } from '@nestjs/config';
export default registerAs('app', () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return {
    port: Number(process.env.PORT || 3001), env: process.env.NODE_ENV || 'development',
    frontendUrl,
    corsOrigins: Array.from(new Set([frontendUrl, ...(process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)])),
  };
});
