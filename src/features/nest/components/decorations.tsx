import { Baby, Bird, Flower2, Heart, Leaf, Sprout, Sun } from "lucide-react";

export function GardenDecorations() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <Sun
        className="absolute left-8 top-8 h-14 w-14 text-amber-300/80 sm:h-16 sm:w-16"
        strokeWidth={1.4}
      />
      <Flower2
        className="absolute right-10 top-16 hidden h-14 w-14 text-rose-300/80 sm:block"
        strokeWidth={1.5}
      />
      <Flower2
        className="absolute bottom-20 left-8 h-16 w-16 text-fuchsia-300/70"
        strokeWidth={1.4}
      />
      <Bird
        className="absolute right-[18%] top-10 hidden h-12 w-12 text-sky-500/50 sm:block"
        strokeWidth={1.5}
      />
      <Baby
        className="absolute bottom-8 right-10 h-14 w-14 text-emerald-500/45"
        strokeWidth={1.5}
      />
      <Leaf
        className="absolute bottom-12 left-[22%] h-12 w-12 rotate-12 text-green-500/40"
        strokeWidth={1.5}
      />
      <Sprout
        className="absolute bottom-8 right-[28%] h-12 w-12 text-lime-600/40"
        strokeWidth={1.5}
      />
      <Heart
        className="absolute left-[45%] top-20 hidden h-9 w-9 text-rose-300/60 sm:block"
        strokeWidth={1.6}
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(198,232,194,0.62)_100%)]" />
    </div>
  );
}
