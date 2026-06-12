import { NextResponse } from "next/server";

/**
 * POST /api/unlock
 *
 * Recebe { password } e compara com a variável de ambiente privada
 * UNLOCK_PASSWORD. Somente em caso de acerto devolve os dados do
 * gift card (também privados). Nada disso chega ao bundle do front.
 *
 * Variáveis necessárias (ver .env.local.example):
 *   UNLOCK_PASSWORD
 *   SHEIN_GIFT_CARD_NUMBER
 *   SHEIN_GIFT_CARD_PIN
 */

// Comparação amigável: ignora acentos, maiúsculas e espaços nas pontas,
// para a senha não falhar por detalhe de digitação no celular.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Senhas que são datas aceitam qualquer formato: "19/03/2022",
// "19032022", "19 03 2022", "19.03.22", "19 de março de 2022"…
// tudo conta como a mesma senha.
function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

const MONTHS: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  marco: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

/** Tenta extrair uma data dd/mm/aaaa do texto, em qualquer formato. */
function canonicalDate(value: string): string | null {
  let v = normalize(value);
  for (const [name, num] of Object.entries(MONTHS)) {
    v = v.replace(name, ` ${num} `);
  }
  const match =
    v.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})/) ??
    v.match(/^\D*(\d{2})(\d{2})(\d{4})\D*$/);
  if (!match) return null;
  const [, day, month, rawYear] = match;
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function matches(attempt: string, expected: string): boolean {
  if (normalize(attempt) === normalize(expected)) return true;

  const attemptDigits = digitsOf(attempt);
  const expectedDigits = digitsOf(expected);
  if (expectedDigits.length >= 4 && attemptDigits === expectedDigits) return true;

  const attemptDate = canonicalDate(attempt);
  const expectedDate = canonicalDate(expected);
  return attemptDate !== null && expectedDate !== null && attemptDate === expectedDate;
}

// Camadas de identificação. As respostas ficam SÓ no ambiente do servidor
// (variáveis de ambiente na Vercel) — nunca no bundle do front nem no git.
//   UNLOCK_NAME, UNLOCK_BIRTHDAY, UNLOCK_CARIMBO
const EXPECTED_NAME = process.env.UNLOCK_NAME ?? "";
const EXPECTED_BIRTHDAY = process.env.UNLOCK_BIRTHDAY ?? "";
const EXPECTED_CARIMBO = process.env.UNLOCK_CARIMBO ?? "";

function nameMatches(attempt: string): boolean {
  return !!attempt && !!EXPECTED_NAME && normalize(attempt) === normalize(EXPECTED_NAME);
}

function carimboMatches(attempt: string): boolean {
  return !!attempt && !!EXPECTED_CARIMBO && matches(attempt, EXPECTED_CARIMBO);
}

/** Extrai dia/mês de um texto (aceita "10/04", "1004", "10-04", "10 de abril"). */
function dayMonth(value: string): string | null {
  let v = normalize(value);
  for (const [name, num] of Object.entries(MONTHS)) v = v.replace(name, ` ${num} `);
  const m = v.match(/(\d{1,2})\D+(\d{1,2})/) ?? v.match(/^\D*(\d{2})(\d{2})\D*$/);
  if (!m) return null;
  return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}`;
}

function birthdayMatches(attempt: string): boolean {
  const a = dayMonth(attempt);
  const e = dayMonth(EXPECTED_BIRTHDAY);
  return a !== null && e !== null && a === e;
}

type Layer = "name" | "birthday" | "carimbo";
function layerMatches(layer: Layer, value: string): boolean {
  if (layer === "name") return nameMatches(value);
  if (layer === "birthday") return birthdayMatches(value);
  return carimboMatches(value);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  let attempt = "";
  let name = "";
  let birthday = "";
  let carimbo = "";
  let check: Layer | null = null;
  let checkValue = "";
  try {
    const body = (await request.json()) as {
      password?: unknown;
      name?: unknown;
      birthday?: unknown;
      carimbo?: unknown;
      check?: unknown;
      value?: unknown;
    };
    if (typeof body.password === "string") attempt = body.password.slice(0, 128);
    if (typeof body.name === "string") name = body.name.slice(0, 128);
    if (typeof body.birthday === "string") birthday = body.birthday.slice(0, 64);
    if (typeof body.carimbo === "string") carimbo = body.carimbo.slice(0, 64);
    if (body.check === "name" || body.check === "birthday" || body.check === "carimbo") check = body.check;
    if (typeof body.value === "string") checkValue = body.value.slice(0, 128);
  } catch {
    return NextResponse.json({ success: false, error: "bad_request" }, { status: 400 });
  }

  // Pequena pausa: suspense + desestímulo a força bruta.
  await delay(450);

  const configured =
    !!process.env.UNLOCK_PASSWORD &&
    !!EXPECTED_NAME &&
    !!EXPECTED_BIRTHDAY &&
    !!EXPECTED_CARIMBO;
  if (!configured) {
    return NextResponse.json({ success: false, error: "not_configured" }, { status: 500 });
  }

  // Modo "checagem de camada": valida uma camada por vez durante o wizard,
  // sem revelar o cartão. As respostas nunca saem do servidor.
  if (check) {
    return NextResponse.json({ ok: layerMatches(check, checkValue) });
  }

  // Desbloqueio final: TODAS as camadas + a senha precisam bater.
  const expected = process.env.UNLOCK_PASSWORD as string;
  if (!nameMatches(name)) return NextResponse.json({ success: false, error: "name" });
  if (!birthdayMatches(birthday)) return NextResponse.json({ success: false, error: "birthday" });
  if (!carimboMatches(carimbo)) return NextResponse.json({ success: false, error: "carimbo" });
  if (!attempt || !matches(attempt, expected)) {
    return NextResponse.json({ success: false, error: "password" });
  }

  return NextResponse.json({
    success: true,
    giftCard: {
      number: process.env.SHEIN_GIFT_CARD_NUMBER ?? "",
      pin: process.env.SHEIN_GIFT_CARD_PIN ?? "",
    },
  });
}
