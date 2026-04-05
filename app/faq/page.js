"use client";

import { useState } from "react";

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5–7 business days. Express delivery (2–3 business days) is available at an additional cost. All orders above ₹50,000 qualify for free shipping.",
      },
      {
        q: "Can I track my order?",
        a: "Yes! Once your order ships, you'll receive an email and SMS with a tracking number. You can track your shipment in real-time through our website or the courier partner's app.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, we ship within India. International shipping is coming soon. Contact us at hello@swarnika.com for special international requests.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return policy on all standard items. Items must be unworn, in original condition with tags attached. Return shipping is free for domestic orders.",
      },
      {
        q: "Can I exchange for a different piece?",
        a: "Absolutely! Contact our concierge team within 30 days of delivery, and we'll arrange a free exchange for any available piece in our collection.",
      },
    ],
  },
  {
    category: "Product Information",
    questions: [
      {
        q: "Are your gemstones natural or lab-created?",
        a: "We use a combination of both, clearly labeled on each product page. Our lab-created stones are of the highest AAA grade and are virtually indistinguishable from natural gems. All details are listed in each product's specifications.",
      },
      {
        q: "What metals do you use?",
        a: "Our pieces feature 18K white gold rhodium plating, gold-plated sterling silver, and premium rhodium-plated silver. Each product page specifies the exact metal composition.",
      },
      {
        q: "Do you offer custom or bespoke jewelry?",
        a: "Yes! Our atelier can create custom pieces tailored to your vision. Contact us through the 'Custom Order' option on our contact page or visit our flagship store for a consultation.",
      },
    ],
  },
  {
    category: "Care & Maintenance",
    questions: [
      {
        q: "How do I care for my SWARNIKA jewelry?",
        a: "Store pieces separately in their original box, avoid contact with perfumes and chemicals, and wipe with a soft cloth after wear. Visit our detailed Care Guide page for comprehensive instructions.",
      },
      {
        q: "Is the plating durable?",
        a: "Our rhodium and gold plating is of professional jeweler-grade quality. With proper care, it maintains its luster for years. We also offer re-plating services at our stores.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (id) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <main className="pt-[72px]">
        <section className="bg-navy py-16 md:py-20 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto text-center space-y-4">
            <span className="font-body text-gold-light tracking-[0.3em] uppercase text-[10px] font-semibold block">
              How Can We Help?
            </span>
            <h1 className="font-headline text-3xl md:text-4xl text-white italic">
              Frequently Asked Questions
            </h1>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 md:px-12 bg-ivory">
          <div className="max-w-3xl mx-auto space-y-10">
            {faqs.map((category) => (
              <div key={category.category} className="space-y-4">
                <h2 className="font-headline text-xl text-navy flex items-center gap-2">
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.questions.map((faq, i) => {
                    const id = `${category.category}-${i}`;
                    const isOpen = openIndex === id;
                    return (
                      <div
                        key={id}
                        className="bg-white border border-outline-light/30"
                      >
                        <button
                          onClick={() => toggle(id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                          <span className="font-body text-sm text-navy font-medium pr-4">
                            {faq.q}
                          </span>
                          <span
                            className={`material-symbols-outlined text-gold text-lg transition-transform duration-300 flex-shrink-0 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? "max-h-60 pb-5" : "max-h-0"
                          }`}
                        >
                          <p className="px-5 text-slate-subtle text-sm leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Still have questions CTA */}
            <div className="text-center pt-8 space-y-4">
              <p className="text-slate-subtle text-sm">
                Still have questions?
              </p>
              <a
                href="/contact"
                className="inline-block bg-navy text-white px-10 py-4 text-[10px] tracking-[0.2em] uppercase font-medium hover:bg-navy-light transition-all duration-300"
              >
                Contact Our Team
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }
