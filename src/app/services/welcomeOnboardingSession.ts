const WELCOME_ONBOARDING_PENDING_KEY = "trimit:welcome-onboarding-pending";

function readPendingMap() {
  try {
    const raw = sessionStorage.getItem(WELCOME_ONBOARDING_PENDING_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePendingMap(map: Record<string, boolean>) {
  sessionStorage.setItem(WELCOME_ONBOARDING_PENDING_KEY, JSON.stringify(map));
}

export function markWelcomeOnboardingPending(uid: string) {
  writePendingMap({ ...readPendingMap(), [uid]: true });
}

export function hasWelcomeOnboardingPending(uid: string) {
  return Boolean(readPendingMap()[uid]);
}

export function clearWelcomeOnboardingPending(uid: string) {
  const pending = readPendingMap();
  delete pending[uid];
  writePendingMap(pending);
}
