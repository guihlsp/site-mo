"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

/** Wrapper padrão de entrada por scroll: fade + deslize suave, uma vez só. */
export default function Reveal({ delay = 0, y = 28, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.65, 0.36, 1] }}
      {...props}
    />
  );
}
