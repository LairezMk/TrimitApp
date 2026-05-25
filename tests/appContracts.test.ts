import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};
const routes = readFileSync("src/app/routes.ts", "utf8");
const authContext = readFileSync("src/app/contexts/AuthContext.tsx", "utf8");
const envExample = readFileSync(".env.example", "utf8");

assert.equal(packageJson.scripts?.test, "npm run test:unit");
assert.ok(packageJson.scripts?.["test:all"]?.includes("npm run build"));

assert.ok(routes.includes('path: "/auth/action"'), "custom reset action route is registered");
assert.ok(routes.includes("AppErrorBoundary"), "critical routes have an app error boundary");

assert.ok(authContext.includes("/auth/action"), "password reset email points to app action route");
assert.ok(authContext.includes("handleCodeInApp: true"), "password reset uses in-app action handling");

for (const requiredKey of [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_GOOGLE_OAUTH_CLIENT_ID",
  "VITE_MICROSOFT_CLIENT_ID",
]) {
  assert.ok(envExample.includes(requiredKey), `.env.example documents ${requiredKey}`);
}
