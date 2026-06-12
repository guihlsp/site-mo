"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { texts } from "@/lib/texts";

/**
 * Loading da "Rádio Guizão FM" — cobre a tela no instante em que ela toca
 * em começar, enquanto a jornada (pesada) monta por baixo. Some com um fade
 * assim que está tudo pronto, evitando a sensação de travamento.
 */
export default function RadioBootOverlay({ show }: { show: boolean }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="radio-boot"
          aria-live="polite"
          aria-label={`${texts.player.stationName} — ${texts.player.onAir}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-6 bg-noite/95 px-8 text-center backdrop-blur-sm"
        >
          {/* brilho atrás */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosa-forte/15 blur-3xl"
          />

          {/* microfone pulsando */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex size-20 items-center justify-center rounded-full border border-ouro/40 bg-gradient-to-br from-vinho to-ameixa text-4xl shadow-[0_0_40px_rgba(232,184,115,0.25)]"
          >
            🎙️
          </motion.div>

          <div className="relative flex flex-col items-center gap-1.5">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-rosa">
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block size-2 rounded-full bg-rosa-forte"
              />
              {texts.player.onAir}
            </span>
            <h2 className="font-display text-2xl italic text-creme">{texts.player.stationName}</h2>
            <p className="text-sm text-rosado">{texts.player.bootLine}</p>
          </div>

          {/* equalizador */}
          <div className="relative flex items-end gap-1.5" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-rosa-forte to-ouro"
                animate={{ height: [6, 26, 10, 22, 6] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
