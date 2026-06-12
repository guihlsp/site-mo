/**
 * ============================================================
 * RÁDIO GUIZÃO FM — alinhamento da programação
 * ============================================================
 *
 * A "rádio" intercala VINHETAS (locuções já mixadas, com voz + trilha)
 * e MÚSICAS, tocando uma após a outra como faixas normais da playlist.
 *
 * - Vinhetas: /public/audio/radio/0N-*.mp3 (nomes preservados)
 * - Músicas:  /public/audio/musica-N.mp3 (as que já existiam no projeto)
 *
 * Para mexer na ordem, é só reordenar o array `radioPlaylist`.
 */

import { playlist } from "./playlist";

export type RadioTrackType = "radio" | "music";

export type RadioTrack = {
  id: string;
  type: RadioTrackType;
  title: string;
  artist: string;
  src: string;
};

const LOCUTOR = "Locutor oficial do caos romântico";

const vinheta = (id: string, title: string, file: string): RadioTrack => ({
  id,
  type: "radio",
  title,
  artist: LOCUTOR,
  src: `/audio/radio/${file}`,
});

// Pega a metadata da música (título/artista/src) já definida em playlist.ts
const musica = (index: number, id: string): RadioTrack => {
  const t = playlist[index];
  return { id, type: "music", title: t.title, artist: t.artist, src: t.src };
};

export const radioPlaylist: RadioTrack[] = [
  vinheta("abertura-yellow", "Abertura da Rádio Guizão FM", "01-abertura-yellow.mp3"),
  musica(0, "yellow"),
  vinheta("yellow-sparks", "Vinheta: Yellow → Sparks", "02-yellow-sparks.mp3"),
  musica(1, "sparks"),
  vinheta("sparks-best-part", "Vinheta: Sparks → Best Part", "03-sparks-best-part.mp3"),
  musica(2, "best-part"),
  vinheta("best-part-those-eyes", "Vinheta: Best Part → Those Eyes", "04-best-part-those-eyes.mp3"),
  musica(3, "those-eyes"),
  vinheta("those-eyes-like-i-want-u", "Vinheta: Those Eyes → Like I Want You", "05-those-eyes-like-i-want-u.mp3"),
  musica(4, "like-i-want-you"),
  vinheta("like-i-want-u-lay-me-down", "Vinheta: Like I Want You → Lay Me Down", "06-like-i-want-u-lay-me-down.mp3"),
  musica(5, "lay-me-down"),
  vinheta("encerramento", "Encerramento da Rádio Guizão FM", "07-encerramento.mp3"),
];
