import crypto from "node:crypto";

export function generateRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRandomPassword() {
  return crypto.randomBytes(8).toString("base64url");
}
