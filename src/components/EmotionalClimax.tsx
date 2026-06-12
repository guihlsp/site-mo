"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Reveal from "./Reveal";
import { futurePhoto } from "@/lib/photos";
import { texts } from "@/lib/texts";

export default function EmotionalClimax() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative px-6 py-28 md:py-40">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-12 text-center">
        <Reveal>
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ouro/90">
            ✦ {texts.climax.eyebrow} ✦
          </span>
        </Reveal>

        {/* A Mo pulando de dentro do presente "For You": o presente é ela.
            Salta com mola ao entrar na tela e flutua de leve. */}
        <motion.div
          initial={{ opacity: 0, y: 70, scale: 0.6 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.1 }}
          className="relative -mb-2"
        >
          <div
            aria-hidden
            className="absolute inset-x-4 bottom-6 -z-10 h-24 rounded-full bg-rosa-forte/25 blur-3xl"
          />
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -9, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-[62vw] max-w-[300px]"
            style={{ aspectRatio: "562 / 820" }}
          >
            <Image
              src="/guide/mo-presente.webp"
              alt="A Mo, em versão boneca de feltro, saindo de uma caixa de presente escrita “For You”"
              fill
              sizes="(max-width: 768px) 62vw, 300px"
              className="object-contain drop-shadow-[0_22px_36px_rgba(8,1,4,0.55)]"
            />
          </motion.div>
        </motion.div>

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

        {/* O Guizão vaqueiro assinando embaixo — com "Nath" na sola da bota */}
        <Reveal delay={0.2} className="relative">
          <div
            aria-hidden
            className="absolute inset-x-6 bottom-4 -z-10 h-20 rounded-full bg-ouro/15 blur-2xl"
          />
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-[56vw] max-w-[260px]"
            style={{ aspectRatio: "598 / 820" }}
          >
            <Image
              src="/guide/guia-vaqueiro.webp"
              alt="Guizão em versão boneco vaqueiro, com o nome “Nath” na sola da bota"
              fill
              sizes="(max-width: 768px) 56vw, 260px"
              className="object-contain drop-shadow-[0_18px_30px_rgba(8,1,4,0.5)]"
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
