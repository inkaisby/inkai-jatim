"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Award, Trophy, Users, Star } from "lucide-react";

type Slide = {
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  accentIcon: "trophy" | "users" | "star";
};

const SLIDES: Slide[] = [
  {
    tag: "PEMBINAAN KARAKTER",
    title: "Membentuk Generasi Tangguh & Berintegritas",
    subtitle: "Sumpah INKAI: Sanggup Memelihara Kepribadian",
    description: "Kami mendidik fisik dan mental karateka Jawa Timur sejak usia dini demi menciptakan kepribadian luhur yang mandiri, jujur, dan berjiwa ksatria.",
    ctaText: "Pelajari Profil",
    ctaHref: "/profil",
    secondaryCtaText: "Temukan Dojo",
    secondaryCtaHref: "/dojo",
    accentIcon: "star",
  },
  {
    tag: "PRESTASI ATLET",
    title: "Melahirkan Juara Nasional & Internasional",
    subtitle: "Sumpah INKAI: Sanggup Mempertinggi Prestasi",
    description: "INKAI Jawa Timur berkomitmen penuh memfasilitasi bibit-bibit unggul daerah untuk berprestasi di kancah kejuaraan karate tingkat dunia.",
    ctaText: "Berita Terbaru",
    ctaHref: "/berita",
    secondaryCtaText: "Agenda Kegiatan",
    secondaryCtaHref: "/agenda",
    accentIcon: "trophy",
  },
  {
    tag: "SABUK EMAS JATIM",
    title: "Gabung Dojo Latihan Resmi Terdekat",
    subtitle: "Sumpah INKAI: Sanggup Menguasai Diri",
    description: "Dengan lebih dari 50 Dojo resmi yang tersebar di Jawa Timur, Anda bisa memulai perjalanan disiplin beladiri karate bersama sabuk hitam berpengalaman.",
    ctaText: "Cari Dojo",
    ctaHref: "/dojo",
    secondaryCtaText: "Unduh Dokumen",
    secondaryCtaHref: "/dokumen",
    accentIcon: "users",
  },
];

export function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
  };

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    startTimer();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    startTimer();
  };

  const currentSlide = SLIDES[activeIndex];

  const renderIcon = (type: string) => {
    switch (type) {
      case "trophy":
        return <Trophy className="h-28 w-28 text-accent opacity-10 dark:opacity-20 animate-pulse" />;
      case "users":
        return <Users className="h-28 w-28 text-accent opacity-10 dark:opacity-20 animate-pulse" />;
      default:
        return <Star className="h-28 w-28 text-accent opacity-10 dark:opacity-20 animate-pulse" />;
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-b from-card to-background shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Dots Pattern & Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-80 h-80 bg-linear-to-bl from-accent/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      
      {/* Slider Slides */}
      <div className="relative min-h-[460px] md:min-h-[420px] flex items-center p-8 md:p-14">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              className={`absolute inset-0 p-8 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-12 transition-all duration-700 ease-in-out ${
                isActive 
                  ? "opacity-100 translate-x-0 pointer-events-auto" 
                  : "opacity-0 translate-x-8 pointer-events-none"
              }`}
            >
              {/* Text Side */}
              <div className="max-w-2xl text-left space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1 text-xs font-bold text-accent dark:bg-accent/15 tracking-wider uppercase animate-fade-in">
                  <span>{slide.tag}</span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-gradient-red leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm font-semibold text-accent/80 dark:text-accent/90 italic tracking-wide">
                    {slide.subtitle}
                  </p>
                </div>
                
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
                  {slide.description}
                </p>

                <div className="flex flex-wrap gap-3 pt-3">
                  <Link className="btn-primary" href={slide.ctaHref}>
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link className="btn-outline" href={slide.secondaryCtaHref}>
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </div>
              </div>

              {/* Graphic/Brand Badge Side */}
              <div className="relative hidden lg:flex shrink-0 w-64 h-64 justify-center items-center">
                <div className="absolute -inset-4 rounded-full bg-accent/5 blur-xl opacity-75 animate-pulse" />
                
                <div className="absolute">
                  {renderIcon(slide.accentIcon)}
                </div>
                
                <div className="relative rounded-full bg-linear-to-br from-card to-muted p-5 shadow-2xl border border-border/80">
                  <Image
                    src="/logo-inkai.png"
                    alt="Logo INKAI"
                    width={130}
                    height={130}
                    className="select-none drop-shadow-lg transition-transform duration-500 hover:rotate-6"
                    aria-hidden="true"
                    priority
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Arrow Controls & Dots Indicator */}
      <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between z-20">
        {/* Navigation Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                startTimer();
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex 
                  ? "w-8 bg-accent" 
                  : "w-2.5 bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Arrows */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/60 hover:bg-accent hover:text-accent-foreground hover:border-transparent transition-all duration-300 active:scale-90"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/60 hover:bg-accent hover:text-accent-foreground hover:border-transparent transition-all duration-300 active:scale-90"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
