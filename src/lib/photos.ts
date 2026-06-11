/**
 * Catálogo das fotos do casal.
 *
 * As imagens vivem em /public/photos e são geradas pelo script
 * `node scripts/convert-photos.mjs <pasta-de-origem>`, que converte
 * HEIC → JPEG, otimiza, remove metadados (GPS!) e atualiza o
 * manifesto `photo-manifest.json` (dimensões + placeholder de blur).
 *
 * Para trocar as fotos: rode o script de novo apontando para a nova
 * pasta — os papéis abaixo (momentos, clímax, galeria) usam os ids
 * `foto-01`…`foto-NN` em ordem alfabética da pasta de origem.
 */
import futureManifest from "./future-photo.json";
import manifest from "./photo-manifest.json";

export type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};

export const photos = manifest as Photo[];

const byId = new Map(photos.map((p) => [p.id, p]));

export function photoById(id: string): Photo {
  const photo = byId.get(id);
  if (!photo) {
    throw new Error(
      `Foto "${id}" não encontrada no manifesto. Rode: node scripts/convert-photos.mjs`,
    );
  }
  return photo;
}

/** Foto de destaque do clímax emocional (a do vestido vermelho). */
export const climaxPhotoId = "foto-02";

/**
 * A ilustração "do futuro" (família + pitbull no pôr do sol), exibida
 * no fim do clímax. Para trocar, rode:
 *   node scripts/convert-future.mjs /caminho/para/imagem.png
 */
export const futurePhoto = futureManifest as Photo;

/** Ordem de exibição da galeria (todas as fotos, embaralhadas com intenção). */
export const galleryOrder = [
  "foto-02",
  "foto-09",
  "foto-03",
  "foto-01",
  "foto-06",
  "foto-08",
  "foto-04",
  "foto-10",
  "foto-05",
  "foto-07",
];
