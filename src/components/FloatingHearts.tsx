"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Duas camadas de magia ambiente:
 *  1. Corações/estrelinhas subindo lentamente ao fundo (decoração)
 *  2. Coraçõezinhos que nascem onde ela toca/clica na tela
 * Tudo com pointer-events desligado — nunca atrapalha a navegação.
 */

type TapHeart = {
  id: number;
  x: number;
  y: number;
  char: string;
  rot: number;
  size: number;
  color: string;
};

// Configuração fixa (determinística → sem problemas de hidratação)
const AMBIENT = [
  { left: "6%", size: 18, dur: 19, delay: 0, char: "♥", opacity: 0.16, color: "#ff6b9a" },
  { left: "14%", size: 12, dur: 23, delay: 6, char: "♡", opacity: 0.2, color: "#ffd7e3" },
  { left: "24%", size: 22, dur: 17, delay: 11, char: "♥", opacity: 0.12, color: "#ef3e6e" },
  { left: "33%", size: 10, dur: 26, delay: 3, char: "✦", opacity: 0.22, color: "#e8b873" },
  { left: "42%", size: 16, dur: 21, delay: 14, char: "♥", opacity: 0.15, color: "#ff6b9a" },
  { left: "51%", size: 11, dur: 24, delay: 8, char: "♡", opacity: 0.18, color: "#ffd7e3" },
  { left: "59%", size: 20, dur: 18, delay: 1, char: "♥", opacity: 0.13, color: "#ef3e6e" },
  { left: "67%", size: 9, dur: 27, delay: 16, char: "✦", opacity: 0.24, color: "#f7e3bb" },
  { left: "75%", size: 15, dur: 20, delay: 5, char: "♥", opacity: 0.17, color: "#ff6b9a" },
  { left: "83%", size: 12, dur: 25, delay: 12, char: "♡", opacity: 0.19, color: "#ffd7e3" },
  { left: "90%", size: 19, dur: 18, delay: 9, char: "♥", opacity: 0.14, color: "#ef3e6e" },
  { left: "96%", size: 10, dur: 22, delay: 2, char: "✦", opacity: 0.2, color: "#e8b873" },
];

const TAP_CHARS = ["♥", "♥", "♡", "✦"];
const TAP_COLORS = ["#ff6b9a", "#ef3e6e", "#ffd7e3", "#e8b873"];

let nextId = 0;

export default function FloatingHearts() {
  const reducedMotion = useReducedMotion();
  const [tapHearts, setTapHearts] = useState<TapHeart[]>([]);

  useEffect(() => {
    if (reducedMotion) return;

    function spawn(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      // Não nasce coração ao tocar em campos de texto
      if (target?.closest("input, textarea, select")) return;

      const burst: TapHeart[] = Array.from({ length: 2 }, (_, i) => ({
        id: nextId++,
        x: event.clientX + (i === 0 ? 0 : (nextId % 2 === 0 ? -1 : 1) * (10 + (nextId % 14))),
        y: event.clientY - (i === 0 ? 0 : 6),
        char: TAP_CHARS[nextId % TAP_CHARS.length],
        rot: ((nextId * 37) % 32) - 16,
        size: 16 + ((nextId * 13) % 12),
        color: TAP_COLORS[nextId % TAP_COLORS.length],
      }));

      setTapHearts((current) => [...current.slice(-22), ...burst]);
      const ids = burst.map((b) => b.id);
      setTimeout(() => {
        setTapHearts((current) => current.filter((h) => !ids.includes(h.id)));
      }, 950);
    }

    window.addEventListener("pointerdown", spawn);
    return () => window.removeEventListener("pointerdown", spawn);
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      {/* Camada ambiente (atrás do conteúdo) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {AMBIENT.map((h, i) => (
          <span
            key={i}
            className="ambient-heart select-none"
            style={
              {
                left: h.left,
                fontSize: h.size,
                color: h.color,
                "--dur": `${h.dur}s`,
                "--delay": `${h.delay}s`,
                "--sway": `${(i % 2 === 0 ? 1 : -1) * (14 + i * 3)}px`,
                "--heart-opacity": h.opacity,
              } as React.CSSProperties
            }
          >
            {h.char}
          </span>
        ))}
      </div>

      {/* Corações nascidos do toque (acima do conteúdo, sem capturar eventos) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
        {tapHearts.map((h) => (
          <span
            key={h.id}
            className="tap-heart select-none"
            style={
              {
                left: h.x,
                top: h.y,
                fontSize: h.size,
                color: h.color,
                "--rot": `${h.rot}deg`,
              } as React.CSSProperties
            }
          >
            {h.char}
          </span>
        ))}
      </div>
    </>
  );
}
