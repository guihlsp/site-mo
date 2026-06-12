"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import GuideBubble from "../GuideBubble";
import Reveal from "../Reveal";
import SectionTitle from "../SectionTitle";
import { useGate } from "./GateProvider";
import { texts } from "@/lib/texts";

const TAPS_TO_VALIDATE = 5;
const HEART_PATH =
  "M50 88 C12 60 4 40 4 26 C4 12 14 4 26 4 C36 4 45 11 50 20 C55 11 64 4 74 4 C86 4 96 12 96 26 C96 40 88 60 50 88 Z";

/**
 * Desafio fofo (e bobo) pós-promessas: carimbar o ingresso do museu.
 * Toca no coração até encher — cada toque dá um "ponto de carimbo".
 * Ao encher, o ingresso é validado e o museu (galeria) é liberado.
 */
export default function MuseumTicket() {
  const { isUnlocked, unlock } = useGate();
  const reduced = useReducedMotion();
  const alreadyOpen = isUnlocked("museu");

  const [taps, setTaps] = useState(alreadyOpen ? TAPS_TO_VALIDATE : 0);
  const done = taps >= TAPS_TO_VALIDATE;
  const pct = Math.min(taps / TAPS_TO_VALIDATE, 1) * 100;
  const t = texts.gates.museu;

  function stamp() {
    if (done) return;
    const next = Math.min(taps + 1, TAPS_TO_VALIDATE);
    setTaps(next);
    if (typeof navigator !== "undefined") navigator.vibrate?.(25);
    if (next >= TAPS_TO_VALIDATE) {
      if (!reduced) fireConfetti();
      // pequena pausa pra ver o carimbo antes de abrir o museu
      setTimeout(() => unlock("museu"), 700);
    }
  }

  async function fireConfetti() {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#ef3e6e", "#ff6b9a", "#e8b873", "#f7e3bb"],
      });
    } catch {
      /* confete é só enfeite */
    }
  }

  return (
    <section className="relative px-6 py-24 md:py-28">
      <div className="mx-auto flex max-w-xl flex-col gap-9">
        <SectionTitle eyebrow={t.eyebrow} title={t.title} />

        <GuideBubble variant="bilheteiro" message={t.guideMessage} side="right" />

        <Reveal delay={0.1}>
          <div className="glass-strong relative overflow-hidden rounded-3xl p-7 text-center md:p-9">
            {/* recortes de ingresso nas laterais */}
            <span aria-hidden className="absolute left-[-12px] top-1/2 size-6 -translate-y-1/2 rounded-full bg-noite" />
            <span aria-hidden className="absolute right-[-12px] top-1/2 size-6 -translate-y-1/2 rounded-full bg-noite" />

            <p className="mb-6 text-sm leading-relaxed text-rosado">
              {done ? t.done : t.instruction}
            </p>

            <motion.button
              type="button"
              onClick={stamp}
              disabled={done}
              aria-label={
                done
                  ? t.done
                  : `Carimbar o ingresso: ${taps} de ${TAPS_TO_VALIDATE} toques`
              }
              whileTap={done ? undefined : { scale: 0.9 }}
              animate={done ? { scale: [1, 1.18, 1] } : undefined}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative mx-auto block w-36 cursor-pointer disabled:cursor-default md:w-40"
            >
              {/* coração-contorno vazio */}
              <svg viewBox="0 0 100 92" className="w-full" aria-hidden>
                <path d={HEART_PATH} fill="rgba(255,255,255,0.06)" stroke="#ff6b9a" strokeOpacity="0.5" strokeWidth="2" />
              </svg>
              {/* preenchimento que sobe de baixo pra cima conforme os toques
                  (clip-path num div HTML — suporte sólido em todo navegador) */}
              <motion.div
                aria-hidden
                className="absolute inset-0"
                initial={false}
                animate={{ clipPath: `inset(${100 - pct}% 0% 0% 0%)` }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
              >
                <svg viewBox="0 0 100 92" className="w-full" aria-hidden>
                  <path d={HEART_PATH} fill="#ef3e6e" stroke="#ff6b9a" strokeWidth="2" />
                </svg>
              </motion.div>

              <AnimatePresence>
                {done && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: -8 }}
                    transition={{ type: "spring", stiffness: 240, damping: 12 }}
                    className="absolute inset-0 flex items-center justify-center text-3xl text-creme drop-shadow"
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* medidor de carimbos */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {Array.from({ length: TAPS_TO_VALIDATE }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-7 rounded-full transition-colors ${
                    i < taps ? "bg-rosa" : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            <p aria-live="polite" className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-rosado">
              {done ? t.done : taps === 0 ? t.tapHint : t.progressLabel}
            </p>

            {!done && (
              <p className="mt-3 text-xs text-rosado/60">{t.lockedNote}</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
