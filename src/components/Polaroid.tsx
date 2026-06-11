"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Photo } from "@/lib/photos";

type PolaroidProps = {
  photo: Photo;
  caption: string;
  rotate?: number;
  sizes?: string;
  tape?: boolean;
  priority?: boolean;
  className?: string;
};

/** Foto em moldura polaroid com legenda manuscrita e fita adesiva opcional. */
export default function Polaroid({
  photo,
  caption,
  rotate = 0,
  sizes = "(max-width: 768px) 75vw, 320px",
  tape = false,
  priority = false,
  className = "",
}: PolaroidProps) {
  return (
    <motion.figure
      initial={false}
      style={{ rotate }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      whileTap={{ rotate: 0, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`polaroid-frame relative rounded-[10px] p-2.5 pb-2 ${className}`}
    >
      {tape && (
        <>
          <span
            aria-hidden
            className="absolute -top-3 left-6 h-6 w-16 -rotate-6 rounded-[2px] bg-champanhe/40 shadow-sm backdrop-blur-[1px]"
          />
          <span
            aria-hidden
            className="absolute -top-3 right-6 h-6 w-16 rotate-3 rounded-[2px] bg-champanhe/40 shadow-sm backdrop-blur-[1px]"
          />
        </>
      )}
      <div
        className="relative overflow-hidden rounded-[6px] bg-ameixa"
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <Image
          src={photo.src}
          alt={caption}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          className="object-cover"
        />
      </div>
      <figcaption className="pt-2 text-center font-hand text-[22px] leading-none text-[#5a2b3d]">
        {caption}
      </figcaption>
    </motion.figure>
  );
}
