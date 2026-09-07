"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useThreadScroll(revision: string | number) {
  const scroller = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const [jumpVisible, setJumpVisible] = useState(false);
  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    // WebKit can report negative or beyond-end offsets during native bounce.
    // Normalize only the measurement; writing scrollTop would interrupt momentum.
    const end = Math.max(0, el.scrollHeight - el.clientHeight);
    const position = Math.min(end, Math.max(0, el.scrollTop));
    follow.current = end - position < 48;
    setJumpVisible(!follow.current);
  }, []);
  const jumpToLatest = useCallback(() => {
    follow.current = true;
    const el = scroller.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "instant" });
    setJumpVisible(false);
  }, []);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && follow.current) el.scrollTop = el.scrollHeight;
  }, [revision]);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const dock = el.querySelector<HTMLElement>(".thread-composer-dock");
    const observer = new ResizeObserver(() => {
      if (dock) el.style.setProperty("--thread-dock-height", `${dock.offsetHeight}px`);
      if (follow.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    if (dock) observer.observe(dock);
    return () => observer.disconnect();
  }, []);
  const resumeFollowing = useCallback(() => { follow.current = true; }, []);
  return { scroller, resumeFollowing, jumpVisible, onScroll, jumpToLatest };
}
