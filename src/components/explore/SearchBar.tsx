"use client";

import { ArrowRight, CornerDownLeft, History, LoaderCircle, Search, Shuffle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Suggestion = { title: string; description?: string; recent?: boolean };

interface Props {
  onSubmit: (topic: string) => void;
  onSurprise?: () => void;
  recent?: string[];
  busy?: boolean;
  defaultValue?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

/** Topic search with Wikipedia autocomplete (called straight from the browser; no server cost). */
async function wikiSuggest(q: string, signal: AbortSignal): Promise<Suggestion[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=prefixsearch&gpssearch=${encodeURIComponent(q)}&gpslimit=6&prop=description&format=json&formatversion=2&origin=*`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { query?: { pages?: { title: string; description?: string; index: number }[] } };
  return (data.query?.pages || []).sort((a, b) => a.index - b.index).map((p) => ({ title: p.title, description: p.description }));
}

export function SearchBar({ onSubmit, onSurprise, recent = [], busy, defaultValue = "", size = "md", autoFocus, placeholder, className, inputRef }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  // Show the topic the page switched to (e.g. after "New map"), without fighting the user typing.
  const [prevDefault, setPrevDefault] = useState(defaultValue);
  if (defaultValue !== prevDefault) {
    setPrevDefault(defaultValue);
    setValue(defaultValue);
  }

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      wikiSuggest(q, ctrl.signal)
        .then((s) => {
          setItems(s);
          setActive(-1);
        })
        .catch(() => {});
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const shown: Suggestion[] = value.trim().length < 2 ? recent.map((title) => ({ title, recent: true })) : items;
  const showList = open && shown.length > 0;

  const submit = (topic: string) => {
    const t = topic.trim();
    if (!t || busy) return;
    setValue(t);
    setOpen(false);
    ref.current?.blur();
    onSubmit(t);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(shown.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit(active >= 0 && shown[active] ? shown[active].title : value);
    } else if (e.key === "Escape") {
      setOpen(false);
      ref.current?.blur();
    }
  };

  const lg = size === "lg";

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "group flex items-center gap-1 border border-line bg-white/[0.04] backdrop-blur-xl transition-[border-color,box-shadow,background-color] focus-within:border-purple/50 focus-within:bg-white/[0.06] focus-within:ring-4 focus-within:ring-purple/15",
          lg ? "h-14 rounded-2xl pl-4 pr-1.5 shadow-float sm:h-16 sm:pl-5" : "h-11 rounded-xl pl-3.5 pr-1",
        )}
      >
        <Search className={cn("shrink-0 stroke-[1.75] text-faint transition-colors group-focus-within:text-purple-light", lg ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
        <input
          ref={ref}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Topic to explore"
          enterKeyHint="go"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder ?? "Search any topic"}
          onChange={(e) => {
            setValue(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-2 text-fg outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden",
            lg ? "text-[17px]" : "text-[14.5px]",
          )}
        />
        {value && !busy && (
          <button type="button" aria-label="Clear" onClick={() => (setValue(""), ref.current?.focus())} className="grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        )}
        {onSurprise && (
          <button
            type="button"
            onClick={onSurprise}
            disabled={busy}
            aria-label="Random topic"
            title="Random topic"
            className="hidden h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40 min-[380px]:grid"
          >
            <Shuffle className="h-4 w-4 stroke-[1.75]" />
          </button>
        )}
        <button
          type="button"
          onClick={() => submit(value)}
          disabled={busy || !value.trim()}
          aria-label="Explore"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition disabled:opacity-60 disabled:shadow-none",
            "bg-brand text-white shadow-glow hover:brightness-110 active:scale-[0.97]",
            lg ? "h-11 rounded-xl px-4 text-[15px] sm:h-12 sm:px-6" : "h-9 rounded-[10px] px-3 text-[13.5px]",
          )}
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <span className={cn(!lg && "hidden md:inline")}>Explore</span>}
          {!busy && <ArrowRight className={cn("h-4 w-4", !lg && "md:hidden", lg && "hidden sm:block")} />}
        </button>
      </div>

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-panel-2/95 p-1.5 shadow-float backdrop-blur-xl"
          >
            {shown[0]?.recent && <li className="eyebrow px-3 pb-1 pt-2">Recent</li>}
            {shown.map((s, i) => (
              <li
                key={s.title}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => submit(s.title)}
                onPointerEnter={() => setActive(i)}
                className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors", i === active && "bg-surface-active")}
              >
                {s.recent ? <History className="h-4 w-4 shrink-0 stroke-[1.75] text-faint" /> : <Search className="h-4 w-4 shrink-0 stroke-[1.75] text-faint" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-fg">{s.title}</span>
                  {s.description && <span className="block truncate text-[12.5px] text-muted">{s.description}</span>}
                </span>
                <CornerDownLeft className={cn("h-3.5 w-3.5 shrink-0 text-faint transition-opacity", i === active ? "opacity-100" : "opacity-0")} />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
