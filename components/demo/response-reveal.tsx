"use client";

import { useEffect, useState, type ReactNode, type Ref } from "react";
import { local, type Locale } from "@/lib/demo/intake";

// Presentation only: the curated answer is already known; no Agent request occurs.
export function ResponseReveal({ title, text, locale, animate = true, headingRef, onBusyChange, children }: {
  title?: string;
  text: string;
  locale: Locale;
  animate?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  onBusyChange?: (busy: boolean) => void;
  children?: ReactNode;
}) {
  const parts = [title ?? "", text];
  const full = parts.join("\n");
  const [visible, setVisible] = useState(animate ? 0 : full.length);
  const [waiting, setWaiting] = useState(animate);
  const done = !waiting && visible >= full.length;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const revealAll = () => { setWaiting(false); setVisible(full.length); };
    if (!animate || motion.matches) {
      timer = setTimeout(revealAll, 0);
    } else {
      // Keep punctuation attached to its word, then reveal small, uneven bursts.
      const words: { end: number }[] = [];
      for (const part of new Intl.Segmenter(locale === "cn" ? "zh" : locale, { granularity: "word" }).segment(full)) {
        if (part.isWordLike || !words.length) words.push({ end: part.index + part.segment.length });
        else words[words.length - 1].end = part.index + part.segment.length;
      }
      const bursts: { end: number; delay: number }[] = [];
      for (let index = 0; index < words.length;) {
        const size = 1 + Math.floor(Math.random() * 3);
        let end = 0;
        for (let word = 0; word < size && index < words.length; word++) {
          end = words[index++].end;
          if (/[.!?。！？,，;；:\n]\s*$/.test(full.slice(0, end))) break;
        }
        const sentence = /[.!?。！？\n]\s*$/.test(full.slice(0, end));
        const clause = /[,，;；:]\s*$/.test(full.slice(0, end));
        bursts.push({ end, delay: 40 + Math.random() * 55 + (sentence ? 180 : clause ? 80 : Math.random() < .12 ? 90 : 0) });
      }
      const duration = Math.min(3600, Math.max(650, full.length * (locale === "cn" ? 27 : 10)));
      const totalDelay = bursts.slice(0, -1).reduce((sum, burst) => sum + burst.delay, 0) || 1;
      timer = setTimeout(() => {
        setWaiting(false);
        let index = 0;
        const tick = () => {
          if (cancelled) return;
          const burst = bursts[index++];
          setVisible(burst?.end ?? full.length);
          if (index < bursts.length) timer = setTimeout(tick, burst.delay * duration / totalDelay);
        };
        tick();
      }, 220 + Math.random() * 160);
    }
    const reduce = () => { if (motion.matches) { clearTimeout(timer); revealAll(); } };
    motion.addEventListener("change", reduce);
    return () => { cancelled = true; clearTimeout(timer); motion.removeEventListener("change", reduce); };
  }, [full, animate, locale]);

  useEffect(() => { onBusyChange?.(!done); }, [done, onBusyChange]);

  // Announce once, rather than announcing each streamed word to screen readers.
  return <div className="response-reveal" aria-busy={!done}>
    <span className="demo-sr-only" role="status">{done ? full : local(locale, "Preparing a response", "正在准备回复", "Preparando una respuesta")}</span>
    {waiting ? <span className="response-pulse" aria-hidden="true" /> : <div aria-hidden={!done || undefined}>
      {title && <h3 ref={headingRef} tabIndex={-1}>{title.slice(0, visible)}</h3>}
      {visible > parts[0].length + 1 && <p>{text.slice(0, visible - parts[0].length - 1)}</p>}
    </div>}
    {done && children}
  </div>;
}
