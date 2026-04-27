export default function CareGuidePage() {
  return (
    <main className="pt-[72px]">
        <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="font-headline text-3xl md:text-5xl text-navy italic">
              Jewelry Care Guide
            </h1>
            <p className="font-body text-outline text-sm mt-2">
              Preserve your treasures
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-14 lg:px-20 bg-ivory">
          <div className="max-w-3xl mx-auto space-y-10">
            {[
              {
                icon: "cleaning_services",
                title: "Daily Care",
                tips: [
                  "Remove jewelry before bathing, swimming, or exercising",
                  "Apply perfumes, lotions, and makeup before wearing jewelry",
                  "Wipe gently with a soft, lint-free cloth after each wear",
                  "Avoid exposing pieces to household chemicals and cleaning agents",
                ],
              },
              {
                icon: "inventory_2",
                title: "Storage",
                tips: [
                  "Store each piece separately in its original SWARNIKA box or a soft pouch",
                  "Keep in a cool, dry place away from direct sunlight",
                  "Use anti-tarnish strips in your jewelry box for added protection",
                  "Avoid storing jewelry in bathrooms where humidity is high",
                ],
              },
              {
                icon: "auto_fix_high",
                title: "Cleaning",
                tips: [
                  "Use lukewarm water with a few drops of mild dish soap",
                  "Gently brush with a soft-bristled toothbrush for intricate designs",
                  "Rinse thoroughly and pat dry with a soft cloth",
                  "For deep cleaning, visit your nearest SWARNIKA store",
                ],
              },
              {
                icon: "diamond",
                title: "Gemstone Care",
                tips: [
                  "Different gemstones have different hardness levels — handle accordingly",
                  "Emeralds and opals are more delicate and require extra care",
                  "Avoid ultrasonic cleaners for softer gemstones",
                  "Check settings periodically to ensure stones are secure",
                ],
              },
            ].map((section) => (
              <div key={section.title} className="bg-white border border-outline-light/30 p-6 md:p-8 space-y-4">
                <h2 className="font-headline text-xl text-navy flex items-center gap-3">
                  <span className="material-symbols-outlined text-gold">{section.icon}</span>
                  {section.title}
                </h2>
                <ul className="space-y-3 text-slate-subtle text-sm leading-relaxed">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }
