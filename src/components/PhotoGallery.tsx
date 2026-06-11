"use client";

import { motion } from "motion/react";
import GuideBubble from "./GuideBubble";
import Polaroid from "./Polaroid";
import SectionTitle from "./SectionTitle";
import { galleryOrder, photoById } from "@/lib/photos";
import { texts } from "@/lib/texts";

const ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4, -2, 3];
const OFFSETS = [0, 18, -10, 12, -16, 8, -8, 16, -12, 6];

export default function PhotoGallery() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6">
        <SectionTitle
          eyebrow={texts.gallery.eyebrow}
          title={texts.gallery.title}
          subtitle={texts.gallery.subtitle}
        />
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-rosa"
        >
          {texts.gallery.badge}
        </motion.span>
      </div>

      {/* Trilho horizontal com snap — perfeito para o dedão no celular */}
      <div className="mask-fade-x mt-12">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(8vw,2rem)] pb-12 pt-8">
          {galleryOrder.map((id, i) => {
            const photo = photoById(id);
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.65, delay: (i % 3) * 0.1 }}
                className="snap-center"
                style={{ translate: `0 ${OFFSETS[i % OFFSETS.length]}px` }}
              >
                <div
                  className="w-[66vw] max-w-[260px] shrink-0 animate-[float-soft_8s_ease-in-out_infinite] md:w-[260px]"
                  style={
                    {
                      "--rot": `${ROTATIONS[i % ROTATIONS.length]}deg`,
                      animationDelay: `${(i % 5) * 0.9}s`,
                    } as React.CSSProperties
                  }
                >
                  <Polaroid
                    photo={photo}
                    caption={texts.gallery.captions[id] ?? "nós ♥"}
                    rotate={ROTATIONS[i % ROTATIONS.length]}
                    sizes="(max-width: 768px) 66vw, 260px"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.p
        aria-hidden
        animate={{ x: [0, 14, 0, -14, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="text-center font-hand text-2xl text-rosa"
      >
        {texts.gallery.dragHint}
      </motion.p>

      <div className="mx-auto mt-12 max-w-xl px-6">
        <GuideBubble variant="orgulhoso" message={texts.gallery.guideMessage} />
      </div>
    </section>
  );
}
