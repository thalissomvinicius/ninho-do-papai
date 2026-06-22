import { randomUUID } from "node:crypto";
import { AccessToken } from "livekit-server-sdk";
import { FAMILY } from "@/shared/family";
import type { FamilySession } from "@/server/session";

export function normalizeLiveKitUrl(rawUrl?: string) {
  if (!rawUrl) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl.trim());

    if (parsed.hostname === "cloud.livekit.io") {
      return null;
    }

    if (parsed.protocol === "https:") {
      parsed.protocol = "wss:";
    }

    if (parsed.protocol === "http:") {
      parsed.protocol = "ws:";
    }

    if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:") {
      return null;
    }

    parsed.pathname = "";
    parsed.search = "";
    parsed.hash = "";

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getLiveKitConfig() {
  const rawUrl = process.env.LIVEKIT_URL;
  const url = normalizeLiveKitUrl(rawUrl);
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  return {
    rawUrl,
    url,
    apiKey,
    apiSecret,
    isConfigured: Boolean(url && apiKey && apiSecret),
    hasInvalidUrl: Boolean(rawUrl && !url),
  };
}

export async function createLiveKitJoinToken(session: FamilySession) {
  const { apiKey, apiSecret, url, isConfigured } = getLiveKitConfig();

  if (!isConfigured || !apiKey || !apiSecret || !url) {
    return null;
  }

  const identity = `${session.role}-${randomUUID()}`;
  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name: session.name,
    ttl: "12h",
    metadata: JSON.stringify({
      role: session.role,
      familyRoom: FAMILY.roomDisplayName,
    }),
    attributes: {
      role: session.role,
      familyName: session.name,
    },
  });

  token.addGrant({
    room: FAMILY.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return {
    token: await token.toJwt(),
    url,
    roomName: FAMILY.roomName,
    identity,
    name: session.name,
    role: session.role,
  };
}
