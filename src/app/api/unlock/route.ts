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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  let attempt = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") {
      attempt = body.password.slice(0, 128);
    }
  } catch {
    return NextResponse.json({ success: false, error: "bad_request" }, { status: 400 });
  }

  // Pequena pausa: suspense dramático + desestímulo a força bruta.
  await delay(650);

  const expected = process.env.UNLOCK_PASSWORD;
  if (!expected) {
    // Sem logs do valor — apenas sinaliza configuração ausente.
    return NextResponse.json(
      { success: false, error: "not_configured" },
      { status: 500 },
    );
  }

  if (!attempt || !matches(attempt, expected)) {
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({
    success: true,
    giftCard: {
      number: process.env.SHEIN_GIFT_CARD_NUMBER ?? "",
      pin: process.env.SHEIN_GIFT_CARD_PIN ?? "",
    },
  });
}
