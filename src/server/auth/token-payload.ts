const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const resolvePayload = <T = unknown>(data: unknown): T => {
  if (isRecord(data) && 'response' in data) {
    return (data as { response: T }).response;
  }
  return data as T;
};

export const extractRefreshToken = (payload: unknown): string | null => {
  if (!isRecord(payload)) return null;
  const tokens = payload.tokens;
  if (!isRecord(tokens)) return null;
  const refreshToken = tokens.refresh_token;
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) return null;
  return refreshToken;
};

export const sanitizeTokenPayload = (payload: unknown): unknown => {
  if (!isRecord(payload)) return payload;
  const tokens = payload.tokens;
  if (!isRecord(tokens)) return payload;

  const safeTokens = Object.fromEntries(
    Object.entries(tokens).filter(([key]) => key !== 'refresh_token')
  );

  return {
    ...payload,
    tokens: safeTokens,
  };
};
