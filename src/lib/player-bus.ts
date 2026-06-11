/**
 * Mini barramento de eventos para o botão do Hero conseguir dar
 * play no MusicPlayer sem acoplamento entre os componentes.
 *
 * Importante: o emit é síncrono, então o áudio inicia dentro do
 * mesmo clique da usuária (exigência das políticas de autoplay).
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export function onPlayerStart(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function requestPlayerStart(): void {
  listeners.forEach((listener) => listener());
}
