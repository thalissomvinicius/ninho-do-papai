"use client";

import { Bird, Power } from "lucide-react";
import { GardenDecorations } from "@/features/nest/components/decorations";

export default function NinhoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f8fcf4] text-slate-900">
      <GardenDecorations />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-5">
        <section className="rounded-[2rem] border border-white/90 bg-white/88 p-8 text-center shadow-2xl shadow-emerald-900/10 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600">
            <Bird className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-950">
            A chamada não abriu
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base font-semibold leading-7 text-slate-600">
            Confira as variáveis do LiveKit no Vercel e tente novamente.
          </p>
          {error.message ? (
            <p className="mx-auto mt-3 max-w-lg rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
              {error.message}
            </p>
          ) : null}
          <button
            onClick={reset}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#24533f] px-5 font-black text-white"
          >
            <Power className="h-5 w-5" />
            Tentar de novo
          </button>
        </section>
      </div>
    </main>
  );
}
