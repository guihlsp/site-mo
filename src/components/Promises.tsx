"use client";

import { motion } from "motion/react";
import SectionTitle from "./SectionTitle";
import { texts } from "@/lib/texts";

export default function Promises() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-xl flex-col gap-12">
        <SectionTitle eyebrow={texts.promises.eyebrow} title={texts.promises.title} />

        <ul className="flex flex-col">
          {texts.promises.items.map((promise, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex items-start gap-4 border-b border-blush/10 py-5 first:pt-0 last:border-none"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.25 + i * 0.1 }}
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-rosa/40 bg-rosa/10 text-sm text-rosa"
                aria-hidden
              >
                ♥
              </motion.span>
              <p className="text-[15px] leading-relaxed text-creme/90 md:text-base">{promise}</p>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-center font-hand text-2xl text-ouro"
        >
          assinado digitalmente com um beijo ✦
        </motion.p>
      </div>
    </section>
  );
}
