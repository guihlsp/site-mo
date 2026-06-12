"use client";

import { motion } from "motion/react";

/**
 * Efeito suave que toca uma vez quando um portão abre: um brilho dourado
 * que respira, uma faixa de luz que varre de cima pra baixo e algumas
 * fagulhas subindo. Decorativo, leve e sem nada de brusco.
 */
export default function GateRevealFx() {
  const sparkles = [
    { left: "18%", delay: 0.15, char: "✦", size: 16 },
    { left: "38%", delay: 0.35, char: "♡", size: 13 },
    { left: "57%", delay: 0.05, char: "✦", size: 18 },
    { left: "74%", delay: 0.45, char: "✧", size: 14 },
    { left: "88%", delay: 0.25, char: "♥", size: 12 },
  ];

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.7, ease: "easeInOut", times: [0, 1] }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[60vh] overflow-hidden"
    >
      {/* bloom dourado/rosa que cresce e some */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.55, 0], scale: [0.7, 1.25, 1.4] }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute left-1/2 top-10 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,184,115,0.5),rgba(239,62,110,0.25)_45%,transparent_70%)] blur-2xl"
      />

      {/* faixa de luz varrendo de cima pra baixo */}
      <motion.div
        initial={{ y: "-60%", opacity: 0 }}
        animate={{ y: "120%", opacity: [0, 0.7, 0] }}
        transition={{ duration: 1.3, ease: "easeInOut" }}
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-champanhe/25 to-transparent blur-md"
      />

      {/* fagulhas subindo */}
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -40, scale: 1.1 }}
          transition={{ duration: 1.3, delay: s.delay, ease: "easeOut" }}
          style={{ left: s.left, fontSize: s.size }}
          className="absolute top-24 text-ouro"
        >
          {s.char}
        </motion.span>
      ))}
    </motion.div>
  );
}
