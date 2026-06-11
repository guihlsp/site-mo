"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "./Reveal";
import { climaxPhotoId, futurePhoto, photoById } from "@/lib/photos";
import { texts } from "@/lib/texts";

export default function EmotionalClimax() {
  const photo = photoById(climaxPhotoId);
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative px-6 py-28 md:py-40">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-12 text-center">
        <Reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ouro/90">
            ✦ {texts.climax.eyebrow} ✦
          </span>
        </Reveal>

        {/* Foto com auréola dourada e respiração lenta */}
        <Reveal delay={0.1} className="relative">
          <div
            aria-hidden
            className="absolute -inset-8 rounded-[40px] bg-rosa-forte/20 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-ouro/30 via-transparent to-rosa/30 blur-xl"
          />
          <motion.div
            animate={reducedMotion ? undefined : { scale: [1, 1.035, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-[78vw] max-w-[340px] overflow-hidden rounded-3xl ring-1 ring-ouro/40 shadow-[0_24px_80px_rgba(8,1,4,0.6)]"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <Image
              src={photo.src}
              alt="Nós dois"
              fill
              sizes="(max-width: 768px) 78vw, 340px"
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-noite/40 via-transparent to-transparent"
            />
          </motion.div>
        </Reveal>

        <div className="flex flex-col gap-7">
          {texts.climax.lines.map((line, i) => (
            <Reveal key={i} delay={0.15 + i * 0.18} y={20}>
              <p
                className={
                  i === 0
                    ? "text-romance font-display text-3xl italic leading-snug md:text-4xl"
                    : "font-display text-lg italic leading-relaxed text-creme/90 md:text-xl"
                }
              >
                {line}
              </p>
            </Reveal>
          ))}
        </div>

        {/* O futuro, do jeito que a gente imagina */}
        <Reveal delay={0.15} className="mt-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ouro/90">
            ✦ {texts.climax.futureEyebrow} ✦
          </span>
        </Reveal>

        <Reveal delay={0.2} className="relative">
          <div
            aria-hidden
            className="absolute -inset-8 rounded-[40px] bg-ouro/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-rosa/25 via-transparent to-ouro/35 blur-xl"
          />
          <motion.div
            animate={reducedMotion ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="relative w-[78vw] max-w-[340px] overflow-hidden rounded-3xl ring-1 ring-ouro/50 shadow-[0_24px_80px_rgba(8,1,4,0.6)]"
            style={{ aspectRatio: `${futurePhoto.width} / ${futurePhoto.height}` }}
          >
            <Image
              src={futurePhoto.src}
              alt="Nós dois no futuro que imaginamos: com filhos e um pitbull, num pôr do sol"
              fill
              sizes="(max-width: 768px) 78vw, 340px"
              placeholder="blur"
              blurDataURL={futurePhoto.blurDataURL}
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-noite/30 via-transparent to-transparent"
            />
          </motion.div>
        </Reveal>

        <div className="flex flex-col gap-6">
          {texts.climax.futureLines.map((line, i) => (
            <Reveal key={i} delay={0.18 + i * 0.18} y={20}>
              <p className="font-display text-lg italic leading-relaxed text-creme/90 md:text-xl">
                {line}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p className="font-hand text-3xl text-ouro md:text-4xl">{texts.climax.signature}</p>
        </Reveal>
      </div>
    </section>
  );
}
