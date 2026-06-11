import Image from "next/image";
import ApartChapter from "@/components/ApartChapter";
import CoupleQuiz from "@/components/CoupleQuiz";
import EmotionalClimax from "@/components/EmotionalClimax";
import FloatingHearts from "@/components/FloatingHearts";
import GiftVault from "@/components/GiftVault";
import Hero from "@/components/Hero";
import JourneyIntro from "@/components/JourneyIntro";
import LoveReasons from "@/components/LoveReasons";
import MomentsTimeline from "@/components/MomentsTimeline";
import MusicPlayer from "@/components/MusicPlayer";
import PhotoGallery from "@/components/PhotoGallery";
import Promises from "@/components/Promises";
import ScrollProgress from "@/components/ScrollProgress";
import TechReport from "@/components/TechReport";
import TruthOracle from "@/components/TruthOracle";
import { texts } from "@/lib/texts";

export default function Home() {
  return (
    <main className="relative z-10 flex-1">
      <ScrollProgress />
      <FloatingHearts />
      <MusicPlayer />

      {/* 1 · Abertura */}
      <Hero />

      {/* 2 · Introdução da jornada (primeira aparição do guia) */}
      <JourneyIntro />

      {/* 3 · Linha do tempo de momentos com fotos */}
      <MomentsTimeline />

      {/* 4 · Interações: oráculo, motivos, quiz, laudo, promessas */}
      <TruthOracle />
      <LoveReasons />
      <CoupleQuiz />
      <TechReport />
      <Promises />

      {/* 5 · Galeria especial */}
      <PhotoGallery />

      {/* 6 · O capítulo difícil (período separados) */}
      <ApartChapter />

      {/* 7 · Clímax emocional */}
      <EmotionalClimax />

      {/* 8 · Cofre final com o gift card */}
      <GiftVault />

      {/* Cena final: nós dois de feltro (respiro extra embaixo p/ o player fixo) */}
      <footer className="relative px-6 pb-36 pt-6 text-center">
        <div className="mx-auto mb-7 h-52 w-44 animate-[float-soft_7s_ease-in-out_infinite] md:h-64 md:w-52">
          <div className="relative size-full">
            <Image
              src="/guide/mo-e-eu.png"
              alt="Nós dois, em versão bonecos de feltro, abraçados"
              fill
              sizes="(max-width: 768px) 176px, 208px"
              className="object-contain drop-shadow-[0_18px_28px_rgba(8,1,4,0.55)]"
            />
          </div>
        </div>
        <p className="font-hand text-3xl text-ouro">{texts.footer.endingLine}</p>
        <p className="mt-4 font-hand text-2xl text-rosa/90">{texts.footer.line1}</p>
        <p className="mt-1.5 text-xs uppercase tracking-[0.24em] text-rosado/70">
          {texts.footer.line2}
        </p>
      </footer>
    </main>
  );
}
