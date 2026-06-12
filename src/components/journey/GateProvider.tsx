"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import RadioBootOverlay from "./RadioBootOverlay";

/**
 * Sistema de portões da jornada.
 *
 * O site é liberado por etapas: cada `Stage` começa trancado e só abre
 * quando a Mo cumpre a ação daquela fase (clicar em começar, terminar o
 * quiz, carimbar o ingresso do museu). O progresso fica salvo na sessão,
 * então um refresh no meio do caminho não tranca tudo de novo.
 *
 * - "start" → liberado pelo botão do Hero (antes disso a página nem rola)
 * - "quiz"  → liberado ao terminar o quiz do casal
 * - "museu" → liberado pelo desafio fofo depois das promessas
 *
 * Mesma filosofia do ApartChapter: o conteúdo de uma fase só é renderizado
 * depois que ela abre (ver <Gate/>), então nada quebra o que já existia.
 */

export type Stage = "start" | "quiz" | "museu";

const STAGES: Stage[] = ["start", "quiz", "museu"];
const STORAGE_KEY = "jornada-portoes";

type GateContextValue = {
  /** true depois de ler o sessionStorage (evita flash/hidratação errada) */
  ready: boolean;
  isUnlocked: (stage: Stage) => boolean;
  unlock: (stage: Stage) => void;
  /** estágio aberto agora mesmo por uma ação da usuária (p/ auto-scroll) */
  justUnlocked: Stage | null;
  clearJustUnlocked: () => void;
  /** inicia a experiência: mostra o loading da rádio e libera o "start" */
  beginStart: () => void;
};

const GateContext = createContext<GateContextValue | null>(null);

export function useGate(): GateContextValue {
  const ctx = useContext(GateContext);
  if (!ctx) throw new Error("useGate precisa estar dentro de <GateProvider>");
  return ctx;
}

function emptyState(): Record<Stage, boolean> {
  return { start: false, quiz: false, museu: false };
}

export default function GateProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<Record<Stage, boolean>>(emptyState);
  const [ready, setReady] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<Stage | null>(null);
  const [booting, setBooting] = useState(false);

  // Lê o progresso salvo (adiado um tick, como no ApartChapter)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Record<Stage, boolean>>;
          setUnlocked((current) => {
            const next = { ...current };
            for (const stage of STAGES) if (saved[stage]) next[stage] = true;
            return next;
          });
        }
      } catch {
        /* sessão indisponível: começa tudo trancado mesmo */
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const unlock = useCallback((stage: Stage) => {
    setUnlocked((current) => {
      if (current[stage]) return current;
      const next = { ...current, [stage]: true };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignora */
      }
      return next;
    });
    setJustUnlocked(stage);
  }, []);

  const clearJustUnlocked = useCallback(() => setJustUnlocked(null), []);

  const isUnlocked = useCallback((stage: Stage) => unlocked[stage], [unlocked]);

  // Mostra o loading da rádio e adia o mount pesado da jornada, pra ela
  // pintar primeiro (sem sensação de travamento no clique de começar).
  const beginStart = useCallback(() => {
    if (unlocked.start) return;
    setBooting(true);
    setTimeout(() => unlock("start"), 90); // deixa o overlay pintar antes
    setTimeout(() => setBooting(false), 1500); // some depois do mount
  }, [unlocked.start, unlock]);

  // Trava o scroll do site enquanto a experiência não começou.
  // Só age depois de "ready" para não travar quem volta no meio da sessão.
  const restore = useRef<{ body: string; html: string } | null>(null);
  useEffect(() => {
    if (!ready) return;
    const lock = !unlocked.start;
    const body = document.body.style;
    const html = document.documentElement.style;
    if (lock) {
      if (!restore.current) restore.current = { body: body.overflow, html: html.overflow };
      body.overflow = "hidden";
      html.overflow = "hidden";
    } else if (restore.current) {
      body.overflow = restore.current.body;
      html.overflow = restore.current.html;
      restore.current = null;
    }
    return () => {
      if (restore.current) {
        body.overflow = restore.current.body;
        html.overflow = restore.current.html;
      }
    };
  }, [ready, unlocked.start]);

  const value = useMemo<GateContextValue>(
    () => ({ ready, isUnlocked, unlock, justUnlocked, clearJustUnlocked, beginStart }),
    [ready, isUnlocked, unlock, justUnlocked, clearJustUnlocked, beginStart],
  );

  return (
    <GateContext.Provider value={value}>
      {children}
      <RadioBootOverlay show={booting} />
    </GateContext.Provider>
  );
}
