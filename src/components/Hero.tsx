"use client";

import { motion } from "motion/react";
import { useGate } from "./journey/GateProvider";
import { requestPlayerStart } from "@/lib/player-bus";
import { playlist } from "@/lib/playlist";
import { texts } from "@/lib/texts";

/** Selo giratório estilo "lacre de carta" */
function RotatingSeal() {
  const sealText = `${texts.hero.sealTop} • ${texts.hero.sealBottom} • `;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.2 }}
      className="relative mx-auto mb-8 size-24 md:size-28"
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full animate-[spin-slow_18s_linear_infinite]"
        aria-hidden
      >
        <defs>
          <path id="seal-circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
        </defs>
        {/* Um ciclo único travado na circunferência (2π·37 ≈ 232): cada frase
            aparece 1x e as duas junções ganham o "•", inclusive a emenda */}
        <text className="fill-ouro text-[10px] font-semibold uppercase" style={{ letterSpacing: "2px" }}>
          <textPath href="#seal-circle" textLength={232} lengthAdjust="spacing">
            {sealText}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[26%] flex items-center justify-center rounded-full border border-ouro/40 bg-gradient-to-br from-vinho to-ameixa shadow-[0_0_28px_rgba(232,184,115,0.25)]">
        <motion.span
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-xl text-rosa"
        >
          ♥
        </motion.span>
      </div>
    </motion.div>
  );
}

/** Título com revelação palavra a palavra */
function StaggeredTitle() {
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.5 } },
  };
  const word = {
    hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.21, 0.65, 0.36, 1] as const },
    },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl font-display text-4xl leading-[1.12] text-creme md:text-6xl"
    >
      <span className="block">
        {texts.hero.titleLine1.split(" ").map((w, i) => (
          <motion.span key={i} variants={word} className="mr-[0.28em] inline-block">
            {w}
          </motion.span>
        ))}
      </span>
      <span className="mt-2 block italic">
        {texts.hero.titleLine2.split(" ").map((w, i) => (
          <motion.span key={i} variants={word} className="text-romance mr-[0.28em] inline-block">
            {w}
          </motion.span>
        ))}
      </span>
    </motion.h1>
  );
}

export default function Hero() {
  const hasMusic = playlist.length > 0;
  const { isUnlocked, unlock } = useGate();
  const started = isUnlocked("start");

  function startJourney() {
    // O play precisa nascer dentro do toque dela (política de autoplay)
    if (hasMusic) requestPlayerStart();
    // Libera o resto do site; o <Gate stage="start"> rola até a jornada sozinho.
    unlock("start");
  }

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Orbes de luz desfocadas */}
      <div
        aria-hidden
        className="absolute -top-[12%] right-[-18%] size-[52vw] max-w-[560px] rounded-full bg-rosa-forte/15 blur-[110px]"
      />
      <div
        aria-hidden
        className="absolute bottom-[-15%] left-[-18%] size-[48vw] max-w-[520px] rounded-full bg-vinho/50 blur-[110px]"
      />
      <div
        aria-hidden
        className="absolute left-[12%] top-[18%] size-[26vw] max-w-[280px] rounded-full bg-ouro/10 blur-[90px]"
      />

      {/* Estrelinhas */}
      <div aria-hidden className="absolute inset-0">
        {[
          { top: "14%", left: "12%", size: 3, dur: "3.2s", delay: "0s" },
          { top: "22%", left: "78%", size: 2, dur: "4.1s", delay: "0.8s" },
          { top: "32%", left: "28%", size: 2, dur: "3.6s", delay: "1.4s" },
          { top: "16%", left: "55%", size: 3, dur: "4.4s", delay: "0.4s" },
          { top: "64%", left: "85%", size: 2, dur: "3.8s", delay: "1.9s" },
          { top: "72%", left: "16%", size: 3, dur: "4.6s", delay: "0.6s" },
          { top: "82%", left: "62%", size: 2, dur: "3.4s", delay: "1.1s" },
          { top: "46%", left: "92%", size: 2, dur: "4s", delay: "2.2s" },
        ].map((s, i) => (
          <span
            key={i}
            className="star"
            style={
              {
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                "--dur": s.dur,
                "--delay": s.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10">
        <RotatingSeal />

        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="glass mb-7 inline-block rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-ouro"
        >
          {texts.hero.badge}
        </motion.span>

        <StaggeredTitle />

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.8 }}
          className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-rosado md:text-base"
        >
          {texts.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.05, duration: 0.8 }}
          className="mt-9 flex flex-col items-center gap-2.5"
        >
          <motion.button
            type="button"
            onClick={startJourney}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2.5 rounded-full bg-rosa-forte px-8 py-4 text-base font-bold text-creme animate-[pulse-glow_2.6s_ease-in-out_infinite] transition-colors hover:bg-rosa"
          >
            <span aria-hidden>{hasMusic ? "♪" : "♥"}</span>
            {hasMusic ? texts.hero.cta : texts.hero.ctaFallback}
            <span aria-hidden>♥</span>
          </motion.button>
          <span className="text-xs text-rosado/80">{texts.hero.ctaHint}</span>
        </motion.div>
      </div>

      {/* Indicador de scroll — só faz sentido depois de começar (antes o
          scroll fica travado), então fica escondido até clicar em começar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 1 : 0 }}
        transition={{ delay: started ? 0 : 2.8, duration: 1 }}
        aria-hidden={!started}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-rosado/70"
      >
        <span className="font-hand text-lg">{texts.hero.scrollHint}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="animate-[bob_1.8s_ease-in-out_infinite]"
          aria-hidden
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  );
}
