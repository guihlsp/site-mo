/** Rolagem suave e lenta, com easing próprio (mais devagar que a nativa). */
export function smoothScrollTo(top: number, duration = 1500) {
  const startY = window.scrollY;
  const dist = top - startY;
  let start: number | null = null;
  function step(ts: number) {
    if (start === null) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    // easeInOutQuad
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    window.scrollTo(0, startY + dist * eased);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/** Rola devagar até o topo do elemento, com uma folga (offset px do topo). */
export function smoothScrollToEl(el: HTMLElement, offset = 16, duration = 1600) {
  const top = window.scrollY + el.getBoundingClientRect().top - offset;
  smoothScrollTo(top, duration);
}
