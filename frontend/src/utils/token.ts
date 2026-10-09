interface JwtPayload {
  exp?: number;
}

export function getTokenExpiration(token: string): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(atob(base64)) as JwtPayload;

    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }

    // JWT expiration is in seconds.
    // JavaScript timestamps use milliseconds.
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);

  if (expiration === null) {
    return true;
  }

  return Date.now() >= expiration;
}
