/**
 * Converte e otimiza as fotos do casal para uso no site.
 *
 * - Converte HEIC (iPhone) para JPEG
 * - Redimensiona para no máximo 1600px no maior lado
 * - Remove TODOS os metadados (EXIF/GPS) por privacidade
 * - Gera blurDataURL (placeholder de carregamento) para cada foto
 * - Escreve as fotos em public/photos/ e o manifesto em src/lib/photo-manifest.json
 *
 * Uso:
 *   node scripts/convert-photos.mjs [pasta-de-origem]
 *
 * Se a pasta não for informada, usa a variável PHOTO_SOURCE ou o padrão abaixo.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import heicConvert from "heic-convert";

const DEFAULT_SOURCE = "/mnt/c/Users/Guilherme/Desktop/site_mo";
const sourceDir = process.argv[2] || process.env.PHOTO_SOURCE || DEFAULT_SOURCE;
const outDir = path.resolve("public/photos");
const manifestPath = path.resolve("src/lib/photo-manifest.json");

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 82;

const isHeic = (name) => /\.heic$/i.test(name);
const isImage = (name) => /\.(jpe?g|png|webp|heic)$/i.test(name);

async function decodeToBuffer(filePath) {
  const raw = await readFile(filePath);
  if (isHeic(filePath)) {
    // libheif aplica rotação/espelhamento embutidos no HEIC automaticamente
    return Buffer.from(await heicConvert({ buffer: raw, format: "JPEG", quality: 1 }));
  }
  return raw;
}

async function main() {
  const entries = (await readdir(sourceDir)).filter(isImage).sort();
  if (entries.length === 0) {
    console.error(`Nenhuma imagem encontrada em ${sourceDir}`);
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });
  const manifest = [];

  for (let i = 0; i < entries.length; i++) {
    const name = entries[i];
    const id = `foto-${String(i + 1).padStart(2, "0")}`;
    const outFile = `${id}.jpg`;
    process.stdout.write(`→ ${name} … `);

    const input = await decodeToBuffer(path.join(sourceDir, name));

    // .rotate() sem argumentos aplica a orientação EXIF e depois descarta os metadados
    const pipeline = sharp(input).rotate().resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    });

    const { data, info } = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    await writeFile(path.join(outDir, outFile), data);

    const blur = await sharp(data)
      .resize(16, 16, { fit: "inside" })
      .blur(1)
      .jpeg({ quality: 40 })
      .toBuffer();

    manifest.push({
      id,
      src: `/photos/${outFile}`,
      width: info.width,
      height: info.height,
      blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}`,
    });

    console.log(`${outFile} (${info.width}x${info.height}, ${(data.length / 1024).toFixed(0)} KB)`);
  }

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ ${manifest.length} fotos em public/photos/ + manifesto em src/lib/photo-manifest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
