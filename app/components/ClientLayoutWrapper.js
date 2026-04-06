"use client";

import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

export default function ClientLayoutWrapper({ AnnouncementBar, categories, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && AnnouncementBar}
      {!isAdmin && <Navbar categories={categories} />}
      {children}
      {!isAdmin && <Footer categories={categories} />}
      {!isAdmin && <WhatsAppButton />}
    </>
  );
}
