# 💝 Site do Dia dos Namorados

Uma experiência interativa de uma página só: ela escaneia o QR Code da
carta, percorre uma jornada romântica (com o bonequinho guia, fotos,
quiz, oráculo de verdades…) e, no final, digita uma senha secreta para
desbloquear um gift card da Shein.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · canvas-confetti

---

## 🚀 Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # e preencha os valores (ver abaixo)
npm run dev
```

Abra http://localhost:3000.

> O `.env.local` já está com os valores REAIS: senha `19/03/2022`
> (aceita em qualquer formato: `19032022`, `19 de março de 2022`…)
> e os dados do gift card da Shein.

Build de produção:

```bash
npm run build
npm start
```

---

## 🔐 Configurando senha e gift card (`.env.local`)

| Variável | O que é |
| --- | --- |
| `UNLOCK_PASSWORD` | A senha romântica que ela digita no cofre. A comparação ignora maiúsculas, acentos e espaços nas pontas. |
| `SHEIN_GIFT_CARD_NUMBER` | Número do gift card (só é enviado ao navegador APÓS a senha correta). |
| `SHEIN_GIFT_CARD_PIN` | PIN do gift card (idem). |

Esses valores ficam **somente no servidor** (rota `src/app/api/unlock/route.ts`).
Nada disso vai para o bundle do front-end, e o `.env.local` está no
`.gitignore` — nunca será commitado.

---

## ✏️ Onde editar cada coisa

| O quê | Onde |
| --- | --- |
| **Todos os textos** (títulos, falas do guia, motivos, promessas, quiz, verdades…) | `src/lib/texts.ts` — já personalizado (Guizão ♥ Nath); edite qualquer frase à vontade |
| **Dicas progressivas do cofre** | `src/lib/hints.ts` (a 5ª dica é o lugar ideal para uma pista concreta da SUA senha) |
| **Papéis das fotos** (qual vai na linha do tempo, no clímax, ordem da galeria) | `src/lib/photos.ts` |
| **Legendas manuscritas das fotos** | `src/lib/texts.ts` → `gallery.captions` e `moments.items` |
| **Playlist de músicas** | `src/lib/playlist.ts` (arquivos em `public/audio/`) |
| **Seções/ordem da página** | `src/app/page.tsx` |
| **Cores e fontes** | `src/app/globals.css` (tokens) e `src/app/layout.tsx` (fontes) |

---

## 📸 Trocando as fotos do casal

As fotos otimizadas vivem em `public/photos/` e são geradas por script
(converte HEIC → JPEG, redimensiona, **remove EXIF/GPS por privacidade**
e gera os placeholders de blur):

```bash
node scripts/convert-photos.mjs /caminho/para/pasta-com-fotos
```

Os ids `foto-01`…`foto-NN` seguem a ordem alfabética dos arquivos de
origem. Depois de rodar, ajuste os papéis em `src/lib/photos.ts` se quiser.

A ilustração "do futuro" (fim do clímax) tem script próprio:

```bash
node scripts/convert-future.mjs /caminho/para/imagem.png
```

## 🎵 Playlist (trilha sonora)

As músicas ficam em `public/audio/` e a lista em `src/lib/playlist.ts`:

```ts
export const playlist: Track[] = [
  { title: "Yellow", artist: "Coldplay", src: "/audio/musica-1.mp3" },
  { title: "Outra música", artist: "Artista", src: "/audio/musica-2.mp3" },
];
```

- **Formato recomendado:** MP3 (128–192 kbps é o equilíbrio ideal de
  qualidade × peso). AAC/M4A também funciona nos navegadores modernos.
- **Autoplay:** navegadores bloqueiam áudio sem interação. Por isso a
  música só começa quando ela toca em "Começar a experiência com música"
  no Hero (ou na pílula "tocar nossa trilha" no canto da tela).
- O player toca as faixas em sequência, volta pra primeira no final e
  segue tocando durante todo o scroll. Volume inicia baixo (~0.28) com
  fade-in suave (via Web Audio, funciona inclusive no iPhone).
- Se a lista estiver vazia (ou os arquivos não existirem), o player
  desaparece sozinho e o botão do Hero vira só "Começar a jornada".

## 🧸 Trocando as imagens do bonequinho guia

As 9 variantes já estão em `public/guide/` (veja `public/guide/README.md`).
Para reprocessar artes novas (remove fundo branco/xadrez, otimiza):

```bash
node scripts/convert-guide.mjs /caminho/para/pasta-com-guia-*.png
```

Para mudar a variante usada numa seção, troque a prop `variant` do
`<GuideBubble />` na seção correspondente (`src/components/*.tsx`).

---

## ☁️ Deploy na Vercel

1. Suba o repositório para o GitHub (o `.env.local` não vai junto, é ignorado).
2. Em [vercel.com](https://vercel.com) → **Add New Project** → importe o repo
   (framework Next.js é detectado sozinho; nenhum ajuste necessário).
3. Antes do primeiro deploy, em **Settings → Environment Variables**, adicione:
   - `UNLOCK_PASSWORD`
   - `SHEIN_GIFT_CARD_NUMBER`
   - `SHEIN_GIFT_CARD_PIN`
4. Deploy. Gere o QR Code apontando para a URL final (ex.:
   `npx qrcode <url>` no terminal, ou qualquer gerador online).

Alternativa sem GitHub: `npx vercel` na raiz do projeto e siga o assistente
(depois configure as variáveis com `npx vercel env add`).

> O site já envia `noindex` + `robots.txt` bloqueando buscadores —
> as fotos de vocês não vão parar no Google.

---

## 🗂 Estrutura

```
src/
  app/
    page.tsx              # montagem das seções
    layout.tsx            # fontes, metadata, atmosfera
    globals.css           # design system (cores, animações)
    api/unlock/route.ts   # validação da senha + gift card (server-side)
    robots.ts             # bloqueia indexação
  components/
    Hero.tsx              # abertura cinematográfica
    JourneyIntro.tsx      # boas-vindas + regras
    MomentsTimeline.tsx   # momentos com fotos + parallax
    TruthOracle.tsx       # botão de verdades absolutas
    LoveReasons.tsx       # cards que viram (motivos)
    CoupleQuiz.tsx        # quiz impossível de errar
    TechReport.tsx        # laudo cômico com barras animadas
    Promises.tsx          # promessas
    PhotoGallery.tsx      # museu de polaroids (scroll horizontal)
    EmotionalClimax.tsx   # carta final + foto da rosa
    GiftVault.tsx         # cofre com senha, dicas e gift card
    GuideBubble.tsx       # o bonequinho guia
    FloatingHearts.tsx    # corações ambiente + corações no toque
    Polaroid.tsx / Reveal.tsx / SectionTitle.tsx / ScrollProgress.tsx
  lib/
    texts.ts              # TODOS os textos editáveis
    hints.ts              # dicas progressivas do cofre
    photos.ts             # catálogo/papéis das fotos
scripts/
  convert-photos.mjs      # otimiza fotos do casal (HEIC → JPEG, sem GPS)
  convert-guide.mjs       # recorta fundo e otimiza o bonequinho
```
