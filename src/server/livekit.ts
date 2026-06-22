import { randomUUID } from "node:crypto";
import { AccessToken } from "livekit-server-sdk";
import { FAMILY } from "@/shared/family";
import type { FamilySession } from "@/server/session";

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  return {
    url,
    apiKey,
    apiSecret,
    isConfigured: Boolean(url && apiKey && apiSecret),
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
