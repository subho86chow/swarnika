"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const PAD = "px-6 md:px-14 lg:px-20";

export default function HeroSlider({ heroTitle, heroSubtitle, heroImages }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const resolveSlide = (slide) =>
    typeof slide === "string" ? { desktop: slide, mobile: slide } : slide;

  return (
    <section className="relative w-full h-[92vh] overflow-hidden">
      <div className="absolute inset-0 z-0 bg-navy">
        {heroImages.map((slide, idx) => {
          const { desktop, mobile } = resolveSlide(slide);
          return (
            <picture
              key={desktop}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <source media="(max-width: 768px)" srcSet={mobile} />
              <Image
                src={desktop}
                alt="The Archive Background"
                fill
                priority={idx === 0}
                className="object-cover object-top"
                sizes="100vw"
              />
            </picture>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      <div className={`${PAD} relative z-10 h-full flex items-end pb-20`}>
        <div className="max-w-[700px] animate-fade-in-up">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-[40px] h-[1px] bg-gold-light" />
            <span className="font-label text-[9px] tracking-[0.4em] uppercase text-gold-light font-medium">The Signature Collection</span>
          </div>
          <h1 className="font-headline text-white font-light italic leading-[1.0] mb-6 text-4xl md:text-6xl lg:text-[64px]" dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p className="font-body text-white/70 text-sm leading-relaxed mb-10 delay-200 animate-fade-in max-w-[480px]">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4 delay-300 animate-fade-in">
            <Link href="/categories" className="btn-primary">Explore The Archive</Link>
            <Link href="/contact" className="btn-secondary hero">Book a Private Viewing</Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 right-10 z-10 flex-col items-center gap-2 opacity-50 hidden md:flex">
        <span className="font-label text-[8px] tracking-[0.3em] uppercase text-white rotate-90 origin-center">Scroll</span>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-6 md:left-14 lg:left-20 z-20 flex gap-2.5">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-500 rounded-full ${idx === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"} h-1.5`}
          />
        ))}
      </div>
    </section>
  );
}
