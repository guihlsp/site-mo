"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { hintForAttempt } from "@/lib/hints";
import { texts } from "@/lib/texts";

type GiftCard = { number: string; pin: string };
type Status = "idle" | "loading" | "error" | "server-error" | "success";

/** Cadeado desenhado à mão que abre quando ela acerta (e treme no erro) */
function Padlock({ open, shakeKey = 0 }: { open: boolean; shakeKey?: number }) {
  return (
    <motion.div
      className="relative mx-auto size-20"
      key={shakeKey}
      animate={shakeKey > 0 && !open ? { x: [0, -7, 7, -5, 5, 0], rotate: [0, -3, 3, -2, 2, 0] } : {}}
      transition={{ duration: 0.45 }}
    >
      {/* halo: dourado quando abre, vermelho-rosa quando nega */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute -inset-4 rounded-full bg-ouro/25 blur-2xl"
      />
      <motion.svg
        viewBox="0 0 64 64"
        className="absolute inset-0 size-full"
        initial={false}
        animate={open ? { y: -4 } : { y: 0 }}
        aria-hidden
      >
        {/* Alça */}
        <motion.path
          d="M20 30 v-8 a12 12 0 0 1 24 0 v8"
          fill="none"
          stroke="#e8b873"
          strokeWidth="5"
          strokeLinecap="round"
          initial={false}
          animate={open ? { rotate: -28, x: -7, y: -5 } : { rotate: 0, x: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 13 }}
          style={{ transformOrigin: "44px 30px" }}
        />
        {/* Corpo */}
        <rect x="14" y="30" width="36" height="26" rx="7" fill="#561431" stroke="#e8b873" strokeWidth="3" />
        {/* Fechadura */}
        <circle cx="32" cy="41" r="3.6" fill="#e8b873" />
        <rect x="30.4" y="43" width="3.2" height="7" rx="1.6" fill="#e8b873" />
      </motion.svg>
      {open && (
        <motion.span
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -right-1 -top-1 text-xl"
          aria-hidden
        >
          ✨
        </motion.span>
      )}
    </motion.div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1700);
    } catch {
      // clipboard indisponível: sem drama, o valor está visível
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${texts.vault.copyLabel} ${label}`}
      className="rounded-md border border-ouro/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-champanhe transition-colors hover:bg-ouro/15"
    >
      {copied ? texts.vault.copiedLabel : texts.vault.copyLabel}
    </button>
  );
}

async function celebrate() {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#ff6b9a", "#ef3e6e", "#e8b873", "#fff0f4"];

  confetti({ particleCount: 70, spread: 100, origin: { y: 0.6 }, colors, scalar: 1.1 });

  try {
    const heart = confetti.shapeFromText({ text: "❤️", scalar: 2 });
    const heartDefaults = {
      shapes: [heart],
      scalar: 2,
      spread: 70,
      ticks: 110,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 26,
    };
    setTimeout(() => confetti({ ...heartDefaults, particleCount: 22, origin: { x: 0.25, y: 0.65 } }), 220);
    setTimeout(() => confetti({ ...heartDefaults, particleCount: 22, origin: { x: 0.75, y: 0.65 } }), 420);
    setTimeout(() => confetti({ ...heartDefaults, particleCount: 28, origin: { y: 0.45 } }), 650);
  } catch {
    // navegador sem suporte a shapeFromText: o confete clássico já festejou
  }
}

export default function GiftVault() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gift, setGift] = useState<GiftCard | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const loading = status === "loading";
  const hint = wrongAttempts > 0 ? hintForAttempt(wrongAttempts) : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password.trim() || loading || status === "success") return;

    setStatus("loading");
    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.status === 500) {
        setStatus("server-error");
        return;
      }

      const data = (await response.json()) as { success: boolean; giftCard?: GiftCard };

      if (data.success && data.giftCard) {
        setStatus("success");
        setGift(data.giftCard);
        celebrate();
        setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 450);
      } else {
        setStatus("error");
        setWrongAttempts((n) => n + 1);
        setShakeKey((k) => k + 1);
        setPassword("");
        if (typeof navigator !== "undefined") navigator.vibrate?.(120);
      }
    } catch {
      setStatus("server-error");
    }
  }

  return (
    <section id="cofre" className="relative px-6 pb-32 pt-24 md:pt-32">
      <div className="mx-auto flex max-w-xl flex-col gap-10">
        <SectionTitle
          eyebrow={texts.vault.eyebrow}
          title={texts.vault.title}
          subtitle={texts.vault.subtitle}
        />

        {status !== "success" && (
          <GuideBubble variant="cofre" message={texts.vault.guideMessage} />
        )}

        <Reveal delay={0.1}>
          <motion.div
            key={shakeKey}
            className={`glass-strong relative overflow-hidden rounded-3xl p-6 md:p-9 ${
              shakeKey > 0 && status === "error" ? "animate-shake" : ""
            }`}
          >
            {/* brilho dourado de fundo */}
            <div
              aria-hidden
              className="absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-ouro/10 blur-3xl"
            />

            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <motion.div
                  key="locked"
                  initial={false}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4 }}
                  className="relative flex flex-col gap-6"
                >
                  <Padlock open={false} shakeKey={status === "error" ? shakeKey : 0} />

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="vault-password"
                        className="text-[11px] font-bold uppercase tracking-[0.24em] text-ouro"
                      >
                        {texts.vault.inputLabel}
                      </label>
                      {wrongAttempts > 0 && (
                        <span className="text-[11px] text-rosado/80">
                          {texts.vault.attemptsLabel} {wrongAttempts + 1}
                        </span>
                      )}
                    </div>

                    <input
                      id="vault-password"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={64}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder={texts.vault.inputPlaceholder}
                      disabled={loading}
                      aria-invalid={status === "error"}
                      className={`w-full rounded-xl border bg-white/[0.05] px-4 py-3.5 text-center text-base tracking-widest text-creme outline-none transition-colors placeholder:text-rosado/40 placeholder:tracking-normal disabled:opacity-60 ${
                        status === "error"
                          ? "border-rosa-forte ring-2 ring-rosa-forte/40 focus:border-rosa-forte focus:ring-rosa-forte/40"
                          : "border-blush/20 focus:border-rosa focus:ring-2 focus:ring-rosa/30"
                      }`}
                    />

                    <motion.button
                      type="submit"
                      disabled={loading || !password.trim()}
                      whileTap={{ scale: 0.97 }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rosa-forte py-3.5 text-sm font-bold text-creme transition-all hover:bg-rosa disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.7, repeat: Infinity }}
                            aria-hidden
                          >
                            ♥
                          </motion.span>
                          {texts.vault.loadingText}
                        </>
                      ) : (
                        <>🔓 {texts.vault.submitButton}</>
                      )}
                    </motion.button>
                  </form>

                  {/* Alerta de senha incorreta (o segurança barrou) */}
                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div
                        key={`wrong-${shakeKey}`}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 320, damping: 20 }}
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-rosa-forte/50 bg-rosa-forte/12 px-4 py-3"
                      >
                        <span aria-hidden className="text-lg leading-none">🚫</span>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rosa-forte">
                            {texts.vault.wrongTitle}
                          </p>
                          <p className="mt-0.5 text-sm leading-relaxed text-blush">
                            {texts.vault.wrongMessage}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dica progressiva */}
                  <AnimatePresence mode="wait">
                    {hint && status === "error" && (
                      <motion.div
                        key={wrongAttempts}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-xl border-l-2 border-ouro bg-ouro/[0.07] px-4 py-3"
                      >
                        <p className="text-sm leading-relaxed text-champanhe">💡 {hint}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {status === "server-error" && (
                    <div className="rounded-xl border-l-2 border-rosa-forte bg-rosa-forte/10 px-4 py-3">
                      <p className="text-sm leading-relaxed text-blush">
                        ⚡ {texts.vault.serverErrorMessage}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="relative flex flex-col items-center gap-6 text-center"
                >
                  <Padlock open />

                  <div>
                    <h3 className="font-display text-3xl italic text-creme">
                      {texts.vault.successTitle} 🎉
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-rosado">
                      {texts.vault.successMessage}
                    </p>
                  </div>

                  {/* O gift card */}
                  <motion.div
                    ref={cardRef}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.35 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-ouro/40 bg-gradient-to-br from-[#1c0810] via-vinho to-[#0d0306] p-5 text-left shadow-[0_20px_60px_rgba(8,1,4,0.55)] min-h-[13rem] sm:aspect-[1.586]"
                  >
                    {/* varredura de brilho */}
                    <motion.div
                      aria-hidden
                      initial={{ x: "-130%" }}
                      animate={{ x: "130%" }}
                      transition={{ delay: 0.9, duration: 1.4, ease: "easeInOut" }}
                      className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-champanhe/15 to-transparent"
                    />
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-champanhe">
                          {texts.vault.cardBrand}
                        </span>
                        <span aria-hidden className="text-lg">
                          🛍️
                        </span>
                      </div>

                      <div
                        aria-hidden
                        className="h-7 w-10 rounded-md bg-gradient-to-br from-champanhe to-ouro opacity-90"
                      />

                      <div className="flex flex-col gap-2.5">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-rosado">
                            {texts.vault.cardNumberLabel}
                          </p>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="break-all font-mono text-base font-bold tracking-[0.1em] text-creme md:text-lg">
                              {gift?.number || "—"}
                            </p>
                            {gift?.number && (
                              <CopyButton value={gift.number} label={texts.vault.cardNumberLabel} />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-rosado">
                            {texts.vault.cardPinLabel}
                          </p>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="font-mono text-base font-bold tracking-[0.18em] text-creme md:text-lg">
                              {gift?.pin || "—"}
                            </p>
                            {gift?.pin && <CopyButton value={gift.pin} label={texts.vault.cardPinLabel} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Como resgatar */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="w-full max-w-sm rounded-xl border border-blush/12 bg-white/[0.03] p-4 text-left"
                  >
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-ouro">
                      {texts.vault.redeemTitle}
                    </p>
                    <ol className="flex list-decimal flex-col gap-1.5 pl-4">
                      {texts.vault.redeemSteps.map((step, i) => (
                        <li key={i} className="text-xs leading-relaxed text-rosado">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Reveal>

        {status === "success" && (
          <GuideBubble variant="presente" message={texts.vault.guideSuccessMessage} side="right" />
        )}
      </div>
    </section>
  );
}
