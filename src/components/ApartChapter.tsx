"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import { texts } from "@/lib/texts";

/**
 * O capítulo difícil: o coração de feltro aparece PARTIDO ao meio.
 * Cada toque costura um ponto e aproxima as metades; com todos os
 * pontos ele se fecha e só então o resto do site (children) é
 * liberado. O progresso fica salvo na sessão (refresh não tranca).
 */

const TOTAL_STITCHES = 5;
const MAX_SEPARATION = 9;
const STORAGE_KEY = "coracao-remendado";

const STITCHES = [
  { x1: 43, y1: 27, x2: 55, y2: 22 },
  { x1: 44, y1: 37, x2: 56, y2: 33 },
  { x1: 42, y1: 48, x2: 54, y2: 44 },
  { x1: 44, y1: 59, x2: 56, y2: 55 },
  { x1: 44, y1: 69, x2: 54, y2: 66 },
];

// As duas metades compartilham exatamente a mesma borda da rachadura,
// então quando a separação chega a zero o coração se encaixa perfeito.
const CRACK_EDGE = "L47 70 L52 61 L45 50 L53 38 L45 28 Z";
const LEFT_HALF = `M50 20 C45 12 37 7 29 7 C18 7 8 15 8 28 C8 43 20 60 50 84 ${CRACK_EDGE}`;
const RIGHT_HALF = `M50 20 C55 12 63 7 71 7 C82 7 92 15 92 28 C92 43 80 60 50 84 ${CRACK_EDGE}`;

function BrokenHeart({
  stitched,
  done,
  onStitch,
}: {
  stitched: number;
  done: boolean;
  onStitch: () => void;
}) {
  const separation = MAX_SEPARATION * (1 - stitched / TOTAL_STITCHES);

  return (
    <div className="relative">
      {/* brilho dourado quando se fecha */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="absolute -inset-10 rounded-full bg-ouro/20 blur-3xl"
      />

      <motion.button
        type="button"
        onClick={onStitch}
        disabled={done}
        aria-label={
          done
            ? "Coração inteiro de novo"
            : `Costurar o coração: ${stitched} de ${TOTAL_STITCHES} pontos`
        }
        whileTap={done ? undefined : { scale: 0.93 }}
        animate={
          done
            ? { scale: [1, 1.16, 1, 1.06, 1] }
            : { rotate: [0, -1.6, 1.6, 0] }
        }
        transition={
          done
            ? { duration: 1.1, ease: "easeInOut" }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative mx-auto block w-32 cursor-pointer md:w-36"
      >
        <svg
          viewBox="0 0 100 92"
          className="w-full drop-shadow-[0_10px_24px_rgba(239,62,110,0.3)]"
          aria-hidden
        >
          {/* metade esquerda */}
          <motion.path
            d={LEFT_HALF}
            fill="#ef3e6e"
            stroke="#ff6b9a"
            strokeWidth="1.5"
            initial={false}
            animate={{ x: -separation }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          />
          {/* metade direita */}
          <motion.path
            d={RIGHT_HALF}
            fill="#ef3e6e"
            stroke="#ff6b9a"
            strokeWidth="1.5"
            initial={false}
            animate={{ x: separation }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
          />
          {/* pontos de costura já dados */}
          {STITCHES.map((s, i) => (
            <motion.line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#f7e3bb"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                stitched > i
                  ? { pathLength: 1, opacity: done ? 0.85 : 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </svg>

        {/* coraçõezinhos comemorando o conserto */}
        <AnimatePresence>
          {done && (
            <motion.div key="burst" className="pointer-events-none absolute inset-0" aria-hidden>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos((i / 6) * Math.PI * 2) * 64,
                    y: Math.sin((i / 6) * Math.PI * 2) * 52 - 18,
                    scale: 1.2,
                  }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                  className="absolute left-1/2 top-1/2 text-base text-rosa"
                >
                  ♥
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

export default function ApartChapter({ children }: { children: React.ReactNode }) {
  const [stitched, setStitched] = useState(0);
  const [mended, setMended] = useState(false);
  const done = stitched >= TOTAL_STITCHES;

  // Já costurou nesta sessão? Libera direto (refresh não tranca de novo).
  // Adiado para o próximo tick: evita renders em cascata dentro do effect.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setStitched(TOTAL_STITCHES);
        setMended(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Pequena pausa dramática entre fechar o coração e liberar o resto
  useEffect(() => {
    if (!done || mended) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    const timer = setTimeout(() => setMended(true), 1100);
    return () => clearTimeout(timer);
  }, [done, mended]);

  function stitch() {
    if (done) return;
    setStitched((s) => Math.min(s + 1, TOTAL_STITCHES));
    if (typeof navigator !== "undefined") navigator.vibrate?.(40);
  }

  return (
    <>
      <section className="relative px-6 py-24 md:py-32">
        {/* o clima esfria: névoa azulada só nesta seção */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(62%_55%_at_50%_32%,rgba(44,56,98,0.22),transparent_72%)]"
        />

        <div className="relative mx-auto flex max-w-lg flex-col items-center gap-10 text-center">
          <Reveal className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#a9b2d6]">
              ✦ {texts.apart.eyebrow} ✦
            </span>
            <h2 className="font-display text-3xl italic leading-tight text-creme md:text-5xl">
              {texts.apart.title}
            </h2>
          </Reveal>

          <GuideBubble variant="triste" message={texts.apart.guideMessage} />

          <div className="flex flex-col gap-6">
            {texts.apart.lines.map((line, i) => (
              <Reveal key={i} delay={0.12 + i * 0.16} y={18}>
                <p className="font-display text-lg italic leading-relaxed text-creme/85 md:text-xl">
                  {line}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <p className="font-hand text-2xl text-blush md:text-3xl">
              {texts.apart.mendInstruction}
            </p>
          </Reveal>

          <Reveal delay={0.2} className="flex flex-col items-center gap-4">
            <BrokenHeart stitched={stitched} done={done} onStitch={stitch} />
            <p aria-live="polite" className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rosado">
              {done
                ? texts.apart.mendDone
                : `${stitched} de ${TOTAL_STITCHES} ${texts.apart.mendProgressLabel}s`}
            </p>
          </Reveal>

          <AnimatePresence mode="wait">
            {mended ? (
              <motion.p
                key="punchline"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="font-hand text-2xl text-ouro md:text-3xl"
              >
                {texts.apart.punchline}
              </motion.p>
            ) : (
              <motion.p
                key="locked"
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-full px-5 py-2.5 text-xs text-rosado"
              >
                {texts.apart.mendLocked}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* O resto da história só existe com o coração inteiro */}
      {mended && (
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.21, 0.65, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
