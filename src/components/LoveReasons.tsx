"use client";

import { useState } from "react";
import { motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { texts } from "@/lib/texts";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function FlipCard({
  index,
  keyword,
  text,
}: {
  index: number;
  keyword: string;
  text: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Reveal delay={(index % 4) * 0.08} className="h-full">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        aria-label={`Motivo ${index + 1}: ${keyword}`}
        className="h-full w-full [perspective:1000px]"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative aspect-[3/4] w-full [transform-style:preserve-3d]"
        >
          {/* Frente */}
          <div className="glass absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl p-4 [backface-visibility:hidden]">
            <span className="font-display text-3xl italic text-ouro md:text-4xl">
              {ROMAN[index] ?? index + 1}
            </span>
            <span className="text-center text-sm font-semibold leading-tight text-creme md:text-[15px]">
              {keyword}
            </span>
            <span className="absolute bottom-3 text-[10px] uppercase tracking-[0.18em] text-rosado/70">
              {texts.reasons.flipHint} ↻
            </span>
          </div>

          {/* Verso */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-rosa/30 bg-gradient-to-br from-vinho via-ameixa to-noite p-4 [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span aria-hidden className="text-rosa">
              ♥
            </span>
            <p className="text-center text-[12.5px] leading-snug text-blush md:text-[13px]">
              {text}
            </p>
          </div>
        </motion.div>
      </button>
    </Reveal>
  );
}

export default function LoveReasons() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <SectionTitle
          eyebrow={texts.reasons.eyebrow}
          title={texts.reasons.title}
          subtitle={texts.reasons.subtitle}
        />
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {texts.reasons.items.map((reason, i) => (
            <FlipCard key={reason.keyword} index={i} keyword={reason.keyword} text={reason.text} />
          ))}
        </div>

        <GuideBubble variant="engracado" message={texts.reasons.guideMessage} />
      </div>
    </section>
  );
}
