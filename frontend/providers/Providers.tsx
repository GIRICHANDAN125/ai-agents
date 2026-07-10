"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useLenisScroll } from "@/hooks/useLenis";

function SmoothScrollBootstrap() {
  useLenisScroll();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScrollBootstrap />
      {children}
    </AuthProvider>
  );
}
