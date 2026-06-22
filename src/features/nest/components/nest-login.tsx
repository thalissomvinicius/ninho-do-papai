"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Baby,
  Bird,
  Flower2,
  Heart,
  LockKeyhole,
  ShieldCheck,
  Video,
} from "lucide-react";
import { FAMILY, type FamilyRole, ROLE_LABELS } from "@/shared/family";
import { GardenDecorations } from "./decorations";

const roles: FamilyRole[] = ["papai", "vanessa"];

type NestLoginProps = {
  hasSession: boolean;
  sessionName?: string;
};

export function NestLogin({ hasSession, sessionName }: NestLoginProps) {
  const router = useRouter();
  const [role, setRole] = useState<FamilyRole>("vanessa");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, pin }),
    });

    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!response.ok) {
      setMessage(payload?.message ?? "Não consegui abrir o ninho agora.");
      setIsSubmitting(false);
      return;
    }

    router.push("/ninho");
    router.refresh();
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f8fcf4] text-slate-900">
      <GardenDecorations />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="max-w-2xl py-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/78 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Privado, ao vivo e sem gravação
            </div>

            <h1 className="text-5xl font-black leading-tight text-[#263a2e] sm:text-6xl lg:text-7xl">
              {FAMILY.appName}
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-8 text-slate-700">
              Um cantinho seguro para o Papai, a Vanessa e a Ágatha se verem
              quando a saudade bater.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              <MiniInfo label="Sala" value={FAMILY.roomDisplayName} icon={Flower2} />
              <MiniInfo label="Família" value="Vanessa e Ágatha" icon={Heart} />
              <MiniInfo label="Chamada" value="Câmera e voz" icon={Video} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/90 bg-white/86 p-5 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-emerald-700">
                  Entrada
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Abrir o ninho
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <Bird className="h-7 w-7" />
              </div>
            </div>

            {hasSession ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
                <p>{sessionName} já está com o ninho aberto neste navegador.</p>
                <button
                  type="button"
                  onClick={() => router.push("/ninho")}
                  className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 font-black text-white transition hover:bg-emerald-800"
                >
                  <Video className="h-4 w-4" />
                  Ir para o ninho
                </button>
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Quem está entrando
                </label>
                <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  {roles.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                        role === item
                          ? "bg-white text-emerald-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {ROLE_LABELS[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-bold text-slate-700"
                  htmlFor="pin"
                >
                  PIN familiar
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="pin"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-lg font-black text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="0426"
                  />
                </div>
              </div>

              {message ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || pin.length < 3}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#24533f] px-5 text-base font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#1d4434] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <Video className="h-5 w-5" />
                {isSubmitting ? "Abrindo..." : "Entrar no ninho"}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              <Baby className="h-5 w-5 shrink-0" />
              <span>
                O acesso só começa quando cada pessoa permite câmera e microfone.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniInfo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Flower2;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
      <Icon className="mb-3 h-6 w-6 text-rose-500" />
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
