/**
 * Prepara a imagem "do futuro" exibida no fim do clímax emocional.
 *
 * Converte/otimiza para JPEG (sem metadados), gera o placeholder de
 * blur e grava:
 *   public/photos/futuro.jpg
 *   src/lib/future-photo.json
 *
 * Uso:
 *   node scripts/convert-future.mjs /caminho/para/imagem.png
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const input = process.argv[2];
if (!input) {
  console.error("Informe o arquivo: node scripts/convert-future.mjs <imagem>");
  process.exit(1);
}

const outImage = path.resolve("public/photos/futuro.jpg");
const outManifest = path.resolve("src/lib/future-photo.json");

const { data, info } = await sharp(input)
  .rotate()
  .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toBuffer({ resolveWithObject: true });

await writeFile(outImage, data);

const blur = await sharp(data)
  .resize(16, 16, { fit: "inside" })
  .blur(1)
  .jpeg({ quality: 40 })
  .toBuffer();

const manifest = {
  id: "futuro",
  src: "/photos/futuro.jpg",
  width: info.width,
  height: info.height,
  blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
};

await writeFile(outManifest, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `✓ futuro.jpg (${info.width}x${info.height}, ${(data.length / 1024).toFixed(0)} KB) + future-photo.json`,
);
