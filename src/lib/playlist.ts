/**
 * ============================================================
 * A TRILHA SONORA DO SITE
 * ============================================================
 *
 * Coloque os arquivos .mp3 em /public/audio/ e liste-os aqui,
 * na ordem em que devem tocar. O player toca uma após a outra
 * e volta para a primeira no final.
 *
 * Se a lista ficar vazia, o player some sozinho e o site
 * continua funcionando normalmente.
 */

export type Track = {
  title: string;
  artist: string;
  src: string;
};

export const playlist: Track[] = [
  { title: "Yellow", artist: "Coldplay", src: "/audio/musica-1.mp3" },
  { title: "Sparks", artist: "Coldplay", src: "/audio/musica-2.mp3" },
  { title: "Best Part", artist: "Daniel Caesar, H.E.R.", src: "/audio/musica-3.mp3" },
  { title: "Those Eyes", artist: "New West", src: "/audio/musica-4.mp3" },
  { title: "Like I Want You", artist: "Giveon", src: "/audio/musica-5.mp3" },
  { title: "Lay Me Down", artist: "Sam Smith", src: "/audio/musica-6.mp3" },
];
