"use client";

import { useReducedMotion } from "motion/react";
import { floatingStickers } from "@/lib/floatingStickers";

/**
 * Camada decorativa: caricaturas do casal ATRAVESSANDO o fundo em loop.
 *
 * Cada sticker entra por uma borda e sai pela borda oposta, no sentido da
 * sua direção, reiniciando em seguida — um fluxo contínuo de carinhas
 * flutuando pela tela. Como cada uma cruza a tela inteira, mesmo no celular
 * (onde mostramos poucas ao mesmo tempo) dá pra ver todas com o tempo.
 *
 * Hierarquia visual:
 *   atmosphere/gradiente (z -10)  ->  ESTES STICKERS (z 0)  ->  conteúdo (z 10)
 *
 * - pointer-events: none  → nunca rouba clique/scroll/toque
 * - aria-hidden + alt=""   → puramente decorativo p/ leitores de tela
 * - prefers-reduced-motion → ficam parados (sem animação)
 * - Animação 100% CSS (transform + opacity) → leve na GPU, sem re-render
 */

// ——— Controles fáceis de ajustar ———————————————————————————————
const STICKER_OPACITY = 0.18; // opacidade-base desktop
const MOBILE_STICKER_OPACITY = 0.12; // opacidade-base mobile
// velocidade: duração de cada travessia sai das placements (menor = mais rápido)
// ————————————————————————————————————————————————————————————————

type Dir = "lr" | "rl" | "tb" | "bt" | "diag-dr" | "diag-ur" | "diag-dl" | "diag-ul";

type Placement = {
  /** id de um item de floatingStickers */
  sticker: string;
  /** direção da travessia */
  dir: Dir;
  /** "pista" perpendicular: vh p/ horizontais, vw p/ verticais (0–100) */
  lane: number;
  /** tamanho em px no desktop (mobile = ~78%) */
  size: number;
  /** multiplicador sobre a opacidade-base */
  opacityScale: number;
  /** segundos de uma travessia completa (menor = mais rápido) */
  duration: number;
  /** atraso; negativo = já começa no meio do caminho */
  delay: number;
  rotFrom: number;
  rotTo: number;
  scale: number;
  /** aparece também no mobile? */
  mobile: boolean;
};

// 14 travessias com direções variadas, pistas espalhadas e velocidades
// diferentes. Delays negativos pré-distribuem as carinhas pela tela já no
// carregamento (algumas entrando, outras já no meio do caminho).
const PLACEMENTS: Placement[] = [
  { sticker: "gui-sorrindo",        dir: "lr",      lane: 12, size: 130, opacityScale: 1,    duration: 24, delay: -2,  rotFrom: -8, rotTo: 8,   scale: 1, mobile: true },
  { sticker: "ela-apaixonada",      dir: "rl",      lane: 22, size: 136, opacityScale: 1.05, duration: 27, delay: -14, rotFrom: 7,  rotTo: -7,  scale: 1, mobile: true },
  { sticker: "gui-comendo-pizza",   dir: "bt",      lane: 80, size: 138, opacityScale: 1,    duration: 30, delay: -6,  rotFrom: 5,  rotTo: -6,  scale: 1, mobile: true },
  { sticker: "ela-comendo-alface",  dir: "diag-ur", lane: 70, size: 132, opacityScale: 1,    duration: 32, delay: -20, rotFrom: -6, rotTo: 6,   scale: 1, mobile: true },
  { sticker: "ela-sorrindo",        dir: "tb",      lane: 8,  size: 118, opacityScale: 0.95, duration: 26, delay: -10, rotFrom: -9, rotTo: 5,   scale: 1, mobile: true },
  { sticker: "gui-bebendo-cerveja", dir: "rl",      lane: 62, size: 124, opacityScale: 0.95, duration: 29, delay: -23, rotFrom: 8,  rotTo: -6,  scale: 1, mobile: true },
  { sticker: "gui-safado",          dir: "lr",      lane: 45, size: 116, opacityScale: 0.85, duration: 22, delay: -16, rotFrom: 4,  rotTo: -9,  scale: 1, mobile: true },
  { sticker: "ela-debochada",       dir: "diag-dr", lane: 20, size: 114, opacityScale: 0.85, duration: 33, delay: -4,  rotFrom: -7, rotTo: 8,   scale: 1, mobile: false },
  { sticker: "gui-babando",         dir: "bt",      lane: 32, size: 110, opacityScale: 0.8,  duration: 28, delay: -12, rotFrom: 6,  rotTo: -7,  scale: 1, mobile: false },
  { sticker: "ela-brava",           dir: "lr",      lane: 72, size: 112, opacityScale: 0.8,  duration: 25, delay: -19, rotFrom: -9, rotTo: 7,   scale: 1, mobile: false },
  { sticker: "gui-fumando",         dir: "diag-ul", lane: 40, size: 104, opacityScale: 0.7,  duration: 34, delay: -8,  rotFrom: 8,  rotTo: -5,  scale: 1, mobile: false },
  { sticker: "ela-cansada",         dir: "tb",      lane: 88, size: 110, opacityScale: 0.75, duration: 27, delay: -25, rotFrom: -5, rotTo: 9,   scale: 1, mobile: false },
  { sticker: "ela-emburrada",       dir: "rl",      lane: 38, size: 100, opacityScale: 0.7,  duration: 31, delay: -3,  rotFrom: 5,  rotTo: -8,  scale: 1, mobile: false },
  { sticker: "gui-apaixonado",      dir: "diag-dl", lane: 55, size: 122, opacityScale: 0.9,  duration: 30, delay: -17, rotFrom: -6, rotTo: 7,   scale: 1, mobile: true },
];

const byId = new Map(floatingStickers.map((s) => [s.id, s]));

// Constrói o vetor de entrada→saída (em vw/vh) a partir da direção + pista.
function path(dir: Dir, lane: number) {
  const OFF = 32; // o quanto fica fora da tela antes de entrar/depois de sair
  const NEAR = -OFF;
  const FAR = 100 + OFF;
  const d = 28; // deslocamento vertical/horizontal das diagonais
  switch (dir) {
    case "lr":
      return { fx: `${NEAR}vw`, fy: `${lane}vh`, tx: `${FAR}vw`, ty: `${lane}vh` };
    case "rl":
      return { fx: `${FAR}vw`, fy: `${lane}vh`, tx: `${NEAR}vw`, ty: `${lane}vh` };
    case "tb":
      return { fx: `${lane}vw`, fy: `${NEAR}vh`, tx: `${lane}vw`, ty: `${FAR}vh` };
    case "bt":
      return { fx: `${lane}vw`, fy: `${FAR}vh`, tx: `${lane}vw`, ty: `${NEAR}vh` };
    case "diag-dr": // entra em cima-esquerda, sai embaixo-direita
      return { fx: `${NEAR}vw`, fy: `${lane - d}vh`, tx: `${FAR}vw`, ty: `${lane + d}vh` };
    case "diag-ur": // entra embaixo-esquerda, sai em cima-direita
      return { fx: `${NEAR}vw`, fy: `${lane + d}vh`, tx: `${FAR}vw`, ty: `${lane - d}vh` };
    case "diag-dl": // entra em cima-direita, sai embaixo-esquerda
      return { fx: `${FAR}vw`, fy: `${lane - d}vh`, tx: `${NEAR}vw`, ty: `${lane + d}vh` };
    case "diag-ul": // entra embaixo-direita, sai em cima-esquerda
      return { fx: `${FAR}vw`, fy: `${lane + d}vh`, tx: `${NEAR}vw`, ty: `${lane - d}vh` };
  }
}

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
        const { fx, fy, tx, ty } = path(p.dir, p.lane);
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
                "--w": `${p.size}px`,
                width: "var(--w)",
                height: "auto",
                "--op": p.opacityScale,
                "--dur": `${p.duration}s`,
                "--delay": `${p.delay}s`,
                "--fx": fx,
                "--fy": fy,
                "--tx": tx,
                "--ty": ty,
                "--rot-from": `${p.rotFrom}deg`,
                "--rot-to": `${p.rotTo}deg`,
                "--scl": p.scale,
                animationPlayState: reducedMotion ? "paused" : "running",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
