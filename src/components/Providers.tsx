"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

// Notifications only appear after an action, so their code loads after the page is interactive.
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Installable app + offline page. Off in development so it never serves stale code while editing.
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{ className: "!rounded-2xl !border !border-line !bg-panel-2 !text-fg !shadow-float !font-sans !text-[13.5px]" }}
      />
    </>
  );
}
