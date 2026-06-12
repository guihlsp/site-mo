"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { onPlayerStart } from "@/lib/player-bus";
import { radioPlaylist } from "@/lib/radioPlaylist";
import { texts } from "@/lib/texts";

/**
 * Rádio Guizão FM — player fixo que intercala vinhetas (locuções) e músicas
 * como faixas normais da playlist (ver src/lib/radioPlaylist.ts).
 *
 * - Nunca tenta autoplay: o áudio só nasce após um toque dela (botão do Hero
 *   ou a pílula "ligar a rádio"). Se o navegador bloquear, mostra um aviso
 *   amigável pra ela tocar manualmente.
 * - Volume passa por um GainNode (Web Audio): fade-in e controle de volume
 *   funcionam até no iPhone.
 * - O <audio> é criado fora do JSX, só no cliente → sem erro de hidratação.
 * - Playlist vazia → o componente não renderiza nada.
 */

const FADE_SECONDS = 1.6;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

// 70% no desktop, 60% no mobile (decidido no cliente; SSR usa 0.7)
function initialVolume() {
  if (typeof window !== "undefined" && window.innerWidth < 640) return 0.6;
  return 0.7;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorCountRef = useRef(0);

  const [trackIndex, setTrackIndex] = useState(0);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [broken, setBroken] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  const total = radioPlaylist.length;
  const track = radioPlaylist[trackIndex];
  const nextTrackInfo = radioPlaylist[(trackIndex + 1) % total];
  const isRadio = track?.type === "radio";
  const typeLabel = isRadio ? texts.player.labelRadio : texts.player.labelMusic;

  function applyVolume(value: number) {
    if (gainRef.current) gainRef.current.gain.value = value;
    else if (audioRef.current) audioRef.current.volume = value;
  }

  function ensureAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      el.addEventListener("ended", () => {
        setTrackIndex((i) => (i + 1) % total);
      });
      el.addEventListener("playing", () => {
        errorCountRef.current = 0;
        setPlaying(true);
        setNeedsTap(false);
      });
      el.addEventListener("pause", () => setPlaying(false));
      el.addEventListener("error", () => {
        errorCountRef.current += 1;
        if (errorCountRef.current >= total) {
          setBroken(true);
          setPlaying(false);
        } else {
          setTrackIndex((i) => (i + 1) % total);
        }
      });
      audioRef.current = el;
    }
    return audioRef.current;
  }

  function setupAudioGraph(el: HTMLAudioElement) {
    if (ctxRef.current) return;
    try {
      const Ctx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(el);
      const gain = ctx.createGain();
      source.connect(gain);
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
    } catch {
      // sem Web Audio: cai no controle direto de volume (desktop ok)
    }
  }

  function fadeIn(target: number) {
    if (gainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      gainRef.current.gain.cancelScheduledValues(now);
      gainRef.current.gain.setValueAtTime(0.0001, now);
      gainRef.current.gain.linearRampToValueAtTime(Math.max(target, 0.0001), now + FADE_SECONDS);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0;
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    const step = target / (FADE_SECONDS * 20);
    fadeTimerRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const next = Math.min(target, audioRef.current.volume + step);
      audioRef.current.volume = next;
      if (next >= target && fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    }, 50);
  }

  // Início via botão do Hero (síncrono dentro do clique dela)
  function start() {
    if (total === 0 || broken) return;
    const el = ensureAudio();
    setupAudioGraph(el);
    ctxRef.current?.resume().catch(() => {});
    if (!el.src) el.src = radioPlaylist[0].src;
    fadeIn(muted ? 0 : volume);
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setNeedsTap(true));
    setActive(true);
  }

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  });
  useEffect(() => onPlayerStart(() => startRef.current()), []);

  // Troca de faixa (avanço automático ou prev/next)
  useEffect(() => {
    const el = audioRef.current;
    const src = radioPlaylist[trackIndex]?.src;
    if (!el || !active || !src) return;
    const absolute = new URL(src, window.location.origin).href;
    if (el.src !== absolute) {
      el.src = src;
      if (playing) el.play().catch(() => {});
    }
  }, [trackIndex, active, playing]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      audioRef.current?.pause();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  function togglePlay() {
    const el = ensureAudio();
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      ctxRef.current?.resume().catch(() => {});
      if (!el.src && total > 0) el.src = radioPlaylist[trackIndex].src;
      applyVolume(muted ? 0 : volume);
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setNeedsTap(true));
    }
  }

  function nextTrack() {
    if (total === 0) return;
    setTrackIndex((i) => (i + 1) % total);
  }
  function prevTrack() {
    if (total === 0) return;
    setTrackIndex((i) => (i - 1 + total) % total);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    applyVolume(next ? 0 : volume);
  }

  function changeVolume(value: number) {
    setVolume(value);
    if (muted && value > 0) setMuted(false);
    applyVolume(value);
  }

  if (total === 0 || broken) return null;

  return (
    <AnimatePresence mode="wait">
      {!active ? (
        // Pílula discreta antes do primeiro play
        <motion.button
          key="mini"
          type="button"
          onClick={start}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileTap={{ scale: 0.95 }}
          className="glass-strong fixed bottom-4 right-4 z-[75] flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-champanhe"
          aria-label={texts.player.miniLabel}
        >
          <span aria-hidden>🎙️</span>
          {texts.player.miniLabel}
        </motion.button>
      ) : (
        // Player completo — painel da Rádio Guizão FM
        <motion.section
          key="full"
          aria-label={texts.player.stationName}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="glass-strong fixed inset-x-4 bottom-4 z-[75] flex flex-col gap-2 rounded-2xl px-3.5 py-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[360px]"
        >
          {/* Cabeçalho da estação */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ouro">
              <span aria-hidden>🎙️</span>
              {texts.player.stationName}
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-rosa">
              <motion.span
                aria-hidden
                animate={playing ? { opacity: [1, 0.25, 1] } : { opacity: 0.4 }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block size-1.5 rounded-full bg-rosa-forte"
              />
              {texts.player.onAir}
            </span>
          </div>

          {/* Faixa atual */}
          <div className="flex items-center gap-3">
            {/* disco com ícone do tipo + equalizador quando tocando */}
            <div
              className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-ouro/40 bg-gradient-to-br from-vinho to-ameixa"
              aria-hidden
            >
              <span className="text-base">{isRadio ? "🎙️" : "♥"}</span>
              {playing && (
                <div className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 items-end gap-[2px]">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span
                      key={i}
                      className="w-[2px] rounded-full bg-rosa"
                      animate={{ height: [3, 9, 4, 7, 3] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5">
                <span
                  className={`shrink-0 rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-wider ${
                    isRadio ? "bg-ouro/20 text-champanhe" : "bg-rosa/20 text-blush"
                  }`}
                >
                  {typeLabel}
                </span>
                <span className="truncate text-[13px] font-semibold leading-tight text-creme">
                  {track.title}
                </span>
              </p>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.12em] text-rosado">
                {track.artist}
              </p>
            </div>
          </div>

          {/* a seguir / aviso de bloqueio + controles */}
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-[10px] text-rosado/70">
              {needsTap && !playing ? (
                <span className="text-blush">{texts.player.blockedMessage}</span>
              ) : (
                <>
                  <span className="text-rosado/50">{texts.player.upNext}: </span>
                  {nextTrackInfo.title}
                </>
              )}
            </p>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={prevTrack}
                aria-label={texts.player.ariaPrev}
                className="flex size-8 items-center justify-center rounded-full border border-blush/20 text-creme/90 transition-colors hover:border-rosa active:scale-95"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                  <path d="M10.5 1.6a.8.8 0 0 0-1.24-.67L4.16 4.67a.8.8 0 0 0 0 1.34l5.1 3.74a.8.8 0 0 0 1.24-.67z" />
                  <rect x="1.2" y="1" width="1.8" height="10" rx="0.9" />
                </svg>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? texts.player.ariaPause : texts.player.ariaPlay}
                className="flex size-10 items-center justify-center rounded-full bg-rosa-forte text-creme transition-colors hover:bg-rosa active:scale-95"
              >
                {playing ? (
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                    <rect x="1.5" y="1" width="3.2" height="10" rx="1" />
                    <rect x="7.3" y="1" width="3.2" height="10" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                    <path d="M2.5 1.3a1 1 0 0 1 1.5-.86l7 4.7a1 1 0 0 1 0 1.72l-7 4.7a1 1 0 0 1-1.5-.86z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={nextTrack}
                aria-label={texts.player.ariaNext}
                className="flex size-8 items-center justify-center rounded-full border border-blush/20 text-creme/90 transition-colors hover:border-rosa active:scale-95"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                  <path d="M1.5 1.6a.8.8 0 0 1 1.24-.67l5.1 3.74a.8.8 0 0 1 0 1.34l-5.1 3.74a.8.8 0 0 1-1.24-.67z" />
                  <rect x="9" y="1" width="1.8" height="10" rx="0.9" />
                </svg>
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? texts.player.ariaUnmute : texts.player.ariaMute}
                className="hidden size-8 items-center justify-center rounded-full border border-blush/20 text-creme/90 transition-colors hover:border-rosa active:scale-95 min-[420px]:flex"
              >
                <span className="text-[11px]" aria-hidden>
                  {muted ? "🔇" : "🔉"}
                </span>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label={texts.player.ariaVolume}
                className="hidden w-16 accent-rosa-forte sm:block"
              />
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
