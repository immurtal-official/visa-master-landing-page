"use client";

import { useLayoutEffect, useRef, type FormEvent, type RefObject } from "react";
import { local, type Locale } from "@/lib/demo/intake";
import { DemoIcon } from "./icon";

export function ThreadComposer({ id, locale, value, onChange, onSubmit, label,
  maxLength = 2000, inputRef, error, jumpVisible, onJump, disabled = false, submitDisabled = false,
}: {
  id: string; locale: Locale; value: string; onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void; label: string; maxLength?: number;
  inputRef?: RefObject<HTMLTextAreaElement | null>; error?: string;
  jumpVisible: boolean; onJump: () => void; disabled?: boolean; submitDisabled?: boolean;
}) {
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const field = inputRef ?? ownRef;
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  useLayoutEffect(() => {
    const input = field.current;
    if (!input) return;
    const resize = () => {
      input.style.height = "0px";
      input.style.height = `${Math.min(input.scrollHeight, 208)}px`;
    };
    resize();
    // Reflow wrapped drafts when the artifacts pane or viewport changes width.
    let width = input.clientWidth;
    const observer = new ResizeObserver(() => {
      if (input.clientWidth !== width) { width = input.clientWidth; resize(); }
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [value, field]);
  return (
    <div className="thread-composer-dock">
      <button className="thread-jump" type="button" hidden={!jumpVisible}
        aria-label={c("Jump to latest", "跳至最新消息", "Ir al último mensaje")}
        onClick={onJump}><DemoIcon name="arrow" /></button>
      {error && <p id={`${id}-error`} className="demo-error" role="alert">{error}</p>}
      <form className="thread-composer" onSubmit={onSubmit}>
        <label className="demo-sr-only" htmlFor={id}>{label}</label>
        <textarea ref={field} id={id} rows={1} maxLength={maxLength}
          value={value} disabled={disabled} onChange={event => onChange(event.target.value)}
          placeholder={c("Ask anything", "有问题，尽管问", "Pregunta lo que quieras")}
          aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (value.trim() && !submitDisabled) event.currentTarget.form?.requestSubmit();
            }
          }} />
        <button type="submit" disabled={disabled || submitDisabled || !value.trim()}
          aria-label={c("Send message", "发送消息", "Enviar mensaje")}><DemoIcon name="arrow" /></button>
      </form>
    </div>
  );
}
