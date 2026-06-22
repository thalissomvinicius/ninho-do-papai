import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE } from "@/shared/family";
import {
  createSession,
  createSessionToken,
  getSessionCookieOptions,
  isSessionConfigured,
} from "@/server/session";
import { getPinForRole, isMatchingPin, isPinConfigured } from "@/server/pins";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  role: z.enum(["papai", "vanessa"]),
  pin: z.string().min(3).max(32),
});

export async function POST(request: Request) {
  if (!isSessionConfigured()) {
    return NextResponse.json(
      { message: "Configure SESSION_SECRET no ambiente antes de publicar." },
      { status: 503 },
    );
  }

  if (!isPinConfigured()) {
    return NextResponse.json(
      { message: "Configure FAMILY_PIN no ambiente antes de publicar." },
      { status: 503 },
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de entrada inválidos." },
      { status: 400 },
    );
  }

  const expectedPin = getPinForRole(parsed.data.role);

  if (!expectedPin || !isMatchingPin(parsed.data.pin, expectedPin)) {
    return NextResponse.json(
      { message: "PIN não conferiu." },
      { status: 401 },
    );
  }

  const session = createSession(parsed.data.role);
  const response = NextResponse.json({ session });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(session),
    getSessionCookieOptions(),
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
