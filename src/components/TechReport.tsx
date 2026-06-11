"use client";

import Image from "next/image";
import { motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { texts } from "@/lib/texts";

function MetricBar({
  label,
  value,
  note,
  index,
}: {
  label: string;
  value: number;
  note: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.12, duration: 0.55 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-creme md:text-[15px]">{label}</span>
        <span className="font-mono text-sm font-bold text-ouro">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: "0%" }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.2 + index * 0.12, duration: 1.1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-ouro via-champanhe to-rosa"
        />
      </div>
      <span className="font-mono text-[11px] italic leading-snug text-rosado/80">{`// ${note}`}</span>
    </motion.div>
  );
}

export default function TechReport() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-12">
        <SectionTitle eyebrow={texts.report.eyebrow} title={texts.report.title} />

        <GuideBubble variant="apontando" message={texts.report.guideMessage} side="right" />

        <Reveal delay={0.1}>
          <div className="glass relative overflow-hidden rounded-2xl border-l-4 border-l-ouro/60 p-6 md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-ouro/80">
                  {texts.report.docId}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-rosado">{texts.report.intro}</p>
              </div>
              {/* A amostra analisada: ela, em versão boneca */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 4 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.3 }}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <div className="relative h-28 w-20 md:h-36 md:w-24">
                  <Image
                    src="/guide/mo-sozinha.png"
                    alt="Ela, em versão boneca de feltro"
                    fill
                    sizes="(max-width: 768px) 80px, 96px"
                    className="object-contain drop-shadow-[0_12px_18px_rgba(8,1,4,0.5)]"
                  />
                </div>
                <span className="whitespace-nowrap rounded-full border border-ouro/30 bg-noite/80 px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wider text-ouro">
                  {texts.report.specimenLabel}
                </span>
              </motion.div>
            </div>

            <div className="mt-7 flex flex-col gap-5">
              {texts.report.metrics.map((m, i) => (
                <MetricBar key={m.label} label={m.label} value={m.value} note={m.note} index={i} />
              ))}

              {/* Métrica que estoura a escala */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: texts.report.metrics.length * 0.12, duration: 0.55 }}
                className="flex flex-col gap-1.5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-creme md:text-[15px]">
                    {texts.report.overflowLabel}
                  </span>
                  <span className="font-display text-xl font-bold text-rosa">
                    {texts.report.overflowValue}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      delay: 0.2 + texts.report.metrics.length * 0.12,
                      duration: 0.9,
                      ease: "easeIn",
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-rosa-forte to-rosa animate-pulse"
                  />
                </div>
                <span className="font-mono text-[11px] italic leading-snug text-rosa/90">
                  {`// ${texts.report.overflowNote}`}
                </span>
              </motion.div>
            </div>

            {/* Carimbo */}
            <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <p className="max-w-[260px] text-center font-mono text-[11px] leading-relaxed text-rosado sm:text-left">
                {texts.report.verdict}
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 2.4, rotate: 4 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -9 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 280, damping: 14, delay: 0.9 }}
                className="rounded-md border-[3px] border-double border-ouro px-5 py-2.5 font-display text-base font-bold uppercase tracking-[0.14em] text-ouro shadow-[0_0_24px_rgba(232,184,115,0.2)]"
              >
                {texts.report.stamp}
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
