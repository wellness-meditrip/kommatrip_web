export interface JwtPayload {
  exp?: number;
  nonce?: string;
  type?: string;
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  if (typeof atob === 'function') {
    return atob(padded);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('binary');
  }
  throw new Error('Base64 decoder is unavailable');
};

export const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = decodeBase64Url(payload);
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiry = (token: string): number | null => {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp;
};

export const isTokenExpired = (token: string, skewSeconds = 0): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return expiry <= nowInSeconds + skewSeconds;
};

export const isUsableAccessToken = (
  token: string | null | undefined,
  skewSeconds = 10
): boolean => {
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  const isAccessType = !payload.type || payload.type === 'access';
  return isAccessType && !isTokenExpired(token, skewSeconds);
};
