"use client";

import { Check, LoaderCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SITE } from "@/lib/site";

const field =
  "w-full rounded-xl border border-white/10 bg-[#0d0d14]/60 px-4 py-3 text-[15px] text-fg outline-none transition placeholder:text-faint focus:border-purple/50 focus:ring-4 focus:ring-purple/15";

export function FeedbackForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${SITE.formspreeId}`, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status === "sent" ? (
        <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-teal/25 bg-teal/10 p-8 text-center">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal/20 text-teal">
            <Check className="h-7 w-7" />
          </motion.span>
          <h3 className="mt-4 font-display text-2xl font-bold text-white">Message sent!</h3>
          <p className="mt-2 text-teal/80">Thank you — every suggestion helps shape Throvic.</p>
          <button type="button" onClick={() => setStatus("idle")} className="mt-5 rounded-full border border-teal/30 px-5 py-2 text-sm font-medium text-teal hover:bg-teal/10">
            Send another
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 text-left">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13.5px] font-medium text-muted">Your name</span>
              <input name="name" required autoComplete="name" className={field} placeholder="Your name" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13.5px] font-medium text-muted">Email address</span>
              <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@example.com" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-[13.5px] font-medium text-muted">Your suggestion</span>
            <textarea name="message" required rows={4} className={`${field} resize-none`} placeholder="I would love to see…" />
          </label>
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-1 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[16px] font-bold text-[#0d0d14] shadow-[0_0_24px_rgba(255,255,255,0.15)] transition hover:scale-[1.01] hover:bg-white/90 active:scale-[0.99] disabled:opacity-60"
          >
            {status === "sending" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
            {status === "sending" ? "Sending…" : "Send feedback"}
          </button>
          {status === "error" && <p className="text-center text-sm font-medium text-coral">Something went wrong. Please try again.</p>}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
