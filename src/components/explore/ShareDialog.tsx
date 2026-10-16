"use client";

import { Braces, Check, Download, FileText, Link2, LoaderCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { buildPdf, canvasToBlob, FORMATS, renderShareImage, type ShareFormat } from "../graph/share";
import type { GraphStore } from "../graph/store";

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "map";

export function ShareDialog({ open, onClose, store, sheet }: { open: boolean; onClose: () => void; store: GraphStore; sheet: boolean }) {
  const [format, setFormat] = useState<ShareFormat>("landscape");
  const [preview, setPreview] = useState<{ url: string; blob: Blob; format: ShareFormat } | null>(null);
  const [rendering, setRendering] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const urlRef = useRef<string | null>(null);

  const title = store.rootTitle || "Knowledge map";
  const link = typeof window !== "undefined" ? `${location.origin}/explore?q=${encodeURIComponent(title)}` : "";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      setRendering(true);
      const canvas = await renderShareImage(store, document.body, format);
      const blob = await canvasToBlob(canvas);
      if (cancelled) return;
      setRendering(false);
      if (!blob) {
        toast.error("Couldn't create the image.");
        return;
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      setPreview({ url: urlRef.current, blob, format });
    };
    // Let the dialog open first; rendering a large map takes a moment.
    const t = setTimeout(run, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, format, store]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const fileName = `${slug(title)}-throvic-${format}`;
  const ready = preview?.format === format && !rendering;

  const savePng = () => preview && download(preview.blob, `${fileName}.png`);
  const savePdf = async () => {
    setPdfBusy(true);
    try {
      download(await buildPdf(store, document.body), `${slug(title)}-throvic.pdf`);
    } catch {
      toast.error("Couldn't create the PDF.");
    } finally {
      setPdfBusy(false);
    }
  };
  // The map as data: concepts and labelled links, for notes, scripts or graph tools.
  const saveJson = () => {
    const data = {
      topic: title,
      source: link,
      exportedAt: new Date().toISOString(),
      nodes: store.nodes.map((n) => ({
        id: n.id,
        title: n.wiki?.title ?? n.title,
        category: n.category,
        depth: n.depth,
        parent: n.parent ?? null,
        summary: n.summary || n.wiki?.extract || "",
        wikipedia: n.wiki?.url ?? null,
      })),
      links: store.links.map((l) => ({ source: l.source.id, target: l.target.id, label: l.label })),
    };
    download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${slug(title)}-throvic.json`);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };
  const nativeShare = async () => {
    if (!preview) return;
    const file = new File([preview.blob], `${fileName}.png`, { type: "image/png" });
    const data: ShareData = { title: `${title} — knowledge map`, text: `Explore ${title} as an interactive knowledge map`, url: link };
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] });
      else if (navigator.share) await navigator.share(data);
      else await copy();
    } catch {
      /* cancelled */
    }
  };
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const aspect = format === "map" ? "aspect-[4/3]" : format === "landscape" ? "aspect-[1200/630]" : format === "square" ? "aspect-square" : "aspect-[1080/1920]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Share and export"
            initial={sheet ? { y: "100%" } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={sheet ? { y: "100%" } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className={cn(
              "relative flex w-full flex-col overflow-hidden border border-line bg-panel shadow-float",
              sheet ? "max-h-[92dvh] rounded-t-[28px]" : "max-h-[88vh] max-w-5xl rounded-[28px]",
            )}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-lg font-bold text-fg">Share & export</h2>
                <p className="text-[13px] text-muted">Designed images for any platform, or a PDF study sheet.</p>
              </div>
              <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-hover hover:text-fg">
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="thin-scrollbar grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[1fr_300px]">
              {/* preview */}
              <div className="grid place-items-center bg-deep p-4 sm:p-8">
                <div className={cn("relative w-full overflow-hidden rounded-2xl border border-line bg-bg shadow-card", aspect, format === "story" ? "max-w-[260px]" : format === "square" ? "max-w-[460px]" : "max-w-[640px]")}>
                  {preview && <img src={preview.url} alt={`${FORMATS[format].label} share image of ${title}`} className={cn("h-full w-full object-contain transition-opacity duration-300", ready ? "opacity-100" : "opacity-40")} />}
                  {!ready && (
                    <div className="absolute inset-0 grid place-items-center">
                      <LoaderCircle className="h-6 w-6 animate-spin text-purple-light" />
                    </div>
                  )}
                </div>
              </div>

              {/* options */}
              <div className="flex flex-col gap-5 border-t border-line p-5 md:border-l md:border-t-0 sm:p-6">
                <div>
                  <p className="eyebrow mb-2.5">Format</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(FORMATS) as ShareFormat[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        aria-pressed={format === f}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-left transition",
                          format === f ? "border-purple/60 bg-purple/12 shadow-[0_0_0_1px_rgba(127,119,221,0.35)]" : "border-line bg-surface hover:border-line-strong",
                        )}
                      >
                        <span className="block text-[13.5px] font-semibold text-fg">{FORMATS[f].label}</span>
                        <span className="block text-[11.5px] leading-snug text-faint">{FORMATS[f].hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button type="button" onClick={savePng} disabled={!ready} className="bg-brand inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50">
                    <Download className="h-4 w-4" /> Download image (PNG)
                  </button>
                  <button type="button" onClick={savePdf} disabled={pdfBusy} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[14px] font-medium text-fg transition hover:bg-surface-hover disabled:opacity-60">
                    {pdfBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Download PDF + study sheet
                  </button>
                  <button type="button" onClick={saveJson} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[14px] font-medium text-fg transition hover:bg-surface-hover">
                    <Braces className="h-4 w-4" /> Download data (JSON)
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={copy} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[13.5px] font-medium text-fg transition hover:bg-surface-hover">
                      {copied ? <Check className="h-4 w-4 text-teal" /> : <Link2 className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
                    </button>
                    <button type="button" onClick={nativeShare} disabled={!ready} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[13.5px] font-medium text-fg transition hover:bg-surface-hover disabled:opacity-50">
                      <Send className="h-4 w-4" /> {canNativeShare ? "Share…" : "Share"}
                    </button>
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed text-faint">The link opens this topic in Throvic. The PDF has the map on page 1, then every concept with its summary and Wikipedia link. The JSON file lists every concept and labelled link.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
