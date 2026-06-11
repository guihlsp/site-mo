"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { texts } from "@/lib/texts";

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function TruthOracle() {
  const truths = texts.oracle.truths;
  // O baralho só é embaralhado no primeiro clique (já no cliente),
  // então o HTML do servidor e o da hidratação são idênticos.
  const [order, setOrder] = useState<number[] | null>(null);
  const [revealed, setRevealed] = useState(0); // quantas verdades já saíram
  const [burstKey, setBurstKey] = useState(0);

  const currentTruth =
    revealed > 0 && order && order.length > 0
      ? truths[order[(revealed - 1) % truths.length]]
      : null;

  function drawTruth() {
    setOrder((previous) => {
      // Primeiro clique ou lista esgotada: embaralha (de novo)
      if (!previous || (revealed > 0 && revealed % truths.length === 0)) {
        return shuffle(truths.map((_, i) => i));
      }
      return previous;
    });
    setRevealed((r) => r + 1);
    setBurstKey((k) => k + 1);
  }

  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-10">
        <SectionTitle
          eyebrow={texts.oracle.eyebrow}
          title={texts.oracle.title}
          subtitle={texts.oracle.subtitle}
        />

        <Reveal className="w-full" delay={0.1}>
          <div className="glass-strong relative flex min-h-[280px] flex-col items-center justify-between gap-7 overflow-hidden rounded-3xl px-6 py-8 md:px-10">
            {/* brilho de fundo */}
            <div
              aria-hidden
              className="absolute -top-20 left-1/2 size-48 -translate-x-1/2 rounded-full bg-ouro/10 blur-3xl"
            />

            <div className="flex min-h-[120px] w-full flex-1 items-center justify-center">
              <AnimatePresence mode="wait">
                {currentTruth ? (
                  <motion.blockquote
                    key={revealed}
                    initial={{ opacity: 0, rotateX: 70, y: 16 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: -70, y: -16 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="text-center font-display text-lg italic leading-relaxed text-creme md:text-xl"
                  >
                    “{currentTruth}”
                  </motion.blockquote>
                ) : (
                  <motion.p
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-rosado"
                  >
                    O oráculo está pronto. Respire fundo e aperte o botão. ✨
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex flex-col items-center gap-3">
              {/* fagulhas ao clicar */}
              <AnimatePresence>
                {burstKey > 0 && (
                  <motion.div key={burstKey} className="pointer-events-none absolute inset-0" aria-hidden>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                        animate={{
                          opacity: 0,
                          x: Math.cos((i / 6) * Math.PI * 2) * 56,
                          y: Math.sin((i / 6) * Math.PI * 2) * 44 - 14,
                          scale: 1.15,
                        }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/2 text-sm text-ouro"
                      >
                        ✦
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={drawTruth}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className="rounded-full border border-ouro/50 bg-ouro/10 px-7 py-3.5 text-sm font-bold text-champanhe transition-colors hover:bg-ouro/20"
              >
                🔮 {texts.oracle.button}
              </motion.button>

              {revealed > 0 && (
                <span className="text-[11px] uppercase tracking-[0.2em] text-rosado/80">
                  {texts.oracle.counterLabel} nº {((revealed - 1) % truths.length) + 1} · de {truths.length}
                </span>
              )}
            </div>
          </div>
        </Reveal>

        <GuideBubble variant="surpreso" message={texts.oracle.guideMessage} side="right" />
      </div>
    </section>
  );
}
