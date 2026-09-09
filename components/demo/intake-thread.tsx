"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  answerLabel,
  fieldIds,
  local,
  matchesRoute,
  nextQuestion,
  applyIntakeMessage,
  questions,
  unsupportedQuestion,
  type DemoState,
  type FieldId,
  type Locale,
} from "@/lib/demo/intake";
import { AdditionalReview } from "./additional-review";
import { ThreadComposer } from "./thread-composer";
import { useThreadScroll } from "./use-thread-scroll";
import { ResponseReveal } from "./response-reveal";
import { DemoIcon } from "./icon";

export function IntakeThread({
  state,
  locale,
  onChange,
  animateInitial = false,
}: {
  animateInitial?: boolean;
  state: DemoState;
  locale: Locale;
  onChange: (state: DemoState) => void;
}) {
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  const [animate, setAnimate] = useState(animateInitial);
  const [generating, setGenerating] = useState(animateInitial);
  const [editing, setEditing] = useState<FieldId>();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const activeHeadingRef = useRef<HTMLHeadingElement>(null);
  const unsupported = unsupportedQuestion(state.answers);
  const current =
    editing ?? (unsupported ? undefined : nextQuestion(state.answers));
  const complete = matchesRoute(state.answers) && !editing;
  const count = fieldIds.filter((id) => state.answers[id]).length;
  const question = current && questions[current];
  const { scroller, resumeFollowing, jumpVisible, onScroll, jumpToLatest } = useThreadScroll(`${count}-${current}-${complete}-${unsupported}`);
  useEffect(() => {
    activeHeadingRef.current?.focus({ preventScroll: true });
  }, [count, current, complete, unsupported]);

  function answer(value: string) {
    if (!current || generating) return;
    setAnimate(true);
    setGenerating(true);
    resumeFollowing();
    onChange({ ...state, answers: { ...state.answers, [current]: value }, inferred: state.inferred?.filter(id => id !== current), replies: [...(state.replies ?? []), { question: current, text: answerLabel(current, value, locale) }].slice(-100) });
    setEditing(undefined);
    setDraft("");
    setError("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!current || generating || !draft.trim()) return;
    const answers = applyIntakeMessage(state.answers, draft, current);
    if (JSON.stringify(answers) === JSON.stringify(state.answers)) {
      setError(
        c(
          "Please choose the answer that fits below, so I do not assume the wrong details.",
          "请从上方选项中选择，避免误解你的情况。",
          "Elige una de las opciones para evitar suposiciones incorrectas.",
        ),
      );
      return;
    }
    resumeFollowing();
    setAnimate(true);
    setGenerating(true);
    const inferred = new Set(state.inferred ?? []);
    for (const id of fieldIds) if (id !== current && answers[id] && answers[id] !== state.answers[id]) inferred.add(id);
    inferred.delete(current);
    onChange({ ...state, answers, inferred: [...inferred], replies: [...(state.replies ?? []), { question: current, text: draft.trim() }].slice(-100) });
    setEditing(undefined);
    setDraft("");
    setError("");
  }
  function edit(id: FieldId) {
    setAnimate(false);
    resumeFollowing();
    setEditing(id);
    setDraft("");
    setError("");
  }
  return (
    <section
      className="demo-thread demo-enter"
      aria-label={c(
        "Route conversation",
        "路线对话",
        "Conversación sobre tu ruta",
      )}
    >
      <div className="demo-thread-scroll" ref={scroller} onScroll={onScroll}>
        <div className="demo-conversation">
          <div className="demo-user-message">{state.query}</div>
          {(state.replies ?? fieldIds.filter(id => state.answers[id] && !state.inferred?.includes(id)).map(id => ({ question: id, text: answerLabel(id, state.answers[id]!, locale) }))).map((reply, index) => (
            <div className="demo-exchange" key={index}>
              <p>{questions[reply.question].prompt[locale]}</p>
              <button className="demo-answer-bubble" disabled={generating} onClick={() => edit(reply.question)}
                aria-label={`${c("Edit", "修改", "Editar")} ${questions[reply.question].label[locale]}`}>
                {reply.text}<span aria-hidden="true">{c("Edit", "修改", "Editar")}</span>
              </button>
            </div>
          ))}
          <div>
            {question && current && (
              <div className="demo-question" key={`${current}-${count}-${state.replies?.length}-${locale}`}>
                <ResponseReveal title={question.prompt[locale]} text={question.detail[locale]} locale={locale} animate={animate} headingRef={activeHeadingRef} onBusyChange={setGenerating}>
                <div className="demo-options">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        answer(index === 0 ? "supported" : "unsupported")
                      }
                    >
                      {option[locale]}
                      <DemoIcon name="arrow" />
                    </button>
                  ))}
                </div>
                </ResponseReveal>
              </div>
            )}
            {unsupported && !editing && (
              <div className="demo-question" key={`demo-question-${count}-${locale}`}><ResponseReveal title={c(
                    "This preview isn’t a match yet.",
                    "当前演示路线与你的情况不匹配。",
                    "Esta vista previa no encaja todavía.",
                  )} text={c(
                    "This answer needs a route or additional checks outside this demo. It does not mean you cannot apply for a visa.",
                    "这个回答需要此演示之外的路线或额外核验，不代表你不能申请签证。",
                    "Esta respuesta requiere otra ruta o comprobaciones fuera de la demo. No significa que no puedas solicitar un visado.",
                  )} locale={locale} animate={animate} headingRef={activeHeadingRef} onBusyChange={setGenerating}>
                <div className="demo-options">
                  <button onClick={() => edit(unsupported)}>
                    {c(
                      "Change my answer",
                      "修改我的回答",
                      "Cambiar mi respuesta",
                    )}
                    <DemoIcon name="back" />
                  </button>
                  <button
                    onClick={() => {
                      setAnimate(true);
                      setGenerating(true);
                      onChange({
                        ...state,
                        sample: true,
                        answers: Object.fromEntries(
                          fieldIds.map((id) => [id, "supported"]),
                        ),
                        view: "thread",
                      });
                    }}
                  >
                    {c(
                      "Explore a sample applicant",
                      "体验示例申请人",
                      "Explorar un solicitante de ejemplo",
                    )}
                    <DemoIcon name="arrow" />
                  </button>
                </div>
                </ResponseReveal>
              </div>
            )}
            {complete && (
              <div className="demo-match" key={`demo-match-${count}-${locale}`}><ResponseReveal title={c(
                    "Your route is ready.",
                    "路线已准备好。",
                    "Tu ruta está lista.",
                  )} text={c(
                    "Confirm your details to open the roadmap.",
                    "确认信息后，打开行动路线图。",
                    "Confirma tus datos para abrir la hoja de ruta.",
                  )} locale={locale} animate={animate} headingRef={activeHeadingRef} onBusyChange={setGenerating}>
                <AdditionalReview answers={state.answers} locale={locale} />
                <dl className="demo-review">
                  {fieldIds.map((id) => (
                    <div key={id}>
                      <dt>{questions[id].label[locale]}</dt>
                      <dd>
                        {answerLabel(id, state.answers[id]!, locale)}
                        <button
                          onClick={() => edit(id)}
                          aria-label={`${c("Edit", "修改", "Editar")} ${questions[id].label[locale]}`}
                        >
                          {c("Edit", "修改", "Editar")}
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
                <button
                  className="demo-primary"
                  onClick={() => onChange({ ...state, view: "workspace" })}
                >
                  {c(
                    "Open my Workspace",
                    "打开我的工作台",
                    "Abrir mi espacio de trabajo",
                  )}
                  <DemoIcon name="arrow" />
                </button>
                {state.sample && (
                  <small>
                    {c(
                      "Sample applicant",
                      "示例申请人",
                      "Solicitante de ejemplo",
                    )}
                  </small>
                )}
                </ResponseReveal>
              </div>
            )}
          </div>
        </div>
        <ThreadComposer id="demo-answer" locale={locale} value={draft}
          onChange={value => { setDraft(value); setError(""); }} onSubmit={submit}
          label={question?.prompt[locale] ?? c("Message", "消息", "Mensaje")}
          maxLength={1000} error={error} disabled={!current} submitDisabled={generating}
          jumpVisible={jumpVisible} onJump={jumpToLatest} />
      </div>
    </section>
  );
}
