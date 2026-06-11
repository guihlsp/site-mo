"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barrinha de progresso da jornada no topo da tela. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-rosa-forte via-rosa to-ouro"
    />
  );
}
