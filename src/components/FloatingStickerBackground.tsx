"use client";

import { useReducedMotion } from "motion/react";
import { floatingStickers } from "@/lib/floatingStickers";

/**
 * Camada decorativa: caricaturas do casal flutuando lentamente pelo fundo.
 *
 * Hierarquia visual:
 *   atmosphere/gradiente (z -10)  ->  ESTES STICKERS (z 0)  ->  conteúdo (z 10)
 *
 * - pointer-events: none  → nunca rouba clique/scroll/toque
 * - aria-hidden + alt=""   → puramente decorativo p/ leitores de tela
 * - prefers-reduced-motion → fica estático (sem animação)
 * - Animação 100% CSS (transform + opacity) → leve na GPU, sem re-render
 * - Posições fixas/determinísticas → sem layout shift e sem mismatch de hidratação
 */

// ——— Controles fáceis de ajustar ———————————————————————————————
const STICKER_OPACITY = 0.16; // opacidade-base desktop
const MOBILE_STICKER_OPACITY = 0.1; // opacidade-base mobile
// duração e tamanho saem das placements abaixo; mexa por sticker se quiser.
// ————————————————————————————————————————————————————————————————

type Placement = {
  /** id de um item de floatingStickers */
  sticker: string;
  top: string;
  left: string;
  /** tamanho em px no desktop (mobile = ~70%) */
  size: number;
  /** multiplicador sobre a opacidade-base */
  opacityScale: number;
  /** segundos (35–90) */
  duration: number;
  delay: number;
  /** deslocamento da deriva, em px */
  dx: number;
  dy: number;
  rotFrom: number;
  rotTo: number;
  /** escala no meio da animação */
  scaleTo: number;
  /** aparece também no mobile? (mantém o mobile mais limpo) */
  mobile: boolean;
};

// 13 posições espalhadas pelas bordas/cantos, evitando a faixa central
// (onde costuma ficar o texto). As marcadas com mobile:true são as poucas
// que sobrevivem no celular, sempre mais para as laterais.
const PLACEMENTS: Placement[] = [
  { sticker: "gui-sorrindo",        top: "8%",  left: "4%",  size: 132, opacityScale: 1,    duration: 64, delay: 0,  dx: 70,  dy: 50,  rotFrom: -8,  rotTo: 6,   scaleTo: 1.06, mobile: true },
  { sticker: "ela-apaixonada",      top: "16%", left: "82%", size: 138, opacityScale: 1.05, duration: 72, delay: 6,  dx: -60, dy: 64,  rotFrom: 7,   rotTo: -5,  scaleTo: 1.08, mobile: true },
  { sticker: "gui-comendo-pizza",   top: "70%", left: "78%", size: 140, opacityScale: 1,    duration: 80, delay: 12, dx: -50, dy: -70, rotFrom: 5,   rotTo: -8,  scaleTo: 1.05, mobile: true },
  { sticker: "ela-comendo-alface",  top: "78%", left: "6%",  size: 134, opacityScale: 1,    duration: 76, delay: 3,  dx: 64,  dy: -54, rotFrom: -6,  rotTo: 9,   scaleTo: 1.07, mobile: true },
  { sticker: "ela-sorrindo",        top: "44%", left: "1%",  size: 118, opacityScale: 0.95, duration: 58, delay: 18, dx: 40,  dy: 80,  rotFrom: -10, rotTo: 4,   scaleTo: 1.05, mobile: false },
  { sticker: "gui-bebendo-cerveja", top: "40%", left: "86%", size: 124, opacityScale: 0.95, duration: 68, delay: 9,  dx: -44, dy: -76, rotFrom: 9,   rotTo: -6,  scaleTo: 1.06, mobile: false },
  { sticker: "gui-safado",          top: "6%",  left: "40%", size: 110, opacityScale: 0.8,  duration: 85, delay: 22, dx: 56,  dy: 44,  rotFrom: 4,   rotTo: -10, scaleTo: 1.04, mobile: false },
  { sticker: "ela-debochada",       top: "88%", left: "44%", size: 112, opacityScale: 0.8,  duration: 82, delay: 14, dx: -52, dy: -48, rotFrom: -7, rotTo: 8,   scaleTo: 1.05, mobile: false },
  { sticker: "gui-babando",         top: "28%", left: "18%", size: 104, opacityScale: 0.7,  duration: 70, delay: 27, dx: 60,  dy: 60,  rotFrom: 6,   rotTo: -7,  scaleTo: 1.05, mobile: false },
  { sticker: "ela-brava",           top: "60%", left: "68%", size: 108, opacityScale: 0.75, duration: 74, delay: 33, dx: -58, dy: 50,  rotFrom: -9,  rotTo: 7,   scaleTo: 1.06, mobile: false },
  { sticker: "gui-fumando",         top: "30%", left: "60%", size: 100, opacityScale: 0.6,  duration: 88, delay: 40, dx: 48,  dy: -62, rotFrom: 8,   rotTo: -5,  scaleTo: 1.04, mobile: false },
  { sticker: "ela-cansada",         top: "84%", left: "26%", size: 110, opacityScale: 0.7,  duration: 78, delay: 47, dx: 54,  dy: -58, rotFrom: -5,  rotTo: 10,  scaleTo: 1.05, mobile: false },
  { sticker: "ela-emburrada",       top: "52%", left: "36%", size: 96,  opacityScale: 0.55, duration: 90, delay: 53, dx: -46, dy: 66,  rotFrom: 5,   rotTo: -9,  scaleTo: 1.03, mobile: false },
];

const byId = new Map(floatingStickers.map((s) => [s.id, s]));

export default function FloatingStickerBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="floating-stickers pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={
        {
          "--sticker-opacity": STICKER_OPACITY,
          "--sticker-opacity-mobile": MOBILE_STICKER_OPACITY,
        } as React.CSSProperties
      }
    >
      {PLACEMENTS.map((p, i) => {
        const sticker = byId.get(p.sticker);
        if (!sticker) return null;
        return (
          // Decorativo, fixo e já otimizado (WebP pequeno); next/image fill
          // só adicionaria custo/complexidade aqui.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={sticker.src}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            data-mobile={p.mobile ? "1" : "0"}
            className="floating-sticker select-none"
            style={
              {
                top: p.top,
                left: p.left,
                "--w": `${p.size}px`,
                width: "var(--w)",
                height: "auto",
                "--op": p.opacityScale,
                "--dur": `${p.duration}s`,
                "--delay": `${p.delay}s`,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--rot-from": `${p.rotFrom}deg`,
                "--rot-to": `${p.rotTo}deg`,
                "--scale-to": p.scaleTo,
                animationPlayState: reducedMotion ? "paused" : "running",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
