/**
 * Prepara as imagens do bonequinho guia para o site.
 *
 * As artes originais vieram com o fundo "transparente" gravado nos
 * pixels (quase-branco). Este script:
 *   1. Remove o fundo com flood-fill a partir das bordas
 *      (preserva brancos internos: dentes, corrente, olhos…)
 *   2. Remove buracos internos fechados de fundo (ex.: vão do braço)
 *   3. Limpa o halo branco das bordas
 *   4. Apara as margens vazias e redimensiona para 512px de altura
 *   5. Salva PNG otimizado com transparência em public/guide/
 *
 * Uso:
 *   node scripts/convert-guide.mjs [pasta-com-os-guia-*.png]
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = process.argv[2] || "/tmp/guia_zip/fotos site_mo";
const outDir = path.resolve("public/guide");
const TARGET_HEIGHT = 512;

// Pixel de fundo: praticamente neutro e muito claro
function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min <= 10 && min >= 238;
}

async function processOne(filePath, outFile) {
  const { data, info } = await sharp(filePath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const N = W * H;
  const alpha = new Uint8Array(N).fill(255);

  const rgbAt = (idx) => [data[idx * C], data[idx * C + 1], data[idx * C + 2]];
  const bgAt = (idx) => isBackground(...rgbAt(idx));

  // ---- 1. Flood-fill a partir de todas as bordas -----------------
  const visited = new Uint8Array(N);
  const stack = [];
  const pushIf = (idx) => {
    if (!visited[idx] && bgAt(idx)) {
      visited[idx] = 1;
      stack.push(idx);
    }
  };
  for (let x = 0; x < W; x++) {
    pushIf(x);
    pushIf((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    pushIf(y * W);
    pushIf(y * W + W - 1);
  }
  while (stack.length) {
    const idx = stack.pop();
    alpha[idx] = 0;
    const x = idx % W;
    if (x > 0) pushIf(idx - 1);
    if (x < W - 1) pushIf(idx + 1);
    if (idx >= W) pushIf(idx - W);
    if (idx < N - W) pushIf(idx + W);
  }

  // ---- 2. Regiões internas fechadas de fundo ---------------------
  // (vãos entre braço e corpo etc.) Só viram transparência regiões
  // grandes e bem claras — olhos/dentes ficam intactos.
  const labeled = new Uint8Array(N);
  for (let start = 0; start < N; start++) {
    if (labeled[start] || alpha[start] === 0 || !bgAt(start)) continue;
    const region = [];
    const rstack = [start];
    labeled[start] = 1;
    let lumSum = 0;
    while (rstack.length) {
      const idx = rstack.pop();
      region.push(idx);
      const [r, g, b] = rgbAt(idx);
      lumSum += (r + g + b) / 3;
      const x = idx % W;
      const neigh = [];
      if (x > 0) neigh.push(idx - 1);
      if (x < W - 1) neigh.push(idx + 1);
      if (idx >= W) neigh.push(idx - W);
      if (idx < N - W) neigh.push(idx + W);
      for (const n of neigh) {
        if (!labeled[n] && alpha[n] !== 0 && bgAt(n)) {
          labeled[n] = 1;
          rstack.push(n);
        }
      }
    }
    const avgLum = lumSum / region.length;
    if (region.length >= 1200 && avgLum >= 246) {
      for (const idx of region) alpha[idx] = 0;
    }
  }

  // ---- 3. Limpeza do halo claro nas bordas (2 passadas) ----------
  for (let pass = 0; pass < 2; pass++) {
    const toClear = [];
    for (let idx = 0; idx < N; idx++) {
      if (alpha[idx] === 0) continue;
      const x = idx % W;
      const nearTransparent =
        (x > 0 && alpha[idx - 1] === 0) ||
        (x < W - 1 && alpha[idx + 1] === 0) ||
        (idx >= W && alpha[idx - W] === 0) ||
        (idx < N - W && alpha[idx + W] === 0);
      if (!nearTransparent) continue;
      const [r, g, b] = rgbAt(idx);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min <= 16 && min >= 226) toClear.push(idx);
    }
    for (const idx of toClear) alpha[idx] = 0;
  }

  // ---- 4. Caixa de conteúdo + RGBA final -------------------------
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let idx = 0; idx < N; idx++) {
    if (alpha[idx] === 0) continue;
    const x = idx % W;
    const y = (idx / W) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);

  const rgba = Buffer.alloc(N * 4);
  for (let idx = 0; idx < N; idx++) {
    rgba[idx * 4] = data[idx * C];
    rgba[idx * 4 + 1] = data[idx * C + 1];
    rgba[idx * 4 + 2] = data[idx * C + 2];
    rgba[idx * 4 + 3] = alpha[idx];
  }

  const out = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize({ height: TARGET_HEIGHT, fit: "inside", withoutEnlargement: true })
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toBuffer();

  await sharp(out).toFile(outFile);
  return out.length;
}

const files = (await readdir(sourceDir)).filter((f) => /\.png$/i.test(f)).sort();
if (files.length === 0) {
  console.error(`Nenhum .png encontrado em ${sourceDir}`);
  process.exit(1);
}

for (const file of files) {
  const outFile = path.join(outDir, file.toLowerCase());
  const bytes = await processOne(path.join(sourceDir, file), outFile);
  console.log(`✓ ${file} → public/guide/${file.toLowerCase()} (${(bytes / 1024).toFixed(0)} KB)`);
}
console.log(`\n${files.length} imagens do guia prontas.`);
