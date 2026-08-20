"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
        <Toaster
          position="bottom-center"
          offset={88}
          toastOptions={{
            className: "!bg-ink !text-paper !border-0 !font-sans",
          }}
        />
      </LazyMotion>
    </MotionConfig>
  );
}
