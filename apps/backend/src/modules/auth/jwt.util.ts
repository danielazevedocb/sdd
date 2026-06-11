import { sign } from 'jsonwebtoken';

export function signUserToken(
  user: { id: string; name: string; email: string },
  secret: string,
): string {
  return sign(
    { sub: user.id, name: user.name, email: user.email },
    secret,
    { expiresIn: '14d' },
  );
}
