import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="pt-[72px]">
        {/* Hero */}
        <section className="bg-navy py-20 md:py-28 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto text-center space-y-5">
            <span className="font-body text-gold-light tracking-[0.3em] uppercase text-[10px] font-semibold block">
              Our Story
            </span>
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl text-white italic">
              The Heritage of SWARNIKA
            </h1>
            <p className="font-body text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Born from a passion for timeless artistry, SWARNIKA crafts jewelry that transcends
              generations — where every piece carries a narrative of devotion and beauty.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-28 px-6 md:px-12 bg-ivory">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/products/product-2.jpg"
                alt="SWARNIKA Heritage Craftsmanship"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-8">
              <span className="font-body text-gold tracking-[0.3em] uppercase text-[10px] font-semibold block">
                Since 2020
              </span>
              <h2 className="font-headline text-3xl md:text-4xl text-navy leading-tight">
                Where Ancient Art Meets Modern Vision
              </h2>
              <div className="space-y-5 text-slate-subtle text-sm leading-relaxed">
                <p>
                  SWARNIKA was founded with a singular vision: to create jewelry that speaks to
                  the soul. Inspired by the rich heritage of Indian craftsmanship and the refined
                  aesthetics of modern design, each SWARNIKA creation is a conversation between
                  past and future.
                </p>
                <p>
                  Our name, derived from the Sanskrit word for &ldquo;golden,&rdquo; reflects our
                  commitment to the highest standards of excellence. We believe that jewelry is
                  not merely an accessory — it is an heirloom, a story, a piece of art that
                  adorns the wearer with confidence and grace.
                </p>
                <p>
                  Every gemstone is hand-selected, every setting meticulously crafted, and every
                  design thoughtfully conceived to ensure that when you wear SWARNIKA, you wear
                  a legacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28 px-6 md:px-12 bg-white">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16 space-y-4">
              <span className="font-body text-gold tracking-[0.3em] uppercase text-[10px] font-semibold block">
                Our Philosophy
              </span>
              <h2 className="font-headline text-3xl md:text-4xl text-navy">
                The Pillars of SWARNIKA
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: "diamond",
                  title: "Uncompromising Quality",
                  desc: "Every gemstone is hand-inspected and every piece undergoes rigorous quality checks. We use only AAA-grade stones and premium metals to ensure lasting beauty.",
                },
                {
                  icon: "palette",
                  title: "Artisan Craftsmanship",
                  desc: "Our master artisans bring decades of experience to every creation. Traditional techniques meet modern precision in our atelier, where each piece takes shape over weeks of dedicated work.",
                },
                {
                  icon: "eco",
                  title: "Ethical Sourcing",
                  desc: "We are committed to responsible sourcing practices. Our supply chain ensures that every material is ethically procured, from conflict-free stones to recycled precious metals.",
                },
              ].map((value) => (
                <div key={value.title} className="text-center space-y-5">
                  <span className="material-symbols-outlined text-gold text-3xl">
                    {value.icon}
                  </span>
                  <h3 className="font-headline text-xl text-navy">{value.title}</h3>
                  <p className="text-slate-subtle text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Craftsmanship Gallery */}
        <section className="py-20 md:py-28 px-6 md:px-12 bg-ivory">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <span className="font-body text-gold tracking-[0.3em] uppercase text-[10px] font-semibold block">
                The Process
              </span>
              <h2 className="font-headline text-3xl md:text-4xl text-navy leading-tight">
                From Sketch to Splendor
              </h2>
              <div className="space-y-5 text-slate-subtle text-sm leading-relaxed">
                <p>
                  Every SWARNIKA piece begins as a sketch — a whisper of an idea that slowly
                  takes form through layers of design, prototyping, and refinement.
                </p>
                <p>
                  Our artisans employ techniques passed down through generations: intricate
                  filigree work, precision stone setting, and expert polishing. The result is
                  jewelry that doesn&apos;t just sparkle — it radiates a depth of character.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                {[
                  { number: "1000+", label: "Pieces Created" },
                  { number: "50+", label: "Master Artisans" },
                  { number: "98%", label: "Customer Satisfaction" },
                  { number: "6+", label: "Years of Excellence" },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <span className="font-headline text-2xl text-navy font-medium">
                      {stat.number}
                    </span>
                    <p className="text-slate-subtle text-xs tracking-wide uppercase">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-[3/4] w-full order-1 lg:order-2">
              <Image
                src="/products/product-9.jpg"
                alt="SWARNIKA Craftsmanship"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 px-6 md:px-12 bg-navy text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-headline text-3xl md:text-4xl text-white italic">
              Experience the SWARNIKA Difference
            </h2>
            <p className="font-body text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
              Visit our atelier or browse our collections online. Every piece is a promise of
              beauty, quality, and timeless elegance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link
                href="/categories"
                className="btn-primary-gold"
              >
                Explore Collections
              </Link>
              <Link
                href="/contact"
                className="btn-primary-gold"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
