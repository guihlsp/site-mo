"use client";

import { motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { texts } from "@/lib/texts";

export default function JourneyIntro() {
  return (
    <section id="jornada" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionTitle
          eyebrow={texts.intro.eyebrow}
          title={texts.intro.title}
        />

        <Reveal delay={0.1}>
          <p className="text-center text-[15px] leading-relaxed text-rosado md:text-base">
            {texts.intro.paragraph}
          </p>
        </Reveal>

        <GuideBubble variant="acenando" message={texts.intro.guideMessage} />

        <Reveal delay={0.15}>
          <div className="glass rounded-3xl p-6 md:p-8">
            <h3 className="mb-5 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-ouro">
              {texts.intro.rulesTitle}
            </h3>
            <ul className="flex flex-col gap-4">
              {texts.intro.rules.map((rule, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.15, duration: 0.6 }}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-px text-xl" aria-hidden>
                    {rule.icon}
                  </span>
                  <span className="text-sm leading-relaxed text-creme/90 md:text-[15px]">
                    {rule.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
