"use client";

import "@livekit/components-styles";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  StartAudio,
  useCreateLayoutContext,
  useChat,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import {
  Baby,
  Bird,
  Flower2,
  Heart,
  HeartHandshake,
  LogOut,
  Monitor,
  Moon,
  Power,
  Send,
  ShieldCheck,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";
import { FAMILY, type FamilyRole } from "@/shared/family";
import { GardenDecorations } from "./decorations";

type TokenPayload = {
  token: string;
  url: string;
  roomName: string;
  identity: string;
  name: string;
  role: FamilyRole;
};

type NestRoomProps = {
  role: FamilyRole;
  name: string;
};

const quickMessages = [
  { label: "Oi Papai", icon: HeartHandshake },
  { label: "Beijinho", icon: Heart },
  { label: "Boa noite", icon: Moon },
  { label: "Estou aqui", icon: Baby },
];

export function NestRoom({ role, name }: NestRoomProps) {
  const router = useRouter();
  const [payload, setPayload] = useState<TokenPayload | null>(null);
  const [error, setError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadToken() {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/livekit-token", { method: "POST" });
      const data = (await response.json().catch(() => null)) as
        | TokenPayload
        | { message?: string }
        | null;

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        setError(
          data && "message" in data && data.message
            ? data.message
            : "Não consegui preparar a chamada.",
        );
        setIsLoading(false);
        return;
      }

      setPayload(data as TokenPayload);
      setIsLoading(false);
    }

    loadToken();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return (
      <RoomStateShell
        title="Preparando o ninho"
        description="A sala está sendo aberta."
      />
    );
  }

  if (error || !payload) {
    return (
      <RoomStateShell
        title="Falta configurar a chamada"
        description={error || "Confira as variáveis LIVEKIT no Vercel."}
        action={
          <button
            onClick={() => router.refresh()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#24533f] px-5 font-black text-white"
          >
            <Power className="h-5 w-5" />
            Tentar de novo
          </button>
        }
      />
    );
  }

  if (!isLiveKitUrl(payload.url)) {
    return (
      <RoomStateShell
        title="URL do LiveKit inválida"
        description="No Vercel, LIVEKIT_URL precisa ser a URL WebSocket do projeto LiveKit, começando com wss://."
        action={<BackToStartButton onClick={handleLogout} />}
      />
    );
  }

  if (roomError) {
    return (
      <RoomStateShell
        title="A chamada não abriu"
        description={roomError}
        action={<BackToStartButton onClick={handleLogout} />}
      />
    );
  }

  return (
    <LiveKitRoom
      audio
      video
      connect
      token={payload.token}
      serverUrl={payload.url}
      onDisconnected={() => router.push("/")}
      onError={(liveKitError) =>
        setRoomError(
          liveKitError.message ||
            "Confira LIVEKIT_URL, LIVEKIT_API_KEY e LIVEKIT_API_SECRET no Vercel.",
        )
      }
      className="ninho-livekit"
      data-lk-theme="default"
    >
      <RoomAudioRenderer />
      <StartAudio label="Ouvir áudio" className="ninho-start-audio" />
      <CallSurface name={name} role={role} onLogout={handleLogout} />
    </LiveKitRoom>
  );
}

function isLiveKitUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "wss:" || parsed.protocol === "ws:";
  } catch {
    return false;
  }
}

function BackToStartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#24533f] px-5 font-black text-white"
    >
      <Power className="h-5 w-5" />
      Voltar para entrada
    </button>
  );
}

function RoomStateShell({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f8fcf4] text-slate-900">
      <GardenDecorations />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-5">
        <section className="rounded-[2rem] border border-white/90 bg-white/88 p-8 text-center shadow-2xl shadow-emerald-900/10 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600">
            <Bird className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-950">{title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-base font-semibold leading-7 text-slate-600">
            {description}
          </p>
          {action ? <div className="mt-6">{action}</div> : null}
        </section>
      </div>
    </main>
  );
}

function CallSurface({
  role,
  name,
  onLogout,
}: {
  role: FamilyRole;
  name: string;
  onLogout: () => void;
}) {
  const participants = useParticipants();
  const connectionState = useConnectionState();
  const layoutContext = useCreateLayoutContext();
  const { isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();

  const status = useMemo(() => {
    if (connectionState === ConnectionState.Connected) {
      return {
        label: "Ao vivo",
        icon: Wifi,
        tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    }

    if (connectionState === ConnectionState.Reconnecting) {
      return {
        label: "Reconectando",
        icon: WifiOff,
        tone: "text-amber-800 bg-amber-50 border-amber-200",
      };
    }

    return {
      label: "Conectando",
      icon: Wifi,
      tone: "text-sky-800 bg-sky-50 border-sky-200",
    };
  }, [connectionState]);

  const StatusIcon = status.icon;

  return (
    <LayoutContextProvider value={layoutContext}>
      <main className="relative min-h-dvh overflow-hidden bg-[#f8fcf4] text-slate-900">
        <GardenDecorations />
        <div className="relative z-10 flex min-h-dvh flex-col">
          <header className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-rose-600 shadow-sm">
                <Flower2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-black uppercase text-emerald-700">
                  {FAMILY.appName}
                </p>
                <h1 className="text-2xl font-black text-[#263a2e]">
                  {FAMILY.roomDisplayName}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-sm font-black ${status.tone}`}
              >
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </span>
              <span className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-4 text-sm font-black text-slate-700">
                <Video className="h-4 w-4" />
                {participants.length} na sala
              </span>
              <button
                onClick={onLogout}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-rose-200 bg-white/86 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </header>

          <section className="grid flex-1 gap-4 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-h-[520px] flex-col overflow-hidden rounded-[1.8rem] border border-white/90 bg-white/68 p-3 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl">
              <FamilyVideoGrid />
              <div className="mt-3 rounded-[1.4rem] border border-white/90 bg-white/90 p-2 shadow-sm">
                <ControlBar
                  saveUserChoices
                  controls={{
                    microphone: true,
                    camera: true,
                    screenShare: false,
                    chat: false,
                    settings: true,
                    leave: true,
                  }}
                />
              </div>
            </div>

            <aside className="grid content-start gap-4">
              <StatusPanel
                name={name}
                role={role}
                isCameraEnabled={isCameraEnabled}
                isMicrophoneEnabled={isMicrophoneEnabled}
              />
              <WakeLockPanel />
              <AffectionPanel />
            </aside>
          </section>
        </div>
      </main>
    </LayoutContextProvider>
  );
}

function FamilyVideoGrid() {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  );

  return (
    <div className="ninho-video-grid min-h-0 flex-1 overflow-hidden rounded-[1.35rem] bg-[#1c2d25]">
      <GridLayout tracks={tracks} className="h-full">
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}

function StatusPanel({
  name,
  role,
  isCameraEnabled,
  isMicrophoneEnabled,
}: {
  name: string;
  role: FamilyRole;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/90 bg-white/84 p-5 shadow-lg shadow-emerald-900/10 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-emerald-700">
            Presença
          </p>
          <h2 className="text-xl font-black text-slate-950">{name}</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          {role === "papai" ? (
            <Monitor className="h-6 w-6" />
          ) : (
            <Baby className="h-6 w-6" />
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <MediaPill
          active={isCameraEnabled}
          label={isCameraEnabled ? "Câmera ligada" : "Câmera pausada"}
        />
        <MediaPill
          active={isMicrophoneEnabled}
          label={isMicrophoneEnabled ? "Microfone ligado" : "Microfone mudo"}
        />
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <span>Sem gravação. Cada câmera só liga com permissão do navegador.</span>
      </div>
    </section>
  );
}

function MediaPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`flex h-11 items-center justify-between rounded-2xl border px-4 text-sm font-black ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <span>{label}</span>
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
    </div>
  );
}

function WakeLockPanel() {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const isSupported =
    typeof navigator !== "undefined" && "wakeLock" in navigator;

  async function toggleWakeLock() {
    if (!isSupported) {
      return;
    }

    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsLocked(false);
      return;
    }

    try {
      const lock = await navigator.wakeLock.request("screen");
      setWakeLock(lock);
      setIsLocked(true);
      lock.addEventListener("release", () => {
        setWakeLock(null);
        setIsLocked(false);
      });
    } catch {
      setIsLocked(false);
    }
  }

  useEffect(() => {
    return () => {
      wakeLock?.release().catch(() => undefined);
    };
  }, [wakeLock]);

  return (
    <section className="rounded-[1.5rem] border border-white/90 bg-white/84 p-5 shadow-lg shadow-emerald-900/10 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-emerald-700">
            Notebook
          </p>
          <h2 className="text-xl font-black text-slate-950">
            {isLocked ? "Mantendo ligado" : "Manter acordado"}
          </h2>
        </div>
        <button
          onClick={toggleWakeLock}
          disabled={!isSupported}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
            isLocked
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:text-slate-300"
          }`}
          title="Manter a tela acordada"
        >
          <Power className="h-6 w-6" />
        </button>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
        {isSupported
          ? "Use no notebook do Papai para reduzir pausas enquanto a chamada fica aberta."
          : "Este navegador não liberou o modo de tela acordada."}
      </p>
    </section>
  );
}

function AffectionPanel() {
  const { chatMessages, send, isSending } = useChat();
  const [customMessage, setCustomMessage] = useState("");

  async function sendMessage(message: string) {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    await send(trimmed);
    setCustomMessage("");
  }

  return (
    <section className="rounded-[1.5rem] border border-white/90 bg-white/84 p-5 shadow-lg shadow-emerald-900/10 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-emerald-700">
            Carinho
          </p>
          <h2 className="text-xl font-black text-slate-950">Mensagens</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <Heart className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickMessages.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => sendMessage(label)}
            disabled={isSending}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 text-sm font-black text-rose-800 transition hover:bg-rose-100 disabled:opacity-60"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(customMessage);
        }}
      >
        <input
          value={customMessage}
          onChange={(event) => setCustomMessage(event.target.value)}
          className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          placeholder="Mensagem"
        />
        <button
          type="submit"
          disabled={isSending || !customMessage.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#24533f] text-white transition hover:bg-[#1d4434] disabled:bg-slate-300"
          title="Enviar"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      <div className="mt-4 max-h-44 space-y-2 overflow-y-auto pr-1">
        {chatMessages.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
            O carinho aparece aqui.
          </div>
        ) : (
          chatMessages.slice(-5).map((message) => (
            <div
              key={`${message.timestamp}-${message.from?.identity ?? "local"}`}
              className="rounded-2xl bg-slate-50 px-4 py-3"
            >
              <p className="text-xs font-black uppercase text-slate-400">
                {message.from?.name ?? "Família"}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {message.message}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
