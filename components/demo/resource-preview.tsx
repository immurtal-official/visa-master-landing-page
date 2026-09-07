"use client";

import { useEffect, useRef } from "react";
import {
  formMap,
  verification,
  type Block,
  type Resource,
} from "@/lib/demo/resources";
import { local, type Locale } from "@/lib/demo/intake";
import { type PaidFeature } from "./paid-feature-dialog";
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
  onRequestPaid,
}: {
  resource: Resource;
  locale: Locale;
  onClose: () => void;
  onRequestPaid: (feature: PaidFeature) => void;
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
                "A field-by-field reference for the five-page official form. Form filling is not part of this preview.",
                "五页官方申请表的逐字段参考。本次预览暂不支持填写表格。",
                "Referencia de los campos del formulario oficial de cinco páginas. Esta vista previa no permite rellenarlo.",
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
          {c(
            "Preview · Personalization comes later",
            "预览 · 个性化填写将后续开放",
            "Vista previa · Personalización más adelante",
          )}
        </span>
        {(resource.kind === "template" || resource.kind === "map") && (
          <button className="demo-secondary" onClick={() => onRequestPaid("edit")}>
            {c("Edit document", "编辑文档", "Editar documento")}
          </button>
        )}
        {resource.blocks && (
          <button className="demo-secondary" onClick={() => onRequestPaid("download")}>
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
