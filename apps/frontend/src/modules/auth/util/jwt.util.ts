export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(json) as JwtPayload;

    if (!payload.sub || !payload.name || !payload.email) return null;

    return payload;
  } catch {
    return null;
  }
}
