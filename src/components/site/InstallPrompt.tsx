"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "../ui/Logo";

const DISMISSED = "throvic:install-dismissed";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Only offer the app from the second page view on: first-time visitors see the content uncovered. */
const returning = () => {
  try {
    const views = Number(sessionStorage.getItem("throvic:views") || 0) + 1;
    sessionStorage.setItem("throvic:views", String(views));
    return views >= 2 || Boolean(localStorage.getItem("throvic:study"));
  } catch {
    return false;
  }
};

const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISSED));
    return at > 0 && Date.now() - at < 14 * 86_400_000;
  } catch {
    return false;
  }
};

/** "Add Throvic to your home screen": the browser's install prompt where supported, instructions on iPhone/iPad. */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    if (standalone || dismissedRecently() || !returning()) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // iOS Safari has no install prompt; show how to do it by hand after a moment.
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
    const t = isIos && !/CriOS|FxiOS|EdgiOS/.test(ua) ? setTimeout(() => setIos(true), 8000) : undefined;
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setEvent(null);
    setIos(false);
    try {
      localStorage.setItem(DISMISSED, String(Date.now()));
    } catch {}
  };

  const install = async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice.catch(() => null);
    setEvent(null);
  };

  const show = !!event || ios;

  return (
    show && (
        <div
          role="dialog"
          aria-label="Install Throvic"
          className="rise safe-bottom fixed border border-white/10 bg-[#14141d]/[0.97] backdrop-blur-xl inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl p-3 shadow-float"
        >
          <LogoMark className="h-11 w-11 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-bold text-white">Get the Throvic app</p>
            <p className="text-[12.5px] leading-snug text-muted">
              {ios ? (
                <>
                  Tap <Share className="inline h-3.5 w-3.5 -translate-y-px" aria-label="Share" /> then “Add to Home Screen”.
                </>
              ) : (
                "Opens full screen, keeps your revision streak, works offline."
              )}
            </p>
          </div>
          {event && (
            <button type="button" onClick={install} className="bg-brand inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-bold text-white">
              <Download className="h-4 w-4" /> Install
            </button>
          )}
          <button type="button" onClick={dismiss} aria-label="Not now" className="grid h-11 w-9 shrink-0 place-items-center rounded-xl text-faint hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
    )
  );
}
