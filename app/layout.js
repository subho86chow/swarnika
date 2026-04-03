import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-headline",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "THE ARCHIVE | SWARNIKA House of Jewelry",
  description:
    "A curation of high-jewelry pieces that bridge the gap between ancestral craftsmanship and contemporary silhouettes. Each piece is a quiet testament to eternal beauty.",
  keywords: "luxury jewelry, high jewelry, handcrafted necklaces, diamond jewelry, emerald sets, bridal jewelry, SWARNIKA, The Archive",
  openGraph: {
    title: "THE ARCHIVE | SWARNIKA House of Jewelry",
    description: "Ancient Spirit, Modern Grace — High jewelry bridging ancestral craftsmanship and contemporary silhouettes.",
    type: "website",
  },
};

import { prisma } from "./lib/prisma";

async function AnnouncementBar() {
  let items = [
    "Complimentary express shipping on all orders above ₹50,000",
    "Bespoke commissions by appointment",
  ];

  try {
    const config = await prisma.siteContent.findUnique({ where: { key: "announcement_texts" } });
    if (config?.value) items = JSON.parse(config.value).filter(Boolean);
  } catch (e) {
    // fallback
  }

  if (items.length === 0) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="announcement-item">
            {item}
            <span className="announcement-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

import ClientLayoutWrapper from "./components/ClientLayoutWrapper";
import ChatBot from "./components/ChatBot";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayoutWrapper AnnouncementBar={<AnnouncementBar />}>
          {children}
          <ChatBot />
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
