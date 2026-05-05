/**
 * JWT Utilities
 */
export function generateTokenPayload(userId: string, roles: string[], permissions: string[]) {
  return {
    sub: userId,
    roles,
    permissions,
    iat: Date.now(),
  };
}
