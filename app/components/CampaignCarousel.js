"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const baseItems = [
  { id: 1, title: "DAY OUT", image: "/products/product-2.jpg" },
  { id: 2, title: "DATE NIGHT", image: "/products/product-7.jpg" },
  { id: 3, title: "WEDDING WEAR", image: "/products/product-1.jpg" },
  { id: 4, title: "OFFICE WEAR", image: "/products/product-3.jpg" },
  { id: 5, title: "DAILY WEAR", image: "/products/product-4.jpg" },
  { id: 6, title: "PARTY WEAR", image: "/products/product-6.jpg" },
];

// Double the items array so it has 12 items. 
// This creates perfect circular symmetry for a +/- 3 render window.
const items = [
  ...baseItems.map(i => ({ ...i, id: i.id + "-1" })),
  ...baseItems.map(i => ({ ...i, id: i.id + "-2" }))
];

export default function CampaignCarousel() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, []);

  if (!isClient) return null;

  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <span className="section-eyebrow">Discover Campaigns</span>
            <h2 className="font-headline text-[38px] md:text-[52px] text-navy font-light leading-tight">For Every You</h2>
          </div>
        </div>
      </div>

      <div className="relative h-[350px] md:h-[500px] w-full overflow-hidden flex items-center justify-center py-4">
        <div
          className="relative w-full max-w-[2000px] mx-auto h-full flex items-center justify-center"
          style={{ perspective: "1500px" }}
        >
          {items.map((item, index) => {
            // Calculate distance from active index, wrapping around
            let distance = index - activeIndex;
            const length = items.length;

            // Adjust for shortest path in circular array
            if (distance > Math.floor(length / 2)) {
              distance -= length;
            } else if (distance < -Math.floor(length / 2)) {
              distance += length;
            }

            const isActive = distance === 0;

            // Limit shown items to +/- 2 so it spans gracefully and symmetrically
            if (Math.abs(distance) > 2) return null;

            // Calculate Transforms
            let translateX = 0;
            let translateZ = 0;
            let rotateY = 0;
            let scale = 1;
            let zIndex = 30;
            let opacity = 1;

            if (isActive) {
              translateX = 0;
              translateZ = 0;
              rotateY = 0;
              scale = 1;
              zIndex = 40;
            } else {
              const absDistance = Math.abs(distance);
              const sign = Math.sign(distance);

              // 3D Math for the Coverflow
              // Massively increase the horizontal multiplier to spread them long
              translateX = sign * (60 + absDistance * 40);
              translateZ = -absDistance * 100;
              rotateY = -sign * 20;
              scale = 1 - (absDistance * 0.15);
              zIndex = 30 - absDistance;
            }

            // Inline styles for smooth transition
            const style = {
              transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
              zIndex,
              opacity,
              transition: "all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)", // highly smooth easing
            };

            return (
              <div
                key={item.id}
                className="absolute w-[50%] md:w-[32%] max-w-[360px] h-full cursor-pointer origin-center"
                style={style}
                onClick={() => {
                  if (distance === 1) handleNext();
                  if (distance === -1) handlePrev();
                  if (distance === 2) { handleNext(); setTimeout(handleNext, 300); }
                  if (distance === -2) { handlePrev(); setTimeout(handlePrev, 300); }
                }}
              >
                <div className="relative w-full h-full overflow-hidden bg-ivory-dark group">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 45vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />

                  {/* Text Overlay */}
                  <div className="absolute bottom-6 md:bottom-10 left-0 w-full flex justify-center">
                    <div className="flex flex-col items-center gap-1.5 md:gap-2">
                      <span className="font-label text-[12px] md:text-[15px] tracking-[0.2em] font-medium uppercase text-white drop-shadow-md">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-4 md:left-12 z-50 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-navy"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-4 md:right-12 z-50 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-navy"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
