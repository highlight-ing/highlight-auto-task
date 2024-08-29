"use client";

import { NameProvider } from "@/components/providers/NameProvider";
import { Home } from "@/components/home";

export default function MyApp() {
  return (
    <NameProvider>
      <Home />
    </NameProvider>
  );
}
