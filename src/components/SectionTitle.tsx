"use client";

import Reveal from "./Reveal";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <Reveal className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ouro/90">
          ✦ {eyebrow} ✦
        </span>
      )}
      <h2 className="font-display text-3xl leading-tight text-creme italic md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-md text-sm leading-relaxed text-rosado md:text-base">{subtitle}</p>
      )}
    </Reveal>
  );
}
