"use client";

import { motion } from "motion/react";

/** Avisinho discreto de "trecho trancado", com uma setinha apontando pra cima. */
export default function LockedHint({ message }: { message: string }) {
  return (
    <section className="relative px-6 py-16" aria-hidden>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-md flex-col items-center gap-3 text-center"
      >
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-rosado/70"
        >
          ↑
        </motion.span>
        <p className="glass rounded-full px-5 py-2.5 text-sm text-rosado">{message}</p>
      </motion.div>
    </section>
  );
}
