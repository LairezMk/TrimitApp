const GMAIL_ACCESS_TOKEN_KEY = "trimit:gmail-access-token";
const TOKEN_MAX_AGE_MS = 50 * 60 * 1000;

interface StoredGmailAccessToken {
  token: string;
  storedAt: number;
}

export function saveRecentGmailAccessToken(token: string | null | undefined) {
  if (!token) {
    return;
  }

  sessionStorage.setItem(
    GMAIL_ACCESS_TOKEN_KEY,
    JSON.stringify({ token, storedAt: Date.now() } satisfies StoredGmailAccessToken),
  );
}

export function consumeRecentGmailAccessToken() {
  const raw = sessionStorage.getItem(GMAIL_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(GMAIL_ACCESS_TOKEN_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredGmailAccessToken>;
    if (!parsed.token || !parsed.storedAt) {
      return null;
    }

    if (Date.now() - parsed.storedAt > TOKEN_MAX_AGE_MS) {
      return null;
    }

    return parsed.token;
  } catch {
    return null;
  }
}
