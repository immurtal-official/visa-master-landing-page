"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  actionResources,
  actionSources,
  actionText,
  type Action,
  type Resource,
} from "@/lib/demo/resources";
import { local, type Locale, type Answers } from "@/lib/demo/intake";
import {
  type ActionThreadState,
  type ThreadIntent,
} from "@/lib/demo/action-thread";
import { DemoIcon } from "./icon";
import { AdditionalReview } from "./additional-review";
import { ThreadComposer } from "./thread-composer";
import { type PaidFeature } from "./paid-feature-dialog";
import { useThreadScroll } from "./use-thread-scroll";
import { resourceKind } from "./resource-preview";

// Adapted from visa-master/workspace/src/web/action-detail/: the message column,
// following scroll, bottom composer, and contextual Artifacts panel use local
// deterministic replies here instead of the Workspace server's Action Thread API.
export function ActionThread({
  action,
  answers,
  locale,
  thread,
  onThreadChange,
  onBack,
  onResource,
  onRequestPaid,
}: {
  action: Action;
  answers: Answers;
  locale: Locale;
  thread: ActionThreadState;
  onThreadChange: (next: ActionThreadState) => void;
  onBack: () => void;
  onResource: (resource: Resource) => void;
  onRequestPaid: (feature: PaidFeature) => void;
}) {
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  const text = actionText(action, locale);
  const [artifactsOpen, setArtifactsOpen] = useState(false);
  const { scroller, jumpVisible, onScroll, jumpToLatest } = useThreadScroll(thread.messages.length);
  const heading = useRef<HTMLHeadingElement>(null);
  const artifactsButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const related = actionResources(action);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  function closeArtifacts() {
    setArtifactsOpen(false);
    requestAnimationFrame(() => artifactsButton.current?.focus());
  }
  function send(value: string) {
    const message = value.trim();
    if (!message) return;
    if (message !== thread.draft) onThreadChange({ ...thread, draft: message });
    onRequestPaid("message");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    send(thread.draft);
  }
  function resourceButton(resource: Resource) {
    return (
      <button
        className="action-thread-resource"
        key={resource.id}
        onClick={() => onResource(resource)}
      >
        <DemoIcon name={resource.url ? "globe" : "file"} />
        <span>
          <strong>{resource.title}</strong>
          <small>{resourceKind(resource.kind, locale)}</small>
        </span>
        <DemoIcon name={resource.url ? "external" : "arrow"} />
      </button>
    );
  }
  function reply(intent: ThreadIntent) {
    if (intent === "resources")
      return (
        <>
          <p>
            {c(
              "Here are the resources for this step.",
              "这是这一步可以使用的资源。",
              "Estos son los recursos para este paso.",
            )}
          </p>
          <div className="action-thread-resources">
            {related.map(resourceButton)}
          </div>
        </>
      );
    if (intent === "completion")
      return (
        <>
          <p>{action.completionEvidence}</p>
          <p>
            {c(
              "This step still needs your evidence. Reading a guide does not mark it complete.",
              "这一步仍需要你的真实材料，阅读指南不会将其标记为完成。",
              "Este paso necesita tus pruebas. Leer una guía no lo completa.",
            )}
          </p>
        </>
      );
    if (intent === "requirements")
      return (
        <>
          <p>{text.evidenceGoal}</p>
          {action.complianceConditions?.length ? (
            <ul>
              {action.complianceConditions.map((condition) => (
                <li key={condition.id}>
                  <strong>{condition.title}</strong>
                  <br />
                  {condition.instruction}
                </li>
              ))}
            </ul>
          ) : (
            <p>{text.instruction}</p>
          )}
        </>
      );
    if (intent === "limits")
      return (
        <>
          <p>
            {c(
              "In this demo, I can explain this step, show its documents, and walk through its requirements. I can’t check your personal documents or take action outside this preview.",
              "在此演示中，我可以解释这一步、展示文件并梳理要求，但不能核验你的个人材料或执行外部操作。",
              "En esta demo puedo explicar este paso y mostrar sus documentos y requisitos. No puedo verificar documentos personales ni realizar acciones externas.",
            )}
          </p>
          <div className="action-thread-suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => send(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </>
      );
    return (
      <>
        <p>{text.instruction}</p>
        <div className="action-thread-suggestions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} onClick={() => send(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      </>
    );
  }
  const suggestions = [
    c("What do I need?", "需要哪些材料？", "¿Qué necesito?"),
    c("Show the documents", "查看文件", "Ver documentos"),
    c(
      "How do I finish this step?",
      "怎样完成这一步？",
      "¿Cómo completo este paso?",
    ),
  ];
  return (
    <div className={`demo-action-chat${artifactsOpen ? " has-artifacts" : ""}`}>
      <section
        className="action-thread-main"
        aria-label={c("Action Thread", "行动对话", "Conversación de la acción")}
      >
        <header className="action-thread-header">
          <button
            className="demo-icon-button"
            onClick={onBack}
            aria-label={c(
              "Back to roadmap",
              "返回路线图",
              "Volver a la hoja de ruta",
            )}
          >
            <DemoIcon name="back" />
          </button>
          <h2 ref={heading} tabIndex={-1}>
            {text.title}
          </h2>
          <button
            className="demo-secondary"
            ref={artifactsButton}
            onClick={() => setArtifactsOpen(!artifactsOpen)}
            aria-expanded={artifactsOpen}
            aria-label={c("Artifacts", "材料", "Archivos")}
          >
            <DemoIcon name="file" />
            <span>{c("Artifacts", "材料", "Archivos")}</span>
          </button>
        </header>
        <div
          className="action-thread-scroller"
          ref={scroller}
          onScroll={onScroll}
        >
          <ol
            className="action-thread-messages"
            aria-label={c("Messages", "消息", "Mensajes")}
          >
            <li className="assistant">
              <div><AdditionalReview answers={answers} locale={locale} actionId={action.id} />{reply("guidance")}</div>
            </li>
            {thread.messages.map((message) => (
              <li key={message.id} className={message.role}>
                {message.role === "user" ? (
                  <p>{message.text}</p>
                ) : (
                  <div>{reply(message.intent)}</div>
                )}
              </li>
            ))}
          </ol>
          {(action.id === "book-bls-appointment" || action.id === "track-status") && (
            <div className="demo-automation-entry"><button className="demo-secondary" onClick={() => onRequestPaid("automation")}>
              <DemoIcon name="globe" />{c("Use browser automation", "使用浏览器自动化", "Automatización del navegador")}
            </button></div>
          )}
          <ThreadComposer id={`action-message-${action.id}`} locale={locale}
            value={thread.draft} onChange={draft => onThreadChange({ ...thread, draft })}
            onSubmit={submit} inputRef={input}
            label={c("Message about this action", "关于此行动的消息", "Mensaje sobre esta acción")}
            jumpVisible={jumpVisible} onJump={jumpToLatest} />
        </div>
      </section>
      {artifactsOpen && (
        <aside
          className="action-thread-artifacts"
          aria-label={c(
            "Action artifacts",
            "行动材料",
            "Archivos de la acción",
          )}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeArtifacts();
          }}
        >
          <header>
            <h3>{c("Artifacts", "材料", "Archivos")}</h3>
            <button
              className="demo-icon-button demo-close-button"
              ref={closeButton}
              aria-label={c("Close artifacts", "关闭材料", "Cerrar archivos")}
              onClick={closeArtifacts}
            >
              <DemoIcon name="close" />
            </button>
          </header>
          <div className="action-thread-artifact-content">
            {related.map(resourceButton)}
            <details>
              <summary>{c("Requirements", "要求", "Requisitos")}</summary>
              <p>{text.evidenceGoal}</p>
              {action.complianceConditions?.map((condition) => (
                <p key={condition.id}>{condition.instruction}</p>
              ))}
              <p>{action.completionEvidence}</p>
            </details>
            <details>
              <summary>{c("Sources", "来源", "Fuentes")}</summary>
              <p>
                {c(
                  "Curated references; not checked live in this demo.",
                  "已整理的参考来源；本演示未实时核验。",
                  "Referencias curadas; sin verificación en vivo.",
                )}
              </p>
              {actionSources(action).map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {new URL(source.url).hostname}
                  <DemoIcon name="external" />
                </a>
              ))}
            </details>
          </div>
        </aside>
      )}
    </div>
  );
}
