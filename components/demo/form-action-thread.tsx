"use client";
import { formFollowupIntent } from "@/lib/demo/action-thread";

import { formPrompt } from "@/lib/demo/form-prompts";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { local, type DemoState, type Locale } from "@/lib/demo/intake";
import {
  empty,
  fieldError,
  formMap,
  formQuestions,
  type FormQuestion,
  type FormValue,
  type FormValues,
} from "@/lib/demo/official-form";
import { type Action, actionText } from "@/lib/demo/resources";
import { DemoIcon } from "./icon";
import { ThreadComposer } from "./thread-composer";
import { ResponseReveal } from "./response-reveal";
import { FormPdfOverlay } from "./form-pdf-overlay";
import { FormPdfPreview } from "./form-pdf-preview";
import { useThreadScroll } from "./use-thread-scroll";

function startingValues(state: DemoState): FormValues {
  if (state.formValues) return state.formValues;
  if (state.sample) return {};
  const v: FormValues = {};
  if (state.answers.age === "supported") v["applicant.is_minor"] = false;
  if (state.answers.passport === "supported") {
    v["applicant.nationality.current"] = "CHINA";
    v["travel_document.type"] = "ordinary_passport";
  }
  if (state.answers.destination === "supported")
    v["journey.destination.main"] = "SPAIN";
  if (state.answers.purpose === "supported")
    v["journey.purposes"] = ["tourism"];
  if (state.answers.funding === "supported") v["funding.payer"] = ["applicant"];
  return v;
}
export function FormActionThread({
  state,
  onChange,
  locale,
  action,
  onBack,
}: {
  state: DemoState;
  onChange: (state: DemoState) => void;
  locale: Locale;
  action: Action;
  onBack: () => void;
}) {
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  const values = useMemo(() => startingValues(state), [state]);
  const questions = useMemo(() => {
    const fields = formQuestions(locale, values);
    const first = [
      "applicant.name.family",
      "applicant.name.family_at_birth",
      "applicant.name.given",
      "applicant.birth.date",
      "applicant.birth.place",
      "applicant.birth.country",
    ];
    return [
      ...first.flatMap((id) => fields.filter((q) => q.id === id)),
      ...fields.filter((q) => !first.includes(q.id)),
    ];
  }, [locale, values]);
  const turns = state.formTurns ?? [];
  const [initialTurnCount] = useState(turns.length);
  const [editing, setEditing] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState(false);
  const [pdfOverlay, setPdfOverlay] = useState(false);
  const [pageOverride, setPageOverride] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [rendered, setRendered] = useState<{
    bytes: Uint8Array;
    errors: Record<string, string>;
    values: FormValues;
  } | null>(null);
  const [pdfError, setPdfError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const artifactButton = useRef<HTMLButtonElement>(null);
  const artifactClose = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const errors = rendered?.values === values ? rendered.errors : {};
  const q =
    questions.find((q) => q.id === editing) ??
    questions.find(
      (q) =>
        fieldError(q, values[q.profileKey]) ||
        errors[q.id] ||
        (empty(values[q.profileKey]) &&
          (q.required || !turns.some((t) => t.questionId === q.id))),
    );
  const draft = state.threads?.[action.id]?.draft ?? "";
  const { scroller, onScroll, jumpVisible, jumpToLatest, resumeFollowing } =
    useThreadScroll(
      `${turns.length}:${state.threads?.[action.id]?.messages.length ?? 0}:${q?.id}:${editing}`,
    );
  const page =
    pageOverride ??
    formMap.placements.find((p) => p.questionId === q?.id)?.page ??
    1;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (artifacts) artifactClose.current?.focus();
  }, [artifacts]);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      void import("@/lib/demo/form-pdf")
        .then((m) => m.renderFormPdf(values))
        .then((result) => {
          if (!cancelled) {
            setRendered({ ...result, values });
            setPdfError("");
          }
        })
        .catch((e) => {
          if (!cancelled) setPdfError(String(e));
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [values]);
  const prompt = (question: FormQuestion) =>
    formPrompt(question, locale, values);
  function setDraft(text: string) {
    onChange({
      ...state,
      formValues: values,
      threads: {
        ...state.threads,
        [action.id]: {
          messages: state.threads?.[action.id]?.messages ?? [],
          draft: text,
        },
      },
    });
  }
  function submit(value: FormValue, skip = false) {
    if (!q) return;
    const problem = fieldError(q, value);
    if (problem || (!skip && empty(value))) {
      setError(
        problem ??
          c(
            "Enter an answer first.",
            "请先填写答案。",
            "Escribe una respuesta.",
          ),
      );
      return;
    }
    const text = skip
      ? c("Not applicable", "不适用", "No corresponde")
      : typeof value === "boolean"
        ? value
          ? c("Yes", "是", "Sí")
          : c("No", "否", "No")
        : Array.isArray(value)
          ? value
              .map((v) => q.choices?.find((ch) => ch.value === v)?.label ?? v)
              .join(", ")
          : (q.choices?.find((ch) => ch.value === value)?.label ?? value);
    onChange({
      ...state,
      formValues: { ...values, [q.profileKey]: value },
      formTurns: [...turns, { questionId: q.id, prompt: prompt(q), text }],
      threads: {
        ...state.threads,
        [action.id]: {
          messages: state.threads?.[action.id]?.messages ?? [],
          draft: "",
        },
      },
    });
    setEditing(null);
    setError("");
    setHelp(false);
    setChoices([]);
    setPageOverride(null);
    resumeFollowing();
  }
  function send() {
    const text = draft.trim();
    if (!text) return;
    if (!q) {
      onChange({
        ...state,
        formValues: values,
        threads: {
          ...state.threads,
          [action.id]: {
            draft: "",
            messages: [
              ...(state.threads?.[action.id]?.messages ?? []),
              { id: crypto.randomUUID(), role: "user", text },
              {
                id: crypto.randomUUID(),
                role: "assistant",
                intent: formFollowupIntent(text),
              },
            ],
          },
        },
      });
      setError("");
      resumeFollowing();
      return;
    }
    if (/^(what|why|how|help|什么意思|为什么|怎么|解释)\b|[?？]$/i.test(text)) {
      setHelp(true);
      return;
    }
    if (q.type === "boolean") {
      if (/^(yes|是|sí|si)$/i.test(text)) submit(true);
      else if (/^(no|否|不是)$/i.test(text)) submit(false);
      else setError(c("Choose Yes or No.", "请选择是或否。", "Elige Sí o No."));
      return;
    }
    if (q.choices) {
      const parts =
        q.type === "multiple-choice"
          ? text.split(/[,，]/).map((v) => v.trim())
          : [text];
      const selected = parts.map(
        (v) =>
          q.choices?.find(
            (ch, i) =>
              ch.value === v ||
              ch.label.toLowerCase() === v.toLowerCase() ||
              String(i + 1) === v,
          )?.value,
      );
      if (selected.some((v) => !v)) {
        setError(
          c(
            "Choose one of the options below the question.",
            "请使用问题下方的选项。",
            "Elige una de las opciones.",
          ),
        );
        return;
      }
      submit(
        q.type === "multiple-choice" ? (selected as string[]) : selected[0]!,
      );
      return;
    }
    submit(text);
  }
  function edit(id: string) {
    setEditing(id);
    setChoices(Array.isArray(values[id]) ? (values[id] as string[]) : []);
    setError("");
    setHelp(false);
    setPageOverride(null);
    setArtifacts(false);
    setDraft(typeof values[id] === "string" ? (values[id] as string) : "");
    resumeFollowing();
  }
  function closeArtifacts() {
    setArtifacts(false);
    artifactButton.current?.focus();
  }
  function download() {
    if (
      !rendered ||
      rendered.values !== values ||
      Object.keys(rendered.errors).length ||
      pdfError
    )
      return;
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(rendered.bytes)], { type: "application/pdf" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Spain-Schengen-application-draft.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return (
    <div className={`demo-action-chat${artifacts ? " has-artifacts" : ""}`}>
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
            {actionText(action, locale).title}
          </h2>
          <button
            className="demo-secondary"
            ref={artifactButton}
            aria-expanded={artifacts}
            aria-label={c("Artifacts", "材料", "Archivos")}
            onClick={() => setArtifacts(!artifacts)}
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
            {turns.filter(turn => turn.questionId !== "journey.host_details_required" || questions.some(q => q.id === turn.questionId)).map((turn, i) => (
              <Fragment key={i}>
                <li className="assistant">
                  <p>
                    {questions.find(
                      (question) => question.id === turn.questionId,
                    )
                      ? prompt(
                          questions.find(
                            (question) => question.id === turn.questionId,
                          )!,
                        )
                      : turn.prompt}
                  </p>
                </li>
                <li className="user">
                  {questions.some((q) => q.id === turn.questionId) ? (
                    <button
                      className="demo-answer-bubble"
                      disabled={busy}
                      aria-label={`${c("Edit answer", "修改答案", "Editar respuesta")}: ${turn.prompt}`}
                      onClick={() => edit(turn.questionId)}
                    >
                      {turn.text}
                      <span aria-hidden="true">
                        {c("Edit", "修改", "Editar")}
                      </span>
                    </button>
                  ) : (
                    <p>{turn.text}</p>
                  )}
                </li>
              </Fragment>
            ))}
            <li className="assistant">
              {q ? (
                <div key={`${q.id}:${turns.length}:${editing}`}>
                  <ResponseReveal
                    text={prompt(q)}
                    locale={locale}
                    animate={turns.length > initialTurnCount}
                    onBusyChange={setBusy}
                  />
                  {!busy && (
                    <div className="form-thread-controls">
                      {q.type === "boolean" && (
                        <div className="form-thread-options">
                          {[true, false].map((v) => (
                            <button
                              className="demo-secondary"
                              key={String(v)}
                              onClick={() => submit(v)}
                            >
                              {v ? c("Yes", "是", "Sí") : c("No", "否", "No")}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === "single-choice" && (
                        <div className="form-thread-options">
                          {q.choices?.map((choice) => (
                            <button
                              className="demo-secondary"
                              key={choice.value}
                              onClick={() => submit(choice.value)}
                            >
                              {choice.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === "multiple-choice" && (
                        <>
                          <div className="form-thread-options">
                            {q.choices?.map((choice) => (
                              <button
                                className="demo-secondary"
                                aria-pressed={choices.includes(choice.value)}
                                key={choice.value}
                                onClick={() =>
                                  setChoices(
                                    choices.includes(choice.value)
                                      ? choices.filter(
                                          (v) => v !== choice.value,
                                        )
                                      : [...choices, choice.value],
                                  )
                                }
                              >
                                {choice.label}
                              </button>
                            ))}
                          </div>
                          <button
                            className="demo-secondary"
                            disabled={!choices.length}
                            onClick={() => submit(choices)}
                          >
                            {c(
                              "Confirm selection",
                              "确认选择",
                              "Confirmar selección",
                            )}
                          </button>
                        </>
                      )}
                      {q.type === "date" && (
                        <label className="form-thread-date">
                          {c(
                            "Choose a date or type YYYY-MM-DD below.",
                            "请选择日期，或在下方输入 YYYY-MM-DD。",
                            "Elige una fecha o escribe AAAA-MM-DD.",
                          )}
                          <input
                            type="date"
                            value={
                              /^\d{4}-\d{2}-\d{2}$/.test(draft) ? draft : ""
                            }
                            onChange={(e) => setDraft(e.target.value)}
                          />
                        </label>
                      )}
                      {!q.required && (
                        <button
                          className="form-answer-edit"
                          onClick={() => submit("", true)}
                        >
                          {c("Not applicable", "不适用", "No corresponde")}
                        </button>
                      )}
                      {editing && (
                        <button
                          className="form-answer-edit"
                          onClick={() => {
                            setEditing(null);
                            setDraft("");
                          }}
                        >
                          {c("Cancel edit", "取消修改", "Cancelar")}
                        </button>
                      )}
                      {help && (
                        <p>
                          {q.guidance ??
                            c(
                              "Answer for your own trip using the details in your passport or supporting documents. You can revise any answer in this thread.",
                              "请根据自己的行程、护照或证明材料作答。你可以在对话中修改之前的答案。",
                              "Responde con los datos de tu viaje y documentos. Puedes corregir tus respuestas aquí.",
                            )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p>
                    {c(
                      "Your answers are ready for review. Open Artifacts to check the PDF and any prefilled details, then download your draft. Photo and signature stay blank; this does not mark the action complete.",
                      "答案已填写完毕。请打开“材料”检查 PDF 和预填信息，然后下载草稿。照片和签名仍需自行补充，此行动不会自动标记为完成。",
                      "Revisa el PDF y los datos prellenados en Archivos y descarga el borrador. La foto y firma quedan en blanco; la acción no se completa automáticamente.",
                    )}
                  </p>
                  <button
                    className="demo-secondary"
                    onClick={() => setPdfOverlay(true)}
                  >
                    {c("Review PDF", "检查 PDF", "Revisar PDF")}
                  </button>
                </div>
              )}
            </li>
            {(state.threads?.[action.id]?.messages ?? []).map((message) => (
              <li key={message.id} className={message.role}>
                {message.role === "user" ? (
                  <p>{message.text}</p>
                ) : (
                  <div>
                    <p>
                      {message.intent === "completion"
                        ? c(
                            "The draft leaves photo and signature areas blank. Review the PDF before adding your photo and signing; downloading it does not complete this action.",
                            "草稿中的照片和签名区域保留空白。请先检查 PDF，再补充照片并签名；下载不会将此行动标记为完成。",
                            "El borrador deja la foto y firma en blanco. Revisa el PDF antes de añadirlas; descargar no completa la acción.",
                          )
                        : message.intent === "requirements"
                          ? c(
                              "Which answer would you like to change? Select it below. I’ll ask that question again and update the PDF after you answer.",
                              "你想修改哪项答案？请在下方选择，我会重新询问该项，并在你作答后更新 PDF。",
                              "¿Qué respuesta quieres cambiar? Selecciónala abajo y el PDF se actualizará cuando respondas.",
                            )
                          : message.intent === "resources"
                            ? c(
                                "Open Artifacts to review all five pages and download the latest draft. You can still revise your answers.",
                                "打开“材料”即可检查全部五页并下载最新草稿。你仍然可以修改答案。",
                                "Abre Archivos para revisar las cinco páginas y descargar el borrador actualizado. Puedes seguir corrigiendo respuestas.",
                              )
                            : c(
                                "This demo can help you revise answers or review and download the PDF. An agent isn’t connected for other questions yet. What would you like to change?",
                                "此演示可以继续修改答案、检查和下载 PDF。其他问题尚未接入智能助手。你想修改哪项内容？",
                                "Esta demo permite corregir respuestas y revisar o descargar el PDF. Aún no hay un agente para otras preguntas.",
                              )}
                    </p>
                    {(message.intent === "requirements" ||
                      message.intent === "limits") && (
                      <details>
                        <summary>
                          {c(
                            "Choose an answer to edit",
                            "选择要修改的答案",
                            "Elige una respuesta",
                          )}
                        </summary>
                        <div className="form-answer-review">
                          {questions.map((question) => (
                            <button
                              key={question.id}
                              onClick={() => edit(question.id)}
                            >
                              {question.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    )}
                    <button
                      className="demo-secondary"
                      onClick={() => setPdfOverlay(true)}
                    >
                      {c("Review PDF", "检查 PDF", "Revisar PDF")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <ThreadComposer
            id="official-form-answer"
            locale={locale}
            value={draft}
            onChange={setDraft}
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            inputRef={input}
            label={
              q
                ? prompt(q)
                : c(
                    "Ask about your application form",
                    "询问申请表相关问题",
                    "Pregunta sobre el formulario",
                  )
            }
            error={error}
            submitDisabled={!!q && busy}
            jumpVisible={jumpVisible}
            onJump={jumpToLatest}
          />
        </div>
      </section>
      {artifacts && (
        <aside
          className="action-thread-artifacts form-thread-artifacts"
          aria-label={c("Artifacts", "材料", "Archivos")}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeArtifacts();
          }}
        >
          <header>
            <h3>
              {c("Application draft", "申请表草稿", "Borrador de solicitud")}
            </h3>
            <button
              ref={artifactClose}
              className="demo-icon-button demo-close-button"
              aria-label={c("Close artifacts", "关闭材料", "Cerrar archivos")}
              onClick={closeArtifacts}
            >
              <DemoIcon name="close" />
            </button>
          </header>
          <div className="action-thread-artifact-content">
            <div className="form-artifact-toolbar">
              <button
                disabled={page === 1}
                onClick={() => setPageOverride(page - 1)}
                aria-label="Previous PDF page"
              >
                ←
              </button>
              <span>{page} / 5</span>
              <button
                disabled={page === 5}
                onClick={() => setPageOverride(page + 1)}
                aria-label="Next PDF page"
              >
                →
              </button>
            </div>
            <button className="form-pdf-preview-open" onClick={() => setPdfOverlay(true)} aria-label={c("Enlarge PDF preview", "放大 PDF 预览", "Ampliar PDF")}>
            <FormPdfPreview
              bytes={rendered?.bytes ?? null}
              page={page}
              questionId={q?.id ?? ""}
            />
            </button>
            <p className="form-artifact-note">
              {c(
                "Draft · Review all five pages. Photo and signature remain blank.",
                "草稿 · 请检查全部五页，照片和签名保留空白。",
                "Borrador · Revisa las cinco páginas. Foto y firma en blanco.",
              )}
            </p>
            {pdfError && <p role="alert">{pdfError}</p>}
            {Object.keys(errors).length > 0 && (
              <p role="alert">
                {c(
                  "Some answers need correcting before export.",
                  "部分答案需要修正后才能导出。",
                  "Corrige las respuestas antes de exportar.",
                )}
              </p>
            )}
            <button
              className="demo-secondary"
              disabled={
                rendered?.values !== values ||
                !!pdfError ||
                Object.keys(errors).length > 0
              }
              onClick={download}
            >
              {c(
                "Download draft PDF",
                "下载 PDF 草稿",
                "Descargar PDF borrador",
              )}
            </button>
            <details>
              <summary>
                {c(
                  "Review answers and prefilled details",
                  "检查答案与预填信息",
                  "Revisar respuestas",
                )}
              </summary>
              <div className="form-answer-review">
                {questions.map((question) => (
                  <button key={question.id} onClick={() => edit(question.id)}>
                    <span>{question.label}</span>
                    <small>
                      {empty(values[question.profileKey])
                        ? c("Not filled", "未填写", "Pendiente")
                        : Array.isArray(values[question.profileKey])
                          ? (values[question.profileKey] as string[]).join(", ")
                          : String(values[question.profileKey])}
                    </small>
                  </button>
                ))}
              </div>
            </details>
            <p className="form-artifact-note">
              {c(
                "Official source retrieved July 31, 2026. Answers are saved in this tab.",
                "官方表格获取于2026年7月31日。答案保存在当前标签页。",
                "Fuente oficial obtenida el 31 de julio de 2026. Datos guardados en esta pestaña.",
              )}
            </p>
          </div>
        </aside>
      )}
      {pdfOverlay && <FormPdfOverlay bytes={rendered?.bytes ?? null} initialPage={page} locale={locale} onClose={() => setPdfOverlay(false)} />}
    </div>
  );
}
