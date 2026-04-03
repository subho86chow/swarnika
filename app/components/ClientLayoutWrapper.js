"use client";

import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ AnnouncementBar, children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && AnnouncementBar}
      {children}
    </>
  );
}
