/**
 * Lista central das caricaturas recortadas (Gui e Mo) usadas como
 * stickers decorativos flutuando no fundo do site.
 *
 * Os arquivos foram recortados a partir das sheets originais, com o
 * fundo xadrez de transparência removido e exportados como WebP com
 * alpha real (ver /public/stickers).
 */

export type FloatingSticker = {
  id: string;
  src: string;
  alt: string;
  /** "gui" | "mo" — útil para balancear a presença dos dois */
  who: "gui" | "mo";
};

export const floatingStickers: FloatingSticker[] = [
  // Mo
  { id: "ela-sorrindo", src: "/stickers/ela-sorrindo.webp", alt: "Mo sorrindo", who: "mo" },
  { id: "ela-apaixonada", src: "/stickers/ela-apaixonada.webp", alt: "Mo apaixonada, coraçõezinhos ao redor", who: "mo" },
  { id: "ela-debochada", src: "/stickers/ela-debochada.webp", alt: "Mo debochada", who: "mo" },
  { id: "ela-emburrada", src: "/stickers/ela-emburrada.webp", alt: "Mo emburrada", who: "mo" },
  { id: "ela-brava", src: "/stickers/ela-brava.webp", alt: "Mo brava, bufando", who: "mo" },
  { id: "ela-cansada", src: "/stickers/ela-cansada.webp", alt: "Mo com sono", who: "mo" },
  { id: "ela-comendo-alface", src: "/stickers/ela-comendo-alface.webp", alt: "Mo comendo alface", who: "mo" },
  // Gui
  { id: "gui-sorrindo", src: "/stickers/gui-sorrindo.webp", alt: "Gui rindo", who: "gui" },
  { id: "gui-apaixonado", src: "/stickers/gui-apaixonado.webp", alt: "Gui apaixonado, olhos de coração", who: "gui" },
  { id: "gui-babando", src: "/stickers/gui-babando.webp", alt: "Gui babando, olhos de coração", who: "gui" },
  { id: "gui-safado", src: "/stickers/gui-safado.webp", alt: "Gui safado", who: "gui" },
  { id: "gui-comendo-pizza", src: "/stickers/gui-comendo-pizza.webp", alt: "Gui comendo pizza", who: "gui" },
  { id: "gui-bebendo-cerveja", src: "/stickers/gui-bebendo-cerveja.webp", alt: "Gui bebendo cerveja", who: "gui" },
  { id: "gui-fumando", src: "/stickers/gui-fumando.webp", alt: "Gui fumando um paiol", who: "gui" },
];
