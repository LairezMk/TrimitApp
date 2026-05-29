import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};
const routes = readFileSync("src/app/routes.ts", "utf8");
const authContext = readFileSync("src/app/contexts/AuthContext.tsx", "utf8");
const authPage = readFileSync("src/app/pages/Auth.tsx", "utf8");
const layout = readFileSync("src/app/components/Layout.tsx", "utf8");
const profilePage = readFileSync("src/app/pages/Profile.tsx", "utf8");
const helpPage = readFileSync("src/app/pages/Help.tsx", "utf8");
const notificationsPage = readFileSync("src/app/pages/Notifications.tsx", "utf8");
const sharingPage = readFileSync("src/app/pages/Sharing.tsx", "utf8");
const helpContent = readFileSync("src/app/help/helpContent.ts", "utf8");
const guideButton = readFileSync("src/app/components/help/PageGuideButton.tsx", "utf8");
const tourOverlay = readFileSync("src/app/components/help/PageTourOverlay.tsx", "utf8");
const reminderEmailsService = readFileSync("src/app/services/reminderEmails.ts", "utf8");
const welcomeOnboarding = readFileSync(
  "src/app/components/onboarding/WelcomeOnboarding.tsx",
  "utf8",
);
const functionsIndex = readFileSync("functions/index.js", "utf8");
const functionsEnvExample = readFileSync("functions/.env.example", "utf8");
const envExample = readFileSync(".env.example", "utf8");
const emailJsTemplate = readFileSync("docs/emailjs-reminder-template.html", "utf8");

assert.equal(packageJson.scripts?.test, "npm run test:unit");
assert.ok(packageJson.scripts?.["test:all"]?.includes("npm run build"));

assert.ok(routes.includes('path: "/auth/action"'), "custom reset action route is registered");
assert.ok(routes.includes("AppErrorBoundary"), "critical routes have an app error boundary");

assert.ok(authContext.includes("sendTrimitPasswordResetEmail"), "frontend uses custom reset email function");
assert.ok(!authContext.includes("sendPasswordResetEmail"), "frontend avoids default Firebase reset email");
assert.ok(functionsIndex.includes("/auth/action"), "password reset email points to app action route");
assert.ok(functionsIndex.includes("handleCodeInApp: true"), "password reset uses in-app action handling");
assert.ok(functionsIndex.includes("Restablece tu acceso a Trimit"), "password reset subject is Spanish");

assert.ok(layout.includes("WelcomeOnboarding"), "authenticated layout renders welcome onboarding");
assert.ok(
  !authPage.includes("detectSubscriptionsFromGmail"),
  "Google login does not scan before the welcome message",
);
assert.ok(
  authPage.includes("saveRecentGmailAccessToken"),
  "Google login hands off the fresh Gmail token to onboarding",
);
assert.ok(
  welcomeOnboarding.includes("consumeRecentGmailAccessToken"),
  "welcome onboarding reuses the fresh Google login token before opening auth",
);
assert.ok(
  welcomeOnboarding.includes("trimitWelcomeShownAt"),
  "welcome onboarding stores a one-time profile flag",
);
assert.ok(
  welcomeOnboarding.includes('navigate("/subscriptions/gmail-confirmation")'),
  "welcome onboarding shows detected Gmail subscriptions after scanning",
);
assert.ok(!profilePage.includes("URL de foto"), "profile avoids exposing raw photo URLs");
assert.ok(routes.includes('path: "/reminders"'), "legacy reminders route remains handled");
assert.ok(
  routes.includes('loader: () => redirect("/notifications")'),
  "reminders route redirects to unified notifications page",
);
assert.ok(
  !layout.includes('label: "Recordatorios"'),
  "sidebar does not show a separate reminders page",
);
assert.ok(
  notificationsPage.includes("Próximos pagos y recordatorios"),
  "notifications page includes reminder management",
);
assert.ok(helpPage.includes("mailto:trimitcol@gmail.com"), "help email opens the requested mailbox");
assert.ok(!helpPage.includes("Llamar Soporte"), "help page removes support call action");
assert.ok(layout.includes("data-tour-page"), "layout exposes a safe tour fallback target");
assert.ok(
  guideButton.includes("getGuideForPath") && guideButton.includes("Boolean(getGuideForPath"),
  "floating guide button only appears when a guide can be resolved",
);
assert.ok(
  tourOverlay.includes("[data-tour-page]") && !tourOverlay.includes("!isSmallViewport &&"),
  "tour overlay has fallback highlighting and works on small viewports",
);
assert.ok(
  helpContent.includes('route: "/sharing"') &&
    sharingPage.includes('data-tour="sharing-create"') &&
    sharingPage.includes('data-tour="sharing-groups"'),
  "sharing page has a contextual tour with concrete highlight targets",
);
assert.ok(
  helpContent.includes('selector: "[data-tour=\\\'notifications-reminders\\\']"') ||
    helpContent.includes('selector: "[data-tour=\'notifications-reminders\']"'),
  "notifications guide uses concrete reminder targets",
);
assert.ok(
  functionsIndex.includes("getReminderSendPlan") && functionsIndex.includes("emailMode"),
  "scheduled email reminders support per-reminder email modes",
);
assert.ok(
  functionsIndex.includes("sendReminderEmailNow") &&
    functionsIndex.includes("manual_reminder_email_test"),
  "backend exposes a callable manual reminder email sender",
);
assert.ok(
  functionsIndex.includes("List-Unsubscribe") &&
    functionsIndex.includes("Prueba de recordatorio Trimit"),
  "reminder emails include deliverability headers and a Trimit-branded Spanish template",
);
assert.ok(
  reminderEmailsService.includes("httpsCallable") &&
    reminderEmailsService.includes("sendReminderEmailNow"),
  "frontend has a callable service for manual reminder email checks",
);
assert.ok(
  reminderEmailsService.includes("api.emailjs.com/api/v1.0/email/send") &&
    reminderEmailsService.includes("VITE_EMAILJS_PUBLIC_KEY"),
  "frontend can send reminder emails through EmailJS without Firebase Functions",
);
assert.ok(
  notificationsPage.includes("Enviar correo") &&
    notificationsPage.includes("handleSendReminderEmailNow"),
  "notifications page can send a reminder email from a button",
);
assert.ok(
  notificationsPage.includes("createUserEmailReminderEvent") &&
    notificationsPage.includes('provider: "emailjs"'),
  "EmailJS reminder sends are recorded in the reminder email history",
);
assert.ok(
  functionsEnvExample.includes("TRIMIT_SMTP_HOST") &&
    functionsEnvExample.includes("firebase functions:secrets:set TRIMIT_SMTP_PASS"),
  "functions env example documents SMTP params and the password secret",
);
assert.ok(
  emailJsTemplate.includes("{{to_email}}") &&
    emailJsTemplate.includes("Recordatorio de pago") &&
    !emailJsTemplate.includes("box-shadow"),
  "EmailJS template documents a simple transactional reminder email",
);
assert.ok(
  reminderEmailsService.includes("Recordatorio de pago -") &&
    reminderEmailsService.includes("Pago programado para"),
  "EmailJS reminder subject and preheader are neutral and transactional",
);

for (const requiredKey of [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_GOOGLE_OAUTH_CLIENT_ID",
  "VITE_MICROSOFT_CLIENT_ID",
  "VITE_EMAILJS_SERVICE_ID",
  "VITE_EMAILJS_TEMPLATE_ID",
  "VITE_EMAILJS_PUBLIC_KEY",
]) {
  assert.ok(envExample.includes(requiredKey), `.env.example documents ${requiredKey}`);
}
