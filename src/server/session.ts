import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { FamilyRole } from "@/shared/family";
import { ROLE_LABELS, SESSION_COOKIE } from "@/shared/family";

export type FamilySession = {
  role: FamilyRole;
  name: string;
  expiresAt: number;
};

const TWELVE_HOURS_IN_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return "ninho-do-papai-dev-session-secret";
}

function sign(value: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("SESSION_SECRET is required in production.");
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSession(role: FamilyRole): FamilySession {
  return {
    role,
    name: ROLE_LABELS[role],
    expiresAt: Date.now() + TWELVE_HOURS_IN_SECONDS * 1000,
  };
}

export function createSessionToken(session: FamilySession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token?: string): FamilySession | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  try {
    if (!timingSafeStringEqual(signature, sign(payload))) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as FamilySession;

    if (!session.role || !session.name || Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TWELVE_HOURS_IN_SECONDS,
  };
}

export function isSessionConfigured() {
  return Boolean(getSessionSecret());
}
