"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useGate, type Stage } from "./GateProvider";

/**
 * Renderiza os filhos só quando o estágio está liberado — antes disso
 * mostra (opcionalmente) um aviso de trancado. Quando a fase abre por
 * uma ação da usuária, rola suavemente até o conteúdo recém-revelado.
 *
 * Igual ao ApartChapter: o conteúdo trancado nem entra no DOM, então não
 * dá pra rolar até ele "por baixo dos panos".
 */
export default function Gate({
  stage,
  children,
  locked = null,
}: {
  stage: Stage;
  children: React.ReactNode;
  /** O que mostrar enquanto está trancado (padrão: nada) */
  locked?: React.ReactNode;
}) {
  const { ready, isUnlocked, justUnlocked, clearJustUnlocked } = useGate();
  const ref = useRef<HTMLDivElement>(null);
  const open = isUnlocked(stage);

  // Auto-scroll só quando ESTA fase acabou de abrir por uma ação da usuária
  useEffect(() => {
    if (justUnlocked !== stage) return;
    const id = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      clearJustUnlocked();
    }, 80);
    return () => clearTimeout(id);
  }, [justUnlocked, stage, clearJustUnlocked]);

  if (!ready || !open) {
    return locked ? <div ref={ref}>{locked}</div> : <div ref={ref} aria-hidden />;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
