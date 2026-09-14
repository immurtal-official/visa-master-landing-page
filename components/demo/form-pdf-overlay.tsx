"use client";

import { useEffect, useRef, useState } from "react";
import { local, type Locale } from "@/lib/demo/intake";
import { formMap } from "@/lib/demo/official-form";
import { FormPdfPreview } from "./form-pdf-preview";
import { DemoIcon } from "./icon";

export function FormPdfOverlay({ bytes, initialPage, locale, onClose }: {
  bytes: Uint8Array | null;
  initialPage: number;
  locale: Locale;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [page, setPage] = useState(initialPage);
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  const count = formMap.source.pageCount;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    node?.showModal();
    return () => { node?.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  function navigate(next: number) {
    const target = Math.min(count, Math.max(1, next));
    if (target === page) return;
    setPage(target);
    dialog.current?.scrollTo({ top: 0, left: 0 });
  }
  return <dialog ref={dialog} className="form-pdf-overlay" aria-label={c("Application PDF", "申请表 PDF", "PDF de solicitud")}
    onCancel={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); navigate(page + (event.key === "ArrowLeft" ? -1 : 1)); } }}>
    <button className="form-pdf-overlay-close" onClick={onClose} aria-label={c("Close PDF", "关闭 PDF", "Cerrar PDF")}><DemoIcon name="close" /></button>
    <button className="form-pdf-overlay-prev" onClick={() => navigate(page - 1)} disabled={page === 1} aria-label={c("Previous page", "上一页", "Página anterior")}>←</button>
    <span className="demo-sr-only" aria-live="polite">{page} / {count}</span>
    <button className="form-pdf-overlay-next" onClick={() => navigate(page + 1)} disabled={page === count} aria-label={c("Next page", "下一页", "Página siguiente")}>→</button>
    <div className="form-pdf-overlay-page"><FormPdfPreview key={page} bytes={bytes} page={page} questionId="" renderScale={1.7} /></div>
  </dialog>;
}
