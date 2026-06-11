"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";

/**
 * ============================================================
 * O GUIA DA JORNADA (bonequinho baseado no namorado)
 * ============================================================
 *
 * As imagens vivem em /public/guide/guia-<variante>.png e são
 * geradas pelo script `node scripts/convert-guide.mjs <pasta>`
 * (remove o fundo, otimiza e redimensiona).
 *
 * Variantes disponíveis (basta trocar a prop `variant`):
 *   acenando · apaixonado · apontando · comemorando · engracado
 *   orgulhoso · pensando · presente · surpreso · triste
 *
 * Se algum arquivo não existir, o componente cai automaticamente
 * num placeholder — nenhuma linha de código precisa mudar.
 */

export type GuideVariant =
  | "acenando"
  | "apaixonado"
  | "apontando"
  | "comemorando"
  | "engracado"
  | "orgulhoso"
  | "pensando"
  | "presente"
  | "surpreso"
  | "triste";

const MOODS: Record<GuideVariant, { emoji: string; mood: string }> = {
  acenando: { emoji: "👋", mood: "modo: oi!" },
  apaixonado: { emoji: "😍", mood: "modo: apaixonado" },
  apontando: { emoji: "☝️", mood: "modo: atenção" },
  comemorando: { emoji: "🥳", mood: "modo: festa" },
  engracado: { emoji: "😜", mood: "modo: piada" },
  orgulhoso: { emoji: "😌", mood: "modo: orgulho" },
  pensando: { emoji: "🤔", mood: "modo: hmm…" },
  presente: { emoji: "🎁", mood: "modo: presente" },
  surpreso: { emoji: "😱", mood: "modo: uau" },
  triste: { emoji: "🥺", mood: "modo: saudade" },
};

type GuideBubbleProps = {
  variant: GuideVariant;
  message: string;
  /** Lado do boneco em telas médias+ (no mobile fica empilhado) */
  side?: "left" | "right";
  /** Nomezinho exibido acima da fala */
  name?: string;
  className?: string;
};

export default function GuideBubble({
  variant,
  message,
  side = "left",
  name = "seu guia nessa missão",
  className = "",
}: GuideBubbleProps) {
  const [imageMissing, setImageMissing] = useState(false);
  const { emoji, mood } = MOODS[variant];
  const rowDirection = side === "right" ? "sm:flex-row-reverse" : "sm:flex-row";
  const tailSide = side === "right" ? "sm:right-[-6px] sm:left-auto" : "sm:left-[-6px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`flex flex-col items-center gap-4 ${rowDirection} sm:items-end ${className}`}
    >
      {/* O bonequinho */}
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-36 w-28 md:h-40 md:w-32"
        >
          {!imageMissing ? (
            <Image
              src={`/guide/guia-${variant}.png`}
              alt={`Guia da jornada (${variant})`}
              fill
              sizes="(max-width: 768px) 112px, 128px"
              className="object-contain drop-shadow-[0_14px_22px_rgba(8,1,4,0.55)]"
              onError={() => setImageMissing(true)}
            />
          ) : (
            // Placeholder (caso a imagem da variante ainda não exista)
            <span className="flex size-full items-center justify-center rounded-full border-2 border-dashed border-rosa/50 bg-gradient-to-br from-vinho via-ameixa to-noite text-5xl">
              <span role="img" aria-label={`guia ${variant}`}>
                {emoji}
              </span>
            </span>
          )}
          {/* sombra no chão */}
          <span
            aria-hidden
            className="absolute -bottom-1.5 left-1/2 h-2 w-20 -translate-x-1/2 rounded-full bg-black/45 blur-[4px]"
          />
        </motion.div>
        <span className="whitespace-nowrap rounded-full border border-ouro/30 bg-noite/80 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-ouro">
          {mood}
        </span>
      </div>

      {/* Balão de fala */}
      <div className="relative max-w-md sm:mb-10">
        <div
          aria-hidden
          className={`absolute top-1/2 hidden size-3 -translate-y-1/2 rotate-45 border-b border-l border-blush/15 bg-[rgba(43,12,31,0.85)] sm:block ${tailSide}`}
        />
        <div
          aria-hidden
          className="absolute -top-[5px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-l border-t border-blush/15 bg-[rgba(43,12,31,0.85)] sm:hidden"
        />
        <div className="glass-strong rounded-2xl px-4 py-3.5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-rosa">
            {name}
          </p>
          <p className="text-sm leading-relaxed text-creme md:text-[15px]">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
