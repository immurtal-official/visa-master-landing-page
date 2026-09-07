"use client";

import { useEffect, useRef, useState } from "react";
import {
  actions,
  actionResources,
  actionText,
  provenance,
  resources,
  type Resource,
} from "@/lib/demo/resources";
import {
  answerLabel,
  fieldIds,
  local,
  questions,
  type DemoState,
  type Locale,
} from "@/lib/demo/intake";
import { AdditionalReview } from "./additional-review";
import { ActionThread } from "./action-thread";
import { DemoIcon } from "./icon";
import { ResourcePreview, resourceKind } from "./resource-preview";
import { PaidFeatureDialog, type PaidFeature } from "./paid-feature-dialog";
import { type AccountViewer } from "@/components/auth/account-button";
import { createClient } from "@/lib/supabase/client";

type Tab = "roadmap" | "resources" | "details";
export function CaseWorkspace({
  state,
  locale,
  onChange,
  viewer,
  onSignedOut,
}: {
  state: DemoState;
  locale: Locale;
  onChange: (state: DemoState) => void;
  viewer: AccountViewer;
  onSignedOut: () => void;
}) {
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  const [tab, setTab] = useState<Tab>("roadmap");
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  async function signOut() {
    setSigningOut(true);
    setSignOutError(false);
    try {
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      onSignedOut();
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }
  const selected = state.activeAction ?? null;
  function setSelected(id: string | null) {
    onChange({ ...state, activeAction: id ?? undefined });
  }
  const [resource, setResource] = useState<Resource | null>(null);
  const [paidFeature, setPaidFeature] = useState<PaidFeature | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const action = actions.find((a) => a.id === selected);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab, selected]);
  const tabs: {
    id: Tab;
    title: string;
    icon: "list" | "file" | "chat";
    count?: number;
  }[] = [
    {
      id: "roadmap",
      title: c("Your roadmap", "行动路线图", "Tu hoja de ruta"),
      icon: "list",
      count: actions.length,
    },
    {
      id: "resources",
      title: c("Resource library", "资源库", "Biblioteca"),
      icon: "file",
      count: resources.length,
    },
  ];
  function showTab(id: Tab) {
    setTab(id);
    setSelected(null);
  }
  function card(r: Resource) {
    return (
      <button
        className="demo-resource-card"
        key={r.id}
        onClick={() => {
          if (r.url) window.open(r.url, "_blank", "noopener,noreferrer");
          else setResource(r);
        }}
      >
        <span className={`demo-file-symbol ${r.kind}`}>
          <DemoIcon name={r.kind === "official" ? "globe" : "file"} />
        </span>
        <span>
          <small>{resourceKind(r.kind, locale)}</small>
          <strong>{r.title}</strong>
          <em>
            {r.kind === "official"
              ? c(
                  "Find the document on the official page",
                  "前往官方页面获取文件",
                  "Ver documento en la página oficial",
                )
              : c("Open preview", "打开预览", "Abrir vista previa")}
          </em>
        </span>
        <DemoIcon name={r.url ? "external" : "arrow"} />
      </button>
    );
  }
  return (
    <section
      className={`demo-workspace demo-enter${action ? " showing-action" : ""}`}
      aria-label={c("Case Workspace", "申请工作台", "Espacio de trabajo")}
    >
      <aside className="demo-sidebar" onScroll={(event) => {
        event.currentTarget.dataset.scrolled = String(event.currentTarget.scrollTop > 1);
      }}>
        <h2 className="demo-sidebar-title"><span aria-hidden="true">🇪🇸</span>{c("A journey to Spain", "开启西班牙之旅", "Un viaje a España")}</h2>
        <nav
          aria-label={c(
            "Workspace navigation",
            "工作台导航",
            "Navegación del espacio",
          )}
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              className={!action && tab === item.id ? "active" : ""}
              aria-current={!action && tab === item.id ? "page" : undefined}
              onClick={() => showTab(item.id)}
            >
              <DemoIcon name={item.icon} />
              <span>{item.title}</span>
              {item.count && <small>{item.count}</small>}
            </button>
          ))}
        </nav>
        {action && (
          <nav className="demo-action-list" aria-label={c("Case actions", "申请行动", "Acciones")}>
            {actions.map((item, index) => (
              <button key={item.id} title={actionText(item, locale).title} aria-current={item.id === selected ? "step" : undefined}
                className={item.id === selected ? "active" : ""}
                onClick={() => setSelected(item.id)}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{actionText(item, locale).title}</span>
              </button>
            ))}
          </nav>
        )}
        <div className="demo-sidebar-bottom">
            <div className="demo-sidebar-profile" aria-label={c("Your profile", "个人资料", "Tu perfil")}>
              <button className="demo-profile-details" onClick={() => showTab("details")}
                aria-label={`${c("Your details", "你的信息", "Tus datos")} · ${viewer.displayName || c("Your account", "你的账户", "Tu cuenta")}`}
                aria-current={!action && tab === "details" ? "page" : undefined}>
              <span className="demo-profile-avatar" aria-hidden="true">{viewer.displayName ? Array.from(viewer.displayName)[0].toLocaleUpperCase() : <DemoIcon name="user" />}</span>
                <span className="demo-profile-name">{viewer.displayName || c("Your account", "你的账户", "Tu cuenta")}</span>
              </button>
              <button className="demo-profile-logout" onClick={signOut} disabled={signingOut}
                aria-label={signingOut ? c("Logging out…", "正在退出…", "Cerrando sesión…") : c("Log out", "退出登录", "Cerrar sesión")}
                title={c("Log out", "退出登录", "Cerrar sesión")}>
                <DemoIcon name="logout" />
              </button>
            </div>
          {signOutError && <p role="alert">{c("Could not log out. Try again.", "退出失败，请重试。", "No se pudo cerrar sesión. Inténtalo de nuevo.")}</p>}
        </div>
      </aside>
      {action ? (
        <ActionThread
          onRequestPaid={setPaidFeature}
          key={action.id}
          action={action}
          answers={state.answers}
          locale={locale}
          thread={state.threads?.[action.id] ?? { messages: [], draft: "" }}
          onThreadChange={(thread) =>
            onChange({
              ...state,
              threads: { ...state.threads, [action.id]: thread },
            })
          }
          onBack={() => setSelected(null)}
          onResource={(resource) => {
            if (resource.url)
              window.open(resource.url, "_blank", "noopener,noreferrer");
            else setResource(resource);
          }}
        />
      ) : (
        <div className="demo-workspace-main" ref={scrollRef}>
          <div className="demo-workspace-content">
            <AdditionalReview answers={state.answers} locale={locale} />
            {tab === "roadmap" ? (
              <>
                <h2
                  className="demo-workspace-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {c(
                    "Your Spain visa,",
                    "你的西班牙签证，",
                    "Tu visado para España,",
                  )}
                  <br />
                  <em>
                    {c("one step at a time.", "一步一步来。", "paso a paso.")}
                  </em>
                </h2>
                <p className="demo-workspace-lead">
                  {c(
                    "The route is mapped. Here’s what to prepare, where to find it, and what happens next.",
                    "路线已整理好。需要准备什么、去哪里获取、接下来怎么做，都在这里。",
                    "La ruta está organizada. Qué preparar, dónde encontrarlo y qué viene después.",
                  )}
                </p>
                <div className="demo-section-heading">
                  <h3>
                    {c(
                      "Your action roadmap",
                      "你的行动路线图",
                      "Tu hoja de ruta",
                    )}
                  </h3>
                  <span>
                    {actions.length}{" "}
                    {c(
                      "actions to prepare",
                      "个待准备行动",
                      "acciones por preparar",
                    )}
                  </span>
                </div>
                <div className="demo-action-list">
                  {actions.map((item) => (
                    <button
                      className="demo-action-row"
                      key={item.id}
                      onClick={() => setSelected(item.id)}
                    >
                      <span className="demo-action-number">
                        {String(item.number).padStart(2, "0")}
                      </span>
                      <span className="demo-action-name">
                        <strong>{actionText(item, locale).title}</strong>
                        <small>
                          {actionResources(item)
                            .map((r) => resourceKind(r.kind, locale))
                            .filter((v, i, all) => all.indexOf(v) === i)
                            .join(" · ")}
                        </small>
                      </span>
                      <span className="demo-action-status">
                        {c("To prepare", "待准备", "Por preparar")}
                      </span>
                      <DemoIcon name="arrow" />
                    </button>
                  ))}
                </div>
                <section className="demo-continue-card">
                  <span className="demo-assistant-label">
                    {c("MAKE IT YOURS", "为你量身准备", "HAZLO TUYO")}
                  </span>
                  <h3>
                    {c(
                      "A clear plan is just the beginning.",
                      "清晰的计划，只是开始。",
                      "Un plan claro es solo el principio.",
                    )}
                  </h3>
                  <p>
                    {c(
                      "Get help with each action, personalize your documents, and prepare your application.",
                      "获取每一步的帮助，完善你的材料，继续准备申请。",
                      "Recibe ayuda con cada acción, personaliza tus documentos y prepara tu solicitud.",
                    )}
                  </p>
                  <button className="demo-primary" onClick={() => setPaidFeature("message")}>
                    {c(
                      "Continue preparing",
                      "继续准备",
                      "Continuar preparando",
                    )}
                    <DemoIcon name="arrow" />
                  </button>
                </section>
              </>
            ) : tab === "resources" ? (
              <>
                <h2
                  className="demo-workspace-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {c(
                    "A place for every document.",
                    "每份材料，都有归处。",
                    "Un lugar para cada documento.",
                  )}
                </h2>
                <p className="demo-workspace-lead">
                  {c(
                    "The existing route’s guides, blank templates, and official source pages. Open any resource to take a closer look.",
                    "已有路线中的指南、空白模板及官方来源页面。打开任一资源即可查看详情。",
                    "Guías, plantillas en blanco y páginas oficiales de la ruta. Abre un recurso para verlo.",
                  )}
                </p>
                {(["guide", "template", "official", "map"] as const).map(
                  (kind) => (
                    <section className="demo-detail-section" key={kind}>
                      <div className="demo-section-heading">
                        <h3>{resourceKind(kind, locale)}</h3>
                        <span>
                          {resources.filter((r) => r.kind === kind).length}
                        </span>
                      </div>
                      <div className="demo-resource-grid">
                        {resources.filter((r) => r.kind === kind).map(card)}
                      </div>
                    </section>
                  ),
                )}
              </>
            ) : (
              <>
                <h2
                  className="demo-workspace-title"
                  tabIndex={-1}
                  ref={headingRef}
                >
                  {c(
                    "The details behind your plan.",
                    "方案背后的申请信息。",
                    "Los datos detrás de tu plan.",
                  )}
                </h2>
                <p className="demo-workspace-lead">
                  {c(
                    "These answers matched the curated route. You can return to the conversation to revise them.",
                    "这些回答用于匹配已整理的路线，你可以返回对话修改。",
                    "Estas respuestas coinciden con la ruta curada. Vuelve a la conversación para cambiarlas.",
                  )}
                </p>
                <dl className="demo-review">
                  {fieldIds.map((id) => (
                    <div key={id}>
                      <dt>{questions[id].label[locale]}</dt>
                      <dd>{answerLabel(id, state.answers[id]!, locale)}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  className="demo-secondary"
                  onClick={() => onChange({ ...state, view: "thread" })}
                >
                  {c(
                    "Review my answers",
                    "核对我的回答",
                    "Revisar mis respuestas",
                  )}
                  <DemoIcon name="back" />
                </button>
              </>
            )}
            <footer className="demo-workspace-footer">
              <span>
                {c(
                  "Curated route preview · No live verification",
                  "精选路线预览 · 未实时核验",
                  "Vista previa curada · Sin verificación en vivo",
                )}
              </span>
              <a
                href={`https://github.com/${provenance.repository}/tree/${provenance.revision}/agent/skills/research-core/references/routes/spain-schengen-tourism-chengdu-employed-adult`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c("Route provenance", "路线来源", "Procedencia de la ruta")}
                <DemoIcon name="external" />
              </a>
            </footer>
          </div>
        </div>
      )}
      {resource && (
        <ResourcePreview
          onRequestPaid={setPaidFeature}
          resource={resource}
          locale={locale}
          onClose={() => setResource(null)}
        />
      )}
      {paidFeature && <PaidFeatureDialog feature={paidFeature} locale={locale} onClose={() => setPaidFeature(null)} />}
    </section>
  );
}
