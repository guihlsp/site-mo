"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { texts } from "@/lib/texts";

export default function CoupleQuiz() {
  const questions = texts.quiz.questions;
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const isLast = step === questions.length - 1;
  const question = questions[step];

  function pick(index: number) {
    if (selected === null) setSelected(index);
  }

  function advance() {
    if (isLast) {
      setFinished(true);
    } else {
      setStep((s) => s + 1);
      setSelected(null);
    }
  }

  function restart() {
    setStep(0);
    setSelected(null);
    setFinished(false);
  }

  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-xl flex-col gap-10">
        <SectionTitle
          eyebrow={texts.quiz.eyebrow}
          title={texts.quiz.title}
          subtitle={texts.quiz.subtitle}
        />

        <GuideBubble variant="apaixonado" message={texts.quiz.guideMessage} side="right" />

        <Reveal delay={0.1}>
          <div className="glass-strong overflow-hidden rounded-3xl p-6 md:p-8">
            <AnimatePresence mode="wait">
              {finished ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-4 py-6 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.15 }}
                    className="text-shimmer font-display text-6xl font-bold md:text-7xl"
                  >
                    100%
                  </motion.span>
                  <h3 className="font-display text-2xl italic text-creme">
                    {texts.quiz.resultTitle}
                  </h3>
                  <p className="max-w-sm text-sm leading-relaxed text-rosado">
                    {texts.quiz.resultText}
                  </p>
                  <button
                    type="button"
                    onClick={restart}
                    className="mt-2 rounded-full border border-blush/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rosado transition-colors hover:border-rosa hover:text-creme"
                  >
                    {texts.quiz.restartButton}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -36 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-5"
                >
                  {/* Progresso */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {questions.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-7 rounded-full transition-colors ${
                            i < step ? "bg-ouro" : i === step ? "bg-rosa" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-rosado/80">
                      {step + 1} / {questions.length}
                    </span>
                  </div>

                  <h3 className="font-display text-xl italic leading-snug text-creme md:text-2xl">
                    {question.question}
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    {question.options.map((option, i) => {
                      const isPicked = selected === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => pick(i)}
                          disabled={selected !== null && !isPicked}
                          className={`rounded-xl border px-4 py-3 text-left text-sm transition-all md:text-[15px] ${
                            isPicked
                              ? "border-rosa bg-rosa/15 text-creme"
                              : selected !== null
                                ? "border-white/5 bg-white/[0.02] text-rosado/50"
                                : "border-blush/15 bg-white/[0.04] text-creme hover:border-rosa/60 hover:bg-rosa/10 active:scale-[0.99]"
                          }`}
                        >
                          <span className="mr-2 font-display italic text-ouro">
                            {String.fromCharCode(97 + i)})
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selected !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border-l-2 border-rosa bg-rosa/8 px-4 py-3">
                          <p className="text-sm italic leading-relaxed text-blush">
                            💘 {question.options[selected].reply}
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          onClick={advance}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          whileTap={{ scale: 0.96 }}
                          className="mt-4 w-full rounded-xl bg-rosa-forte py-3 text-sm font-bold text-creme transition-colors hover:bg-rosa"
                        >
                          {isLast ? texts.quiz.finishButton : texts.quiz.nextButton} →
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
