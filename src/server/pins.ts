import { timingSafeEqual } from "node:crypto";
import type { FamilyRole } from "@/shared/family";

export const DEV_PIN = "0426";

function getFallbackPin() {
  if (process.env.FAMILY_PIN) {
    return process.env.FAMILY_PIN;
  }

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return DEV_PIN;
}

export function getPinForRole(role: FamilyRole) {
  const fallbackPin = getFallbackPin();

  if (role === "papai") {
    return process.env.PAPAI_PIN || fallbackPin;
  }

  return process.env.VANESSA_PIN || fallbackPin;
}

export function isPinConfigured() {
  return Boolean(getFallbackPin());
}

export function isMatchingPin(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}
