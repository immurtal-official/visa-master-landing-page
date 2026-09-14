"use client";

import { useEffect, useRef } from "react";
import {
  formMap,
  verification,
  type Block,
  type Resource,
} from "@/lib/demo/resources";
import { local, type Locale } from "@/lib/demo/intake";
import { DemoIcon } from "./icon";

export function resourceKind(kind: Resource["kind"], locale: Locale) {
  const names = {
    guide: ["Guide", "指南", "Guía"],
    template: ["Template", "模板", "Plantilla"],
    official: ["Official source", "官方来源", "Fuente oficial"],
    map: ["Form reference", "表格参考", "Referencia del formulario"],
  };
  return names[kind][locale === "cn" ? 1 : locale === "es" ? 2 : 0];
}
function DocumentBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return <h3>{block.text}</h3>;
    case "paragraph":
      return <p>{block.text}</p>;
    case "notice":
      return <aside className="demo-document-note">{block.text}</aside>;
    case "bullets":
      return (
        <ul>
          {block.items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "checklist":
      return (
        <ul className="demo-document-checklist">
          {block.items?.map((item, i) => (
            <li key={i}>
              <span aria-hidden="true">□</span>
              {item}
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div
          className="demo-table-scroll"
          role="region"
          aria-label="Document table"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                {block.headers?.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "signature":
      return (
        <div className="demo-signature">
          {block.fields?.map((field, i) => (
            <p key={i}>{field}</p>
          ))}
        </div>
      );
    default:
      return null;
  }
}
export function ResourcePreview({
  resource,
  locale,
  onClose,
  onOpenForm,
}: {
  onOpenForm: () => void;
  resource: Resource;
  locale: Locale;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      className="demo-resource-dialog"
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) {
          const bounds = ref.current.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="demo-resource-title"
    >
      <header>
        <span className="demo-eyebrow">
          {resourceKind(resource.kind, locale)} ·{" "}
          {c("CURATED LIBRARY", "精选资源库", "BIBLIOTECA CURADA")}
        </span>
        <button
          className="demo-icon-button demo-close-button"
          onClick={onClose}
          aria-label={c("Close preview", "关闭预览", "Cerrar vista previa")}
        >
          <DemoIcon name="close" />
        </button>
      </header>
      <article className="demo-document">
        <h2 id="demo-resource-title">{resource.title}</h2>
        {resource.subtitle && (
          <p className="demo-document-subtitle">{resource.subtitle}</p>
        )}
        <p className="demo-document-note">
          {c(
            "Existing curated reference, presented as a preview. Official requirements have not been checked live in this demo. Guides and templates are in English.",
            "已有精选参考资料的预览。本演示未实时核验官方要求，指南与模板以英文提供。",
            "Vista previa del material curado existente, sin verificación oficial en vivo. Las guías y plantillas están en inglés.",
          )}
        </p>
        {resource.kind === "map" ? (
          <>
            <p>
              {c(
                "A field-by-field reference for the five-page official form. Continue in the action conversation to prepare and review the form.",
                "五页官方申请表的逐字段参考。在行动对话中继续填写并检查草稿。",
                "Referencia de los campos del formulario oficial de cinco páginas. Continúa en la conversación de la acción para prepararlo.",
              )}
            </p>
            <span className="demo-badge">
              {c("Map reviewed", "映射已审核", "Mapa revisado")} ·{" "}
              {verification.reviewedAt.slice(0, 10)}
            </span>
            <div className="demo-map-fields">
              {formMap.questions.map((question) => (
                <div key={question.id}>
                  <strong>{question.label}</strong>
                  <span>{question.type}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          resource.blocks?.map((block, index) => (
            <DocumentBlock block={block} key={index} />
          ))
        )}
      </article>
      <footer>
        <span>
          {resource.kind === "map" ? c("Prepare this form in the action conversation", "在行动对话中准备表格", "Preparar en la conversación") : c(
            "Preview · Editing and export are not connected yet",
            "预览 · 编辑与导出尚未接入",
            "Vista previa · Edición y exportación aún no conectadas",
          )}
        </span>
        {(resource.kind === "template") && (
          <button className="demo-secondary" disabled title={c("Document editing is not connected yet", "文档编辑尚未接入", "El editor aún no está conectado")}>
            {c("Edit document", "编辑文档", "Editar documento")}
          </button>
        )}
        {resource.kind === "map" && <button className="demo-secondary" onClick={onOpenForm}>{c("Open action", "打开行动", "Abrir acción")}</button>}
        {resource.blocks && (
          <button className="demo-secondary" disabled title={c("Document export is not connected yet", "文档导出尚未接入", "La exportación aún no está conectada")}>
            {c(
              "Download",
              "下载",
              "Descargar",
            )}
            <DemoIcon name="file" />
          </button>
        )}
      </footer>
    </dialog>
  );
}
