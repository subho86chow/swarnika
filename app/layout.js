import { Cormorant_Garamond, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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

export default async function RootLayout({ children }) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            variables: {
              colorPrimary: "#755629",
              colorDanger: "#ba1a1a",
              colorSuccess: "#2d6a2e",
              colorWarning: "#7a6130",
              colorNeutral: "#635d5a",
              colorForeground: "#1d1b16",
              colorMutedForeground: "#807569",
              colorMuted: "#f3ede4",
              colorBackground: "#fff8ef",
              colorInput: "#ffffff",
              colorInputForeground: "#1d1b16",
              colorBorder: "#d2c4b6",
              colorRing: "#e9c088",
              colorShadow: "rgba(29, 27, 22, 0.06)",
              colorModalBackdrop: "rgba(29, 27, 22, 0.5)",
              fontFamily: "'Manrope', sans-serif",
              fontFamilyButtons: "'Manrope', sans-serif",
              fontSize: "0.8125rem",
              borderRadius: "0px",
              spacing: "1rem",
            },
            elements: {
              footer: { display: "none" },
              card: {
                boxShadow: "0 4px 32px rgba(29, 27, 22, 0.08)",
                border: "1px solid #d2c4b6",
                borderRadius: "0.25rem",
              },
              headerTitle: {
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "1.75rem",
                color: "#1d1b16",
              },
              headerSubtitle: {
                fontFamily: "'Manrope', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                color: "#807569",
              },
              formButtonPrimary: {
                fontFamily: "'Manrope', sans-serif",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                padding: "1rem 2rem",
                borderRadius: "0px",
                transition: "background 0.4s, color 0.4s, letter-spacing 0.3s",
              },
              formFieldInput: {
                borderRadius: "0px",
                borderColor: "#dfd9d0",
                fontSize: "13px",
              },
              socialButtonsBlockButton: {
                borderRadius: "0px",
                borderColor: "#d2c4b6",
                backgroundColor: "#ffffff",
                color: "#1d1b16",
                fontFamily: "'Manrope', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.05em",
              },
              dividerLine: {
                backgroundColor: "#d2c4b6",
              },
              dividerText: {
                fontFamily: "'Manrope', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#807569",
              },
              identityPreview: {
                borderRadius: "0px",
              },
              formFieldLabel: {
                fontFamily: "'Manrope', sans-serif",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              },
            },
          }}
        >
          <ClientLayoutWrapper AnnouncementBar={<AnnouncementBar />} categories={categories}>
            {children}
            <ChatBot />
          </ClientLayoutWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}
