"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Polaroid from "./Polaroid";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { photoById } from "@/lib/photos";
import { texts } from "@/lib/texts";

type Moment = (typeof texts.moments.items)[number];

function MomentBlock({ moment, index }: { moment: Moment; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Parallax sutil: a foto flutua em velocidade diferente do texto
  const photoY = useTransform(scrollYProgress, [0, 1], [36, -36]);
  const photoIsLeft = index % 2 === 0;
  const rotation = photoIsLeft ? -3 : 2.5;

  return (
    <div
      ref={ref}
      className="relative grid items-center gap-8 md:grid-cols-2 md:gap-14"
    >
      {/* Pontinho na linha central (desktop) */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosa shadow-[0_0_16px_rgba(255,107,154,0.8)] md:block"
      />

      <motion.div
        style={{ y: photoY }}
        className={`mx-auto w-full max-w-[300px] md:max-w-[320px] ${photoIsLeft ? "" : "md:order-2"}`}
      >
        <Reveal>
          <Polaroid
            photo={photoById(moment.photoId)}
            caption={moment.caption}
            rotate={rotation}
            tape
            sizes="(max-width: 768px) 78vw, 320px"
          />
        </Reveal>
      </motion.div>

      <div className={photoIsLeft ? "md:pl-4" : "md:order-1 md:pr-4 md:text-right"}>
        <Reveal delay={0.12}>
          <p className="font-hand text-2xl text-rosa">{moment.tag}</p>
          <h3 className="mt-2 font-display text-2xl italic leading-snug text-creme md:text-3xl">
            {moment.title}
          </h3>
          <p className="mt-3.5 text-[15px] leading-relaxed text-rosado md:text-base">
            {moment.text}
          </p>
        </Reveal>
      </div>
    </div>
  );
}

export default function MomentsTimeline() {
  return (
    <section id="momentos" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          eyebrow={texts.moments.eyebrow}
          title={texts.moments.title}
          subtitle={texts.moments.subtitle}
        />

        <div className="relative mt-16 flex flex-col gap-24 md:mt-24 md:gap-36">
          {/* Linha vertical central com gradiente (desktop) */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-rosa/40 to-transparent md:block"
          />
          {texts.moments.items.map((moment, i) => (
            <MomentBlock key={moment.photoId} moment={moment} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
