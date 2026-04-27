"use client";

import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import PageLoader from "./PageLoader";
import AuthModal from "./AuthModal";
import { CartProvider } from "../lib/cartStore";
import { CouponProvider } from "../lib/couponContext";
import { LoadingProvider } from "../lib/loadingContext";
import { AuthModalProvider } from "../lib/authModalContext";

export default function ClientLayoutWrapper({ AnnouncementBar, categories, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <CartProvider>
      <CouponProvider>
        <LoadingProvider>
          <AuthModalProvider>
            {!isAdmin && <PageLoader />}
            {!isAdmin && AnnouncementBar}
            {!isAdmin && <Navbar categories={categories} />}
            {children}
            {!isAdmin && <Footer categories={categories} />}
            {!isAdmin && <WhatsAppButton />}
            {!isAdmin && <AuthModal />}
          </AuthModalProvider>
        </LoadingProvider>
      </CouponProvider>
    </CartProvider>
  );
}
