"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import type { AccountViewer } from "@/components/auth/account-button";
import { Icon } from "@/components/site-icon";
import { createClient } from "@/lib/supabase/client";
import { local, matchesRoute, restoreDemo, storageKey, type DemoState, type Locale } from "@/lib/demo/intake";
import { CaseWorkspace } from "./case-workspace";
import { DemoIcon } from "./icon";

export function DemoWorkspacePage({ viewer }: { viewer: AccountViewer }) {
  const router = useRouter();
  const [demo, setDemo] = useState<DemoState | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [darkTheme, setDarkTheme] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let restored: DemoState | null = null;
      let savedLocale: string | null = null;
      try {
        restored = restoreDemo(sessionStorage.getItem(storageKey));
        savedLocale = localStorage.getItem("locale");
        setDarkTheme(localStorage.getItem("theme") === "dark");
      } catch { /* Missing browser state returns to intake. */ }
      if (!restored || !matchesRoute(restored.answers)) {
        router.replace("/");
        return;
      }
      const lang = navigator.language.toLowerCase();
      setLocale(savedLocale === "en" || savedLocale === "cn" || savedLocale === "es" ? savedLocale : lang.startsWith("zh") ? "cn" : lang.startsWith("es") ? "es" : "en");
      setDemo({ ...restored, view: "workspace" });
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "cn" ? "zh-CN" : locale;
    try {
      localStorage.setItem("locale", locale);
      localStorage.setItem("theme", darkTheme ? "dark" : "light");
    } catch { /* Preferences are optional. */ }
  }, [locale, darkTheme, ready]);

  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_OUT") router.replace("/");
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  function updateDemo(next: DemoState) {
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* The mounted demo still works in memory. */ }
    setDemo(next);
    if (next.view === "thread") router.push("/");
  }

  return (
    <main className={`site stage-workspace${demo?.activeAction ? " has-active-action" : ""}${darkTheme ? " theme-dark" : ""}`} data-theme={darkTheme ? "dark" : "light"}>
      <header className="topbar">
        <button className="brand" type="button" aria-label={local(locale, "Back to conversation", "返回对话", "Volver a la conversación")} onClick={() => { if (demo) updateDemo({ ...demo, view: "thread" }); else router.push("/"); }}>
          <DemoIcon name="back" className="demo-back-icon" />
        </button>
          <div className="workspace-route-heading">
            <div className="workspace-journey-line">
              <span className="workspace-route-name">{local(locale, "Chengdu → Spain", "成都 → 西班牙", "Chengdú → España")}</span>
            </div>
            <div className="workspace-journey-meta" title={local(locale, "Tourism · Schengen short-stay · Employed adult · 1 applicant", "旅游 · 申根短期签证 · 在职成年人 · 1 位申请人", "Turismo · Estancia corta Schengen · Adulto empleado · 1 solicitante")}>
              <span>{local(locale, "Tourism · Schengen short-stay", "旅游 · 申根短期签证", "Turismo · Estancia corta Schengen")}</span>
              <span className="workspace-route-profile">{local(locale, "Employed adult · 1 applicant", "在职成年人 · 1 位申请人", "Adulto empleado · 1 solicitante")}</span>
            </div>
          </div>

        <div className="top-actions">
          <span className="theme-toggle locale-toggle">
            <Icon name="lang" />
            <select aria-label={local(locale, "Switch language", "切换语言", "Cambiar idioma")} value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              <option value="en">English</option><option value="cn">中文</option><option value="es">Español</option>
            </select>
          </span>
          <button className="theme-toggle" type="button" aria-label={darkTheme ? local(locale, "Use light theme", "使用浅色主题", "Usar tema claro") : local(locale, "Use dark theme", "使用深色主题", "Usar tema oscuro")} onClick={() => setDarkTheme(value => !value)}><Icon name={darkTheme ? "sun" : "moon"} /></button>
        </div>
      </header>
      <div className="demo-surface" aria-busy={!ready}>
        {demo && ready ? <CaseWorkspace state={demo} locale={locale} onChange={updateDemo} viewer={viewer} onSignedOut={() => router.replace("/")} /> : <p role="status" className="demo-workspace-loading">{local(locale, "Opening your workspace…", "正在打开工作台…", "Abriendo tu espacio…")}</p>}
      </div>
    </main>
  );
}
