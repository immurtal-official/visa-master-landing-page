"use client";
// PDF.js canvas preview follows workspace/src/web/pdf-preview.tsx; render the
// exported bytes themselves so preview and download use identical typography.
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { formMap } from "@/lib/demo/official-form";
export function FormPdfPreview({
  bytes,
  page,
  questionId,
  renderScale = 1.7,
}: {
  bytes: Uint8Array | null;
  page: number;
  questionId: string;
  renderScale?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const lastFocused = useRef("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!bytes) return;
    let cancelled = false;
    let loading: PDFDocumentLoadingTask | undefined;
    let task: { cancel: () => void } | undefined;
    void import("pdfjs-dist")
      .then(async ({ getDocument, GlobalWorkerOptions }) => {
        GlobalWorkerOptions.workerSrc = "/forms/pdf.worker.min.mjs";
        loading = getDocument({ data: bytes.slice() });
        const pdf = await loading.promise;
        if (cancelled) {
          await loading.destroy();
          return;
        }
        const p = await pdf.getPage(page);
        const viewport = p.getViewport({ scale: renderScale });
        const buffer = document.createElement("canvas");
        buffer.width = viewport.width;
        buffer.height = viewport.height;
        const render = p.render({ canvas: buffer, viewport });
        task = render;
        await render.promise;
        if (cancelled || !canvas.current) return;
        canvas.current.width = buffer.width;
        canvas.current.height = buffer.height;
        canvas.current.getContext("2d")?.drawImage(buffer, 0, 0);
        setError("");
        const key = `${page}:${questionId}`;
        if (key !== lastFocused.current && canvas.current.clientWidth) {
          canvas.current.parentElement?.querySelector(".official-field-highlight")?.scrollIntoView({ block: "center", inline: "nearest" });
          lastFocused.current = key;
        }
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
      task?.cancel();
      void loading?.destroy();
    };
  }, [bytes, page, questionId, renderScale]);
  const dimensions = formMap.source.pages.find((p) => p.page === page)!;
  return (
    <div className="official-pdf-page" aria-label={`PDF page ${page}`}>
      {!bytes && <p>Loading PDF…</p>}
      {error && <p role="alert">{error}</p>}
      <canvas ref={canvas} />
      {formMap.placements
        .filter((p) => p.page === page && p.questionId === questionId)
        .map((p) => (
          <span
            key={p.id}
            className="official-field-highlight"
            style={{
              left: `${(p.rect.x / dimensions.width) * 100}%`,
              top: `${(p.rect.y / dimensions.height) * 100}%`,
              width: `${(p.rect.width / dimensions.width) * 100}%`,
              height: `${(p.rect.height / dimensions.height) * 100}%`,
            }}
          />
        ))}
    </div>
  );
}
