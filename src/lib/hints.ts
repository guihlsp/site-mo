/**
 * Dicas progressivas do cofre — a dica de índice N aparece após
 * a (N+1)ª tentativa errada. A última se repete indefinidamente.
 *
 * A senha configurada é a data em que vocês se conheceram
 * (19/03/2022). O servidor aceita a data em qualquer formato:
 * "19/03/2022", "19032022", "19 03 2022", "19 de março de 2022"…
 */
export const hints: string[] = [
  "Hmm… quase. Pensa em algo que tem a nossa cara.",
  "Dica: não é a senha do Wi-Fi. Mas confessa que você pensou nela.",
  "Agora uma dica justa: tem a ver com o nosso começo. Bem lá no começo do começo.",
  "Tá esquentando! Não é nome, não é apelido. É um DIA. Um dia muito específico e muito importante. 👀",
  "Última dica honrosa: o dia em que a gente se conheceu. Digita em números, com o ano completo.",
  "Respira. Toma uma água. Foi um sábado de março… dia 19… de um ano que terminava em 22. Vai, agora não tem como errar. 😌",
];

/** Retorna a dica certa para o número de tentativas erradas (1, 2, 3…). */
export function hintForAttempt(wrongAttempts: number): string {
  const index = Math.min(wrongAttempts - 1, hints.length - 1);
  return hints[Math.max(0, index)];
}
