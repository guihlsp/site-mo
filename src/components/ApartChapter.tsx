"use client";

import { motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import { texts } from "@/lib/texts";

/**
 * Coração de feltro rachado que se costura sozinho quando entra
 * na tela: a metáfora do período em que ficaram separados.
 */
function MendedHeart() {
  const stitches = [
    { x1: 43, y1: 27, x2: 55, y2: 22 },
    { x1: 44, y1: 37, x2: 56, y2: 33 },
    { x1: 42, y1: 48, x2: 54, y2: 44 },
    { x1: 44, y1: 59, x2: 56, y2: 55 },
    { x1: 44, y1: 69, x2: 54, y2: 66 },
  ];

  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 2.6 }}
      className="relative mx-auto w-24 md:w-28"
    >
      <svg viewBox="0 0 100 92" className="w-full drop-shadow-[0_10px_24px_rgba(239,62,110,0.3)]" aria-hidden>
        {/* coração */}
        <path
          d="M50 84 C20 60 8 43 8 28 C8 15 18 7 29 7 C37 7 45 12 50 20 C55 12 63 7 71 7 C82 7 92 15 92 28 C92 43 80 60 50 84 Z"
          fill="#ef3e6e"
          stroke="#ff6b9a"
          strokeWidth="1.5"
        />
        {/* a rachadura */}
        <motion.path
          d="M50 17 L45 28 L53 38 L45 50 L52 61 L47 70 L50 86"
          fill="none"
          stroke="#130509"
          strokeWidth="2.6"
          strokeLinecap="round"
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0.45 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 2.2, duration: 1 }}
        />
        {/* os pontos da costura, um a um */}
        {stitches.map((s, i) => (
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
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.7 + i * 0.32, duration: 0.45, ease: "easeOut" }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

export default function ApartChapter() {
  return (
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

        <Reveal delay={0.2}>
          <MendedHeart />
        </Reveal>

        <Reveal delay={0.3}>
          <p className="font-hand text-2xl text-ouro md:text-3xl">{texts.apart.punchline}</p>
        </Reveal>
      </div>
    </section>
  );
}
