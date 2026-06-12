"use client";

import { createPortal } from "react-dom";
import { motion } from "motion/react";

/**
 * Efeito de "portão liberado" — toca uma vez quando uma fase abre.
 * Em vez de preso à seção (que some no scroll), ele aparece sobre a tela
 * inteira no instante do desbloqueio: um clarão dourado central que pulsa,
 * um anel que se expande e fagulhas/corações irradiando. Visível, porém
 * curto e suave. Respeita prefers-reduced-motion (nem é montado nesse caso).
 */
export default function GateRevealFx() {
  // partículas irradiando do centro
  const bits = [
    { char: "✦", ang: -90, dist: 230, size: 26, delay: 0.02 },
    { char: "♥", ang: -40, dist: 280, size: 22, delay: 0.08 },
    { char: "✧", ang: 10, dist: 250, size: 24, delay: 0.0 },
    { char: "♡", ang: 55, dist: 300, size: 20, delay: 0.12 },
    { char: "✦", ang: 120, dist: 260, size: 28, delay: 0.05 },
    { char: "♥", ang: 165, dist: 240, size: 18, delay: 0.1 },
    { char: "✧", ang: -150, dist: 290, size: 22, delay: 0.04 },
    { char: "✦", ang: -110, dist: 210, size: 20, delay: 0.14 },
  ];

  if (typeof document === "undefined") return null;

  // Portal pro <body>: garante cobrir a viewport inteira, livre de qualquer
  // ancestral com transform/opacity (que "prenderia" o position: fixed).
  return createPortal(
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 2.4, times: [0, 1], ease: "easeInOut" }}
      className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center overflow-hidden"
    >
      {/* tintura quente cobrindo a tela, que some */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.34, 0] }}
        transition={{ duration: 1.9, ease: "easeOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(232,184,115,0.5),rgba(239,62,110,0.22)_40%,transparent_74%)]"
      />

      {/* clarão central pulsando */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 1.8] }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(255,240,244,0.95),rgba(232,184,115,0.6)_40%,rgba(239,62,110,0.3)_65%,transparent_78%)] blur-xl"
      />

      {/* anel que se expande */}
      <motion.div
        initial={{ opacity: 0.85, scale: 0.25 }}
        animate={{ opacity: 0, scale: 2.4 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute size-72 rounded-full border-2 border-ouro/70"
      />
      <motion.div
        initial={{ opacity: 0.6, scale: 0.15 }}
        animate={{ opacity: 0, scale: 2.9 }}
        transition={{ duration: 1.4, delay: 0.12, ease: "easeOut" }}
        className="absolute size-72 rounded-full border border-rosa/60"
      />

      {/* fagulhas e corações irradiando do centro */}
      {bits.map((b, i) => {
        const rad = (b.ang * Math.PI) / 180;
        const x = Math.cos(rad) * b.dist;
        const y = Math.sin(rad) * b.dist;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], x, y, scale: [0.4, 1.15, 0.9] }}
            transition={{ duration: 1.4, delay: b.delay, ease: "easeOut" }}
            style={{ fontSize: b.size }}
            className="absolute text-ouro drop-shadow-[0_0_6px_rgba(232,184,115,0.6)]"
          >
            {b.char}
          </motion.span>
        );
      })}
    </motion.div>,
    document.body,
  );
}
