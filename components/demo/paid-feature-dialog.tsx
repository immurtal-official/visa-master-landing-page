"use client";

import { useEffect, useRef } from "react";
import { local, type Locale } from "@/lib/demo/intake";
import { DemoIcon } from "./icon";

export type PaidFeature = "message" | "edit" | "automation" | "download";

export function PaidFeatureDialog({ feature, locale, onClose }: {
  feature: PaidFeature; locale: Locale; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const title = feature === "download"
    ? c("Take your documents with you", "下载你的申请材料", "Descarga tus documentos")
    : c("Continue preparing your application", "继续准备你的申请", "Continúa preparando tu solicitud");
  return (
    <dialog ref={dialogRef} className="demo-paid-dialog" aria-labelledby="paid-feature-title"
      onCancel={onClose} onClick={event => {
        if (event.target === dialogRef.current) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
        }
      }}>
      <button className="demo-icon-button demo-close-button demo-paid-close" onClick={onClose}
        aria-label={c("Close", "关闭", "Cerrar")}><DemoIcon name="close" /></button>
      <span className="demo-eyebrow">{c("PAID FEATURES", "付费功能", "FUNCIONES DE PAGO")}</span>
      <h2 id="paid-feature-title">{title}</h2>
      <p>{c("Explore your roadmap, action details, and document previews for free. A paid plan unlocks the next steps.", "免费查看路线图、行动详情和材料预览。后续准备功能需付费解锁。", "Explora gratis tu hoja de ruta, los detalles y las vistas previas. Un plan de pago desbloquea los siguientes pasos.")}</p>
      <ul>
        <li><DemoIcon name="chat" /><span>{c("Action conversations, document editing, and browser automation", "行动对话、文档编辑和浏览器自动化", "Conversaciones, edición de documentos y automatización del navegador")}</span></li>
        <li><DemoIcon name="file" /><span>{c("Downloads of Visa Master templates and prepared documents", "下载 Visa Master 模板和已准备的文档", "Descargas de plantillas y documentos preparados de Visa Master")}</span></li>
      </ul>
      <p className="demo-paid-note">{c("Demo preview · Paid plans are not available yet. No payment will be taken.", "演示预览 · 付费方案尚未开放，不会收取费用。", "Vista previa · Los planes de pago aún no están disponibles. No se realizará ningún cobro.")}</p>
      <button className="demo-primary" onClick={onClose}>{c("Keep exploring", "继续浏览", "Seguir explorando")}</button>
    </dialog>
  );
}
