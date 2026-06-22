import { NextResponse } from "next/server";
import { createLiveKitJoinToken, getLiveKitConfig } from "@/server/livekit";
import { getCurrentSession } from "@/server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { message: "Sessão expirada. Entre novamente." },
      { status: 401 },
    );
  }

  const config = getLiveKitConfig();

  if (config.hasInvalidUrl) {
    return NextResponse.json(
      {
        message:
          "LIVEKIT_URL está inválida. Use a URL WebSocket do projeto, começando com wss://, não a URL do painel cloud.livekit.io.",
      },
      { status: 503 },
    );
  }

  if (!config.isConfigured) {
    return NextResponse.json(
      {
        message:
          "LIVEKIT_URL, LIVEKIT_API_KEY e LIVEKIT_API_SECRET ainda não foram configurados.",
      },
      { status: 503 },
    );
  }

  const credentials = await createLiveKitJoinToken(session);

  if (!credentials) {
    return NextResponse.json(
      { message: "Não foi possível criar o token da sala." },
      { status: 500 },
    );
  }

  return NextResponse.json(credentials);
}
