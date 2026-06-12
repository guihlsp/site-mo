import Image from "next/image";
import ApartChapter from "@/components/ApartChapter";
import CoupleQuiz from "@/components/CoupleQuiz";
import EmotionalClimax from "@/components/EmotionalClimax";
import FloatingHearts from "@/components/FloatingHearts";
import GiftVault from "@/components/GiftVault";
import Hero from "@/components/Hero";
import JourneyIntro from "@/components/JourneyIntro";
import Gate from "@/components/journey/Gate";
import GateProvider from "@/components/journey/GateProvider";
import LockedHint from "@/components/journey/LockedHint";
import MuseumTicket from "@/components/journey/MuseumTicket";
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

      {/* A jornada é liberada por etapas (portões). Cada <Gate> só renderiza
          o conteúdo da fase depois que ela é desbloqueada. */}
      <GateProvider>
        {/* 1 · Abertura — botão "começar" libera o estágio "start".
            Antes disso a página nem rola. */}
        <Hero />

        {/* Portão 1: tudo abaixo só existe depois de começar a experiência */}
        <Gate stage="start">
          {/* 2 · Introdução da jornada (primeira aparição do guia) */}
          <JourneyIntro />

          {/* 3 · Linha do tempo de momentos com fotos */}
          <MomentsTimeline />

          {/* 4 · Interações: oráculo, motivos e o quiz (portão 2) */}
          <TruthOracle />
          <LoveReasons />
          <CoupleQuiz />

          {/* Portão 2: o resto só abre respondendo o quiz inteiro */}
          <Gate stage="quiz" locked={<LockedHint message={texts.gates.quizLocked} />}>
            <TechReport />
            <Promises />

            {/* Desafio fofo pós-promessas: carimbar o ingresso do museu */}
            <MuseumTicket />

            {/* Portão 3: o museu (galeria) e o final só abrem após carimbar */}
            <Gate stage="museu">
              {/* 5 · Galeria especial (o "museu") */}
              <PhotoGallery />

              {/* 6 · O capítulo difícil: o coração partido é um portão — ela
                  precisa costurá-lo para liberar o clímax, o cofre e o final */}
              <ApartChapter>
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
              </ApartChapter>
            </Gate>
          </Gate>
        </Gate>
      </GateProvider>
    </main>
  );
}
