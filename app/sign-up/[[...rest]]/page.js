"use client";

import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignUpPage({ params }) {
  const [authImage, setAuthImage] = useState("/products/product-5.jpg");

  useEffect(() => {
    fetch("/api/site-content?key=auth_image", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.value) setAuthImage(data.value);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 h-[30vh] md:h-screen bg-navy overflow-hidden">
        <Image
          src={authImage}
          alt="Welcome to SWARNIKA"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent md:bg-gradient-to-r" />
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/products/logo.svg"
              alt="SWARNIKA"
              width={100}
              height={50}
              className="w-20 md:w-24 h-auto brightness-0 invert"
            />
          </Link>
          <p className="font-body text-white/70 text-sm max-w-xs leading-relaxed hidden md:block">
            Step into a world where ancient artistry meets modern grace. Your journey begins here.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10 md:py-0">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 md:hidden text-center">
            <Link href="/" className="inline-block">
              <Image
                src="/products/logo.svg"
                alt="SWARNIKA"
                width={100}
                height={50}
                className="w-24 h-auto mx-auto"
              />
            </Link>
          </div>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
          />
        </div>
      </div>
    </main>
  );
}
