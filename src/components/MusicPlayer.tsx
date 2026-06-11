"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { onPlayerStart } from "@/lib/player-bus";
import { playlist } from "@/lib/playlist";
import { texts } from "@/lib/texts";

/**
 * Player fixo da trilha sonora.
 *
 * - Nunca tenta autoplay: o áudio só nasce após um toque dela
 *   (botão do Hero ou a pílula "tocar nossa trilha").
 * - O volume passa por um GainNode (Web Audio): assim o fade-in e
 *   o controle de volume funcionam até no iPhone, onde o navegador
 *   bloqueia mudanças em HTMLAudioElement.volume.
 * - O elemento de áudio é criado fora do JSX, apenas no cliente,
 *   então não existe risco de erro de hidratação.
 * - Sem músicas em src/lib/playlist.ts, o componente não renderiza nada.
 */

const TARGET_VOLUME = 0.28;
const FADE_SECONDS = 2.4;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

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
  const [volume, setVolume] = useState(TARGET_VOLUME);
  const [broken, setBroken] = useState(false);

  const track = playlist[trackIndex];

  function applyVolume(value: number) {
    if (gainRef.current) {
      gainRef.current.gain.value = value;
    } else if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }

  function ensureAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "auto";
      el.addEventListener("ended", () => {
        setTrackIndex((i) => (i + 1) % playlist.length);
      });
      el.addEventListener("playing", () => {
        errorCountRef.current = 0;
      });
      el.addEventListener("error", () => {
        errorCountRef.current += 1;
        if (errorCountRef.current >= playlist.length) {
          // nenhuma faixa carrega (arquivos ausentes): esconde o player
          setBroken(true);
          setPlaying(false);
        } else {
          setTrackIndex((i) => (i + 1) % playlist.length);
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
    // fallback sem Web Audio
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
    if (playlist.length === 0 || broken) return;
    const el = ensureAudio();
    setupAudioGraph(el);
    ctxRef.current?.resume().catch(() => {});
    if (!el.src) el.src = playlist[0].src;
    fadeIn(muted ? 0 : volume);
    el.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // bloqueado: mostra o player mesmo assim para ela dar play manual
      });
    setActive(true);
  }

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  });
  useEffect(() => onPlayerStart(() => startRef.current()), []);

  // Troca de faixa (avanço automático ou botão "próxima")
  useEffect(() => {
    const el = audioRef.current;
    const src = playlist[trackIndex]?.src;
    if (!el || !active || !src) return;
    const absolute = new URL(src, window.location.origin).href;
    if (el.src !== absolute) {
      el.src = src;
      if (playing) el.play().catch(() => {});
    }
  }, [trackIndex, active, playing]);

  // Limpeza ao desmontar
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
      if (!el.src && playlist.length > 0) el.src = playlist[trackIndex].src;
      applyVolume(muted ? 0 : volume);
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }

  function nextTrack() {
    if (playlist.length === 0) return;
    setTrackIndex((i) => (i + 1) % playlist.length);
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

  if (playlist.length === 0 || broken) return null;

  return (
    <AnimatePresence mode="wait">
      {!active ? (
        // Pílula discreta antes do primeiro play (caso ela passe direto pelo Hero)
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
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            ♪
          </motion.span>
          {texts.player.miniLabel}
        </motion.button>
      ) : (
        // Player completo
        <motion.div
          key="full"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="glass-strong fixed inset-x-4 bottom-4 z-[75] flex items-center gap-3 rounded-2xl px-3.5 py-2.5 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[340px] sm:rounded-full sm:px-4"
        >
          {/* disco-coração girando/pulsando */}
          <motion.div
            animate={playing ? { rotate: 360 } : { rotate: 0 }}
            transition={
              playing
                ? { duration: 7, repeat: Infinity, ease: "linear" }
                : { duration: 0.4 }
            }
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ouro/40 bg-gradient-to-br from-vinho to-ameixa"
            aria-hidden
          >
            <motion.span
              animate={playing ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              className="text-sm text-rosa"
            >
              ♥
            </motion.span>
          </motion.div>

          {/* faixa atual */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight text-creme">
              {track.title}
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-rosado">
              {track.artist}
            </p>
          </div>

          {/* controles */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? texts.player.ariaPause : texts.player.ariaPlay}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rosa-forte text-creme transition-colors hover:bg-rosa active:scale-95"
          >
            {playing ? (
              <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                <rect x="1.5" y="1" width="3.2" height="10" rx="1" />
                <rect x="7.3" y="1" width="3.2" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                <path d="M2.5 1.3a1 1 0 0 1 1.5-.86l7 4.7a1 1 0 0 1 0 1.72l-7 4.7a1 1 0 0 1-1.5-.86z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={nextTrack}
            aria-label={texts.player.ariaNext}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-blush/20 text-creme/90 transition-colors hover:border-rosa active:scale-95"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
              <path d="M1.5 1.6a.8.8 0 0 1 1.24-.67l5.1 3.74a.8.8 0 0 1 0 1.34l-5.1 3.74a.8.8 0 0 1-1.24-.67z" />
              <rect x="9" y="1" width="1.8" height="10" rx="0.9" />
            </svg>
          </button>

          {/* volume (gain): mute sempre, slider em telas maiores */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? texts.player.ariaUnmute : texts.player.ariaMute}
            className="hidden size-8 shrink-0 items-center justify-center rounded-full border border-blush/20 text-creme/90 transition-colors hover:border-rosa active:scale-95 min-[420px]:flex"
          >
            <span className="text-[11px]" aria-hidden>
              {muted ? "🔇" : "🔉"}
            </span>
          </button>
          <input
            type="range"
            min={0}
            max={0.6}
            step={0.02}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label={texts.player.ariaVolume}
            className="hidden w-16 accent-rosa-forte sm:block"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
