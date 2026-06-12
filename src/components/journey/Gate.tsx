"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GateRevealFx from "./GateRevealFx";
import { smoothScrollToEl } from "./scroll";
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
  const [playFx, setPlayFx] = useState(false);

  // Quando ESTA fase abre por ação da usuária: rola até ela e toca o efeito
  useEffect(() => {
    if (justUnlocked !== stage) return;
    // 1) dispara o efeito já no instante do desbloqueio (tela cheia).
    //    Toca mesmo com reduced-motion: é curto, único e não fica repetindo.
    const startId = setTimeout(() => setPlayFx(true), 0);
    // 2) espera um respiro pro conteúdo montar e pra ela ver o efeito,
    //    depois rola devagar (sempre suave — um scroll único e gentil,
    //    nada de pulo brusco mesmo com reduced-motion)
    const scrollId = setTimeout(() => {
      const el = ref.current;
      if (el) smoothScrollToEl(el, 24, 1500);
      clearJustUnlocked();
    }, 700);
    const fxId = setTimeout(() => setPlayFx(false), 2400);
    return () => {
      clearTimeout(startId);
      clearTimeout(scrollId);
      clearTimeout(fxId);
    };
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
      className="relative"
    >
      <AnimatePresence>{playFx && <GateRevealFx key="fx" />}</AnimatePresence>
      {children}
    </motion.div>
  );
}
