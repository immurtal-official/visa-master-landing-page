"use client";

import createGlobe from "cobe";
import { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

import { AuthDialog } from "@/components/auth/auth-panel";
import { AccountButton } from "@/components/auth/account-button";

type Stage = "idle" | "checking" | "ready";

const dict = {
  en: {
    home: "Visa Master home",
    getStarted: "Get started",
    finishSetup: "Finish setup",
    useLight: "Use light theme",
    useDark: "Use dark theme",
    localeName: "Switch language",
    lead: "DIY visa applications.",
    easy: "The easy way.",
    subhead: "Get step-by-step guidance based on current official requirements. Visa Master helps organize your evidence, prepare consistent documents, and deliver a ready-to-go application pack while you stay in control.",
    dest: "Travel destination",
    placeholder: "Travel to somewhere",
    buildPlan: "Build my visa plan",
    try: "Try",
    suggestions: ["Chengdu → Madrid", "UK visitor visa", "Spain nomad visa"],
    mapping: "Mapping your route",
    checking: "Checking jurisdiction, entry rules and official sources…",
    yourRoute: "YOUR ROUTE",
    edit: "Edit",
    assistant: "I checked your route against official sources. Here’s the application workspace I prepared.",
    sources: "official sources",
    mapped: "Requirements mapped",
    updated: "Updated today",
    workspace: "GENERATED WORKSPACE",
    pack: "France · Short-stay visa",
    files: "8 files",
    rows: [["01", "Application roadmap", "Interactive checklist"], ["02", "Requirements matrix", "Evidence matched"], ["03", "Cover letter", "Ready to personalize"], ["04", "Travel itinerary", "12 days · generated"]],
    download: "Download pack",
    open: "Open my workspace",
    showPhoto: "Show photo for",
    hidePhoto: "Hide photo for",
  },
  cn: {
    home: "Visa Master 首页",
    getStarted: "立即体验",
    finishSetup: "完成设置",
    useLight: "切换到浅色主题",
    useDark: "切换到深色主题",
    localeName: "切换语言",
    lead: "DIY 签证申请。",
    easy: "轻松搞定。",
    subhead: "基于最新官方要求，获取分步指导。Visa Master 帮你整理证明材料、准备一致的文件，交付一份即用型申请材料包，全程由你掌控。",
    dest: "旅行目的地",
    placeholder: "想去哪里旅行",
    buildPlan: "生成我的签证方案",
    try: "试试",
    suggestions: ["成都 → 马德里", "英国旅游签证", "西班牙数字游民签证"],
    mapping: "正在规划路线",
    checking: "正在核对管辖范围、入境规则和官方来源…",
    yourRoute: "你的路线",
    edit: "编辑",
    assistant: "我已对照官方来源核对了你的路线。这是我为你准备的申请工作台。",
    sources: "个官方来源",
    mapped: "需求已匹配",
    updated: "今日已更新",
    workspace: "生成的工作台",
    pack: "法国 · 短期签证",
    files: "8 个文件",
    rows: [["01", "申请路线图", "交互式清单"], ["02", "需求矩阵", "证据已匹配"], ["03", "求职信", "可个性化"], ["04", "旅行行程", "12 天 · 已生成"]],
    download: "下载材料包",
    open: "打开我的工作台",
    showPhoto: "显示照片：",
    hidePhoto: "隐藏照片：",
  },
  es: {
    home: "Inicio de Visa Master",
    getStarted: "Empezar",
    finishSetup: "Completar perfil",
    useLight: "Usar tema claro",
    useDark: "Usar tema oscuro",
    localeName: "Cambiar idioma",
    lead: "Solicitudes de visa DIY.",
    easy: "La forma fácil.",
    subhead: "Obtén guía paso a paso basada en los requisitos oficiales vigentes. Visa Master te ayuda a organizar tus pruebas, preparar documentos consistentes y entregar un paquete de solicitud listo para usar, mientras tú mantienes el control.",
    dest: "Destino de viaje",
    placeholder: "Viajar a algún lugar",
    buildPlan: "Crear mi plan de visa",
    try: "Prueba",
    suggestions: ["Chengdú → Madrid", "Visado de visitante del Reino Unido", "Visado nómada de España"],
    mapping: "Trazando tu ruta",
    checking: "Comprobando jurisdicción, reglas de entrada y fuentes oficiales…",
    yourRoute: "TU RUTA",
    edit: "Editar",
    assistant: "Verifiqué tu ruta con fuentes oficiales. Aquí está el espacio de trabajo que preparé.",
    sources: "fuentes oficiales",
    mapped: "Requisitos mapeados",
    updated: "Actualizado hoy",
    workspace: "ESPACIO DE TRABAJO GENERADO",
    pack: "Francia · Visado de corta estancia",
    files: "8 archivos",
    rows: [["01", "Hoja de ruta", "Lista interactiva"], ["02", "Matriz de requisitos", "Evidencia emparejada"], ["03", "Carta de presentación", "Lista para personalizar"], ["04", "Itinerario de viaje", "12 días · generado"]],
    download: "Descargar paquete",
    open: "Abrir mi espacio de trabajo",
    showPhoto: "Mostrar foto de",
    hidePhoto: "Ocultar foto de",
  },
} as const;

type Locale = keyof typeof dict;

const globeThemes = {
  passage: { dark: 0, base: [0.91, 0.89, 0.82], marker: [0.16, 0.28, 0.95], glow: [0.78, 0.84, 1] },
  nightflight: { dark: 1, base: [0.05, 0.08, 0.24], marker: [0.98, 0.55, 0.22], glow: [0.08, 0.15, 0.5] },
} as const;

const landmarks = [
  { id: "paris", city: { en: "Paris", cn: "巴黎", es: "París" }, place: { en: "Eiffel Tower", cn: "埃菲尔铁塔", es: "Torre Eiffel" }, location: [48.86, 2.35] as [number, number], photo: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "tokyo", city: { en: "Tokyo", cn: "东京", es: "Tokio" }, place: { en: "Tokyo Tower", cn: "东京塔", es: "Torre de Tokio" }, location: [35.68, 139.69] as [number, number], photo: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "giza", city: { en: "Giza", cn: "吉萨", es: "Guiza" }, place: { en: "Great Pyramids", cn: "大金字塔", es: "Grandes Pirámides" }, location: [29.98, 31.13] as [number, number], photo: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "newyork", city: { en: "New York", cn: "纽约", es: "Nueva York" }, place: { en: "Statue of Liberty", cn: "自由女神像", es: "Estatua de la Libertad" }, location: [40.69, -74.04] as [number, number], photo: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "rio", city: { en: "Rio", cn: "里约", es: "Río" }, place: { en: "Christ the Redeemer", cn: "基督像", es: "Cristo Redentor" }, location: [-22.95, -43.21] as [number, number], photo: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "sydney", city: { en: "Sydney", cn: "悉尼", es: "Sídney" }, place: { en: "Opera House", cn: "歌剧院", es: "Ópera de Sídney" }, location: [-33.87, 151.21] as [number, number], photo: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "singapore", city: { en: "Singapore", cn: "新加坡", es: "Singapur" }, place: { en: "Jewel Changi", cn: "星耀樟宜", es: "Jewel Changi" }, location: [1.35, 103.82] as [number, number], photo: "https://images.unsplash.com/photo-1752859677447-2739187de181?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "beijing", city: { en: "Beijing", cn: "北京", es: "Pekín" }, place: { en: "Forbidden City", cn: "故宫", es: "Ciudad Prohibida" }, location: [39.9, 116.4] as [number, number], photo: "https://images.unsplash.com/photo-1555085634-3444448f450c?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "chengdu", city: { en: "Chengdu", cn: "成都", es: "Chengdú" }, place: { en: "Giant Panda Base", cn: "大熊猫基地", es: "Base de Pandas Gigantes" }, location: [30.67, 104.07] as [number, number], photo: "https://touristtraveltips.com/images/east-asia/china_chengdu_panda_1769657028016.webp" },
  { id: "sanfrancisco", city: { en: "San Francisco", cn: "旧金山", es: "San Francisco" }, place: { en: "Golden Gate", cn: "金门大桥", es: "Puente Golden Gate" }, location: [37.77, -122.42] as [number, number], photo: "https://images.unsplash.com/photo-1510883327084-b48fb14fc7cf?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "madrid", city: { en: "Madrid", cn: "马德里", es: "Madrid" }, place: { en: "Royal Palace", cn: "皇宫", es: "Palacio Real" }, location: [40.42, -3.7] as [number, number], photo: "https://images.unsplash.com/photo-1569676814972-31aa39db5817?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "buenosaires", city: { en: "Buenos Aires", cn: "布宜诺斯艾利斯", es: "Buenos Aires" }, place: { en: "The Obelisk", cn: "方尖碑", es: "El Obelisco" }, location: [-34.6, -58.38] as [number, number], photo: "https://images.unsplash.com/photo-1745409927264-0db48faf407b?auto=format&fit=crop&w=280&h=280&q=76" },
  { id: "capetown", city: { en: "Cape Town", cn: "开普敦", es: "Ciudad del Cabo" }, place: { en: "Table Mountain", cn: "桌山", es: "Montaña de la Mesa" }, location: [-33.92, 18.42] as [number, number], photo: "https://images.unsplash.com/photo-1744604030401-b24c5975a574?auto=format&fit=crop&w=280&h=280&q=76" },
] as const;

function Globe({ themeName, docked, locale }: { themeName: keyof typeof globeThemes; docked: boolean; locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const dockedRef = useRef(docked);
  const dragRef = useRef({ active: false, x: 0, y: 0, dx: 0, dy: 0 });
  const [webgl, setWebgl] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(() => new Set());
  const t = dict[locale];

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    let phi = 0.4;
    let theta = 0.18;
    let frame = 0;
    const theme = globeThemes[themeName];
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2, width: 760, height: 760, phi, theta,
      dark: theme.dark, diffuse: 1.4,
      mapSamples: 18000,
      mapBrightness: themeName === "nightflight" ? 5 : 2.8,
      baseColor: [...theme.base], markerColor: [...theme.marker], glowColor: [...theme.glow],
      markers: landmarks.map(({ id, location }) => ({ id, location: [...location] as [number, number], size: 0.024 })),
      markerElevation: 0,
      opacity: 0.96,
    });
    const wrapper = canvas.parentElement;
    globeRef.current = globe;
    setWebgl(true);

    const render = () => {
      if (dragRef.current.dx || dragRef.current.dy) {
        phi += dragRef.current.dx / 150;
        theta = Math.max(-1.05, Math.min(1.05, theta + dragRef.current.dy / 210));
        dragRef.current.dx = 0;
        dragRef.current.dy = 0;
      } else if (!dragRef.current.active) {
        phi += dockedRef.current ? 0.0008 : 0.0012;
      }
      globe.update({ phi, theta });
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      globeRef.current = null;
      globe.destroy();
      if (wrapper && host && wrapper !== host && wrapper.contains(canvas)) {
        host.insertBefore(canvas, wrapper);
        wrapper.remove();
      }
    };
  }, [themeName]);

  useEffect(() => {
    dockedRef.current = docked;
    const globe = globeRef.current;
    if (!globe) return;
    const theme = globeThemes[themeName];
    const fullMarkers = landmarks.map(({ id, location }) => ({ id, location: [...location] as [number, number], size: 0.024 }));

    if (!docked) {
      globe.update({
        width: 760,
        height: 760,
        dark: theme.dark,
        diffuse: 1.4,
        mapSamples: 18000,
        mapBrightness: themeName === "nightflight" ? 5 : 2.8,
        baseColor: [...theme.base],
        markerColor: [...theme.marker],
        glowColor: [...theme.glow],
        markers: fullMarkers,
        markerElevation: 0,
        opacity: 0.96,
      });
      return;
    }

    // Let the full globe complete its flight before simplifying it into a crisp brand mark.
    globe.update({ markers: [] });
    const settle = window.setTimeout(() => {
      const darkBase: [number, number, number] = [0.12, 0.18, 0.42];
      const darkGlow: [number, number, number] = [1, 0.55, 0.22];
      globe.update({
        width: 96,
        height: 96,
        dark: theme.dark,
        diffuse: 3,
        mapSamples: 420,
        mapBrightness: theme.dark ? 3.6 : 1.8,
        baseColor: theme.dark ? darkBase : [...theme.base],
        markerColor: [...theme.marker],
        glowColor: theme.dark ? darkGlow : [...theme.glow],
        markers: [],
        markerElevation: 0,
        opacity: 1,
      });
    }, 780);

    return () => window.clearTimeout(settle);
  }, [themeName, docked]);

  function beginDrag(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (docked) return;
    dragRef.current = { active: true, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function drag(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current.active || docked) return;
    dragRef.current.dx += e.clientX - dragRef.current.x;
    dragRef.current.dy += e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
  }

  function endDrag(e: ReactPointerEvent<HTMLCanvasElement>) {
    dragRef.current.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  function toggleCard(id: string) {
    setCollapsedCards((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return <>
    {!webgl && <svg className="globe-fallback" viewBox="0 0 400 400" aria-hidden="true">
      <defs><pattern id="vm-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.45" fill="currentColor" /></pattern><radialGradient id="vm-shade"><stop offset="0" stopColor="currentColor" stopOpacity=".03"/><stop offset="1" stopColor="currentColor" stopOpacity=".13"/></radialGradient></defs>
      <circle cx="200" cy="200" r="178" fill="url(#vm-shade)" stroke="currentColor" strokeOpacity=".2" />
      <g fill="url(#vm-dots)" opacity=".82">
        <path d="M49 122l20-42 51-32 48 7 24 25-8 26-30 11-17 33-34 9-18-17z" />
        <path d="M134 175l34 12 18 39-10 56-27 65-20-25 5-54-18-50z" />
        <path d="M215 73l35-18 87 27 29 39-28 22-28-9-28 25-32-10-12-31-31-13z" />
        <path d="M223 163l59-9 30 34-17 33-25 7-10 59-34-13-17-62z" />
        <path d="M307 275l40 8 15 28-27 21-42-20z" />
        <path d="M176 67l20-11 17 12-12 14z" />
      </g>
    </svg>}
    <canvas
      ref={canvasRef}
      className={`globe-canvas ${webgl ? "has-webgl" : ""}`}
      aria-label="Draggable world globe with major cities and landmarks"
      onPointerDown={beginDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
    {landmarks.map((landmark) => {
      const collapsed = collapsedCards.has(landmark.id);
      const city = landmark.city[locale];
      const place = landmark.place[locale];
      return <figure
        className={`city-card city-${landmark.id}${collapsed ? " is-collapsed" : ""}`}
        key={landmark.id}
        role="button"
        tabIndex={0}
        aria-pressed={collapsed}
        aria-label={`${collapsed ? t.hidePhoto : t.showPhoto} ${place}, ${city}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => toggleCard(landmark.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCard(landmark.id);
          }
        }}
      >
        {/* The current prototype intentionally uses hotlinked thumbnail URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={landmark.photo} alt={`${place} in ${city}`} />
        <figcaption><strong>{city}</strong><span>{place}</span></figcaption>
      </figure>;
    })}
  </>;
}

function Icon({ name }: { name: "spark" | "arrow" | "file" | "folder" | "check" | "lock" | "source" | "sun" | "moon" | "lang" }) {
  const paths = {
    spark: <><path d="M12 2l1.45 5.1L18 9l-4.55 1.9L12 16l-1.45-5.1L6 9l4.55-1.9L12 2Z"/><path d="m5 15 .8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z"/></>,
    arrow: <><path d="M5 12h13"/><path d="m14 7 5 5-5 5"/></>,
    file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></>,
    folder: <path d="M3 6h7l2 2h9v11H3z"/>, check: <path d="m5 12 4 4L19 6"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    source: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>,
    sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
    moon: <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/>,
    lang: <><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  const siteRef = useRef<HTMLElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const brandMarkRef = useRef<HTMLSpanElement>(null);
  const readyTimerRef = useRef<number | null>(null);
  const returnFrameRef = useRef<number | null>(null);
  const returnFrameTwoRef = useRef<number | null>(null);
  const returnRevealTimerRef = useRef<number | null>(null);
  const [darkTheme, setDarkTheme] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [globeDocked, setGlobeDocked] = useState(false);
  const [globeReturning, setGlobeReturning] = useState(false);
  const [query, setQuery] = useState("");
  const [gate, setGate] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const t = dict[locale];
  const globeTheme = darkTheme ? "nightflight" : "passage";

  useEffect(() => {
    document.documentElement.lang = locale === "cn" ? "zh-CN" : locale;
    localStorage.setItem("locale", locale);
  }, [locale]);

  // Detect the saved/browser locale only after hydration so the server-rendered
  // HTML always matches the client's first render (no hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    const lang = navigator.language.toLowerCase();
    const frame = requestAnimationFrame(() => {
      setLocale(saved === "en" || saved === "cn" || saved === "es" ? saved : lang.startsWith("zh") ? "cn" : lang.startsWith("es") ? "es" : "en");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    const composer = journeyRef.current;
    const site = siteRef.current;
    if (!composer || !site) return;
    const syncComposerEdge = () => {
      const composerTop = composer.getBoundingClientRect().top;
      site.style.setProperty("--composer-top", `${Math.round(composerTop)}px`);

      // The docked globe targets the actual brand slot instead of a second set
      // of guessed mobile coordinates. getBoundingClientRect is already in the
      // viewport coordinate system used by position:fixed.
      const brandMark = brandMarkRef.current;
      if (brandMark) {
        const mark = brandMark.getBoundingClientRect();
        site.style.setProperty("--brand-mark-left", `${mark.left.toFixed(2)}px`);
        site.style.setProperty("--brand-mark-top", `${mark.top.toFixed(2)}px`);
        site.style.setProperty("--brand-mark-width", `${mark.width.toFixed(2)}px`);
        site.style.setProperty("--brand-mark-height", `${mark.height.toFixed(2)}px`);
      }

      // Center the full globe canvas inside the real right-hand stage: below
      // the navigation and above the composer. This keeps it visually balanced
      // across browser heights while still allowing the composer to graze its edge.
      if (stage === "idle") {
        const viewportWidth = window.innerWidth;
        const globeSize = viewportWidth <= 700
          ? Math.min(viewportWidth * 1.12, 450, Math.max(0, composerTop - 230))
          : viewportWidth <= 980
            ? Math.min(viewportWidth * 0.68, 850, composerTop + 32)
            : Math.min(viewportWidth * 0.67, 1080, composerTop + 40);
        const stageTop = viewportWidth <= 980 ? 96 : 88;
        const globeTop = viewportWidth <= 700 ? 320 : Math.max(18, (stageTop + composerTop - globeSize) / 2);
        site.style.setProperty("--globe-size", `${Math.round(globeSize)}px`);
        site.style.setProperty("--globe-top", `${Math.round(globeTop)}px`);
      }
    };
    const observer = new ResizeObserver(syncComposerEdge);
    observer.observe(composer);
    window.addEventListener("resize", syncComposerEdge);
    window.addEventListener("scroll", syncComposerEdge, { passive: true });
    window.visualViewport?.addEventListener("resize", syncComposerEdge);
    window.visualViewport?.addEventListener("scroll", syncComposerEdge);
    syncComposerEdge();
    const frame = requestAnimationFrame(syncComposerEdge);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncComposerEdge);
      window.removeEventListener("scroll", syncComposerEdge);
      window.visualViewport?.removeEventListener("resize", syncComposerEdge);
      window.visualViewport?.removeEventListener("scroll", syncComposerEdge);
      cancelAnimationFrame(frame);
    };
  }, [stage]);

  useEffect(() => () => {
    if (readyTimerRef.current !== null) window.clearTimeout(readyTimerRef.current);
    if (returnFrameRef.current !== null) window.cancelAnimationFrame(returnFrameRef.current);
    if (returnFrameTwoRef.current !== null) window.cancelAnimationFrame(returnFrameTwoRef.current);
    if (returnRevealTimerRef.current !== null) window.clearTimeout(returnRevealTimerRef.current);
  }, []);

  function returnToRouteEditor() {
    if (readyTimerRef.current !== null) window.clearTimeout(readyTimerRef.current);
    if (returnFrameRef.current !== null) window.cancelAnimationFrame(returnFrameRef.current);
    if (returnFrameTwoRef.current !== null) window.cancelAnimationFrame(returnFrameTwoRef.current);
    if (returnRevealTimerRef.current !== null) window.clearTimeout(returnRevealTimerRef.current);

    // First restore the idle composer while keeping COBE exactly inside the
    // measured brand slot. Two frames later, its final hero geometry is known,
    // so removing the docked state creates a true logo-to-globe flight.
    setGlobeReturning(true);
    setGlobeDocked(true);
    setStage("idle");
    returnFrameRef.current = window.requestAnimationFrame(() => {
      returnFrameTwoRef.current = window.requestAnimationFrame(() => {
        setGlobeDocked(false);
        returnRevealTimerRef.current = window.setTimeout(() => setGlobeReturning(false), 820);
      });
    });
  }

  function returnToLanding() {
    setGate(false);
    setQuery("");
    if (stage === "idle") {
      setGlobeDocked(false);
      setGlobeReturning(false);
    } else {
      returnToRouteEditor();
    }
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || stage === "checking") return;
    setGlobeReturning(false);
    setGlobeDocked(true);
    setStage("checking");
    readyTimerRef.current = window.setTimeout(() => setStage("ready"), 1350);
  }
  return (
    <main ref={siteRef} className={`site${darkTheme ? " theme-dark" : ""} stage-${stage}${globeReturning ? " globe-returning" : ""}`} data-theme={darkTheme ? "dark" : "light"} style={{ "--composer-top": "calc(100dvh - 148px)" } as CSSProperties}>
      <header className="topbar">
        <button className="brand" type="button" aria-label={t.home} onClick={returnToLanding}><span className="brand-mark-slot" ref={brandMarkRef}><span className="brand-orbit" /></span><span>visa<span>master</span></span></button>
        <div className="top-actions"><span className="theme-toggle locale-toggle"><Icon name="lang" /><select aria-label={t.localeName} title={t.localeName} value={locale} onChange={(e) => setLocale(e.target.value as Locale)}><option value="en">English</option><option value="cn">中文</option><option value="es">Español</option></select></span><button className="theme-toggle" type="button" aria-label={darkTheme ? t.useLight : t.useDark} title={darkTheme ? t.useLight : t.useDark} onClick={() => setDarkTheme((current) => !current)}><Icon name={darkTheme ? "sun" : "moon"} /></button><AccountButton getStarted={t.getStarted} finishSetup={t.finishSetup} onGetStarted={() => setGate(true)} /></div>
      </header>

      <section className="hero">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <div className={`globe-home ${globeDocked ? "docked" : ""}`}>
          <Globe themeName={globeTheme} docked={globeDocked} locale={locale} />
        </div>
        <div className="hero-copy"><h1><span className="hero-lead-line">{t.lead}</span><br /><em>{t.easy}</em></h1><p className="subhead">{t.subhead}</p></div>

        <div className="journey-card" ref={journeyRef}>
          {stage === "idle" && <>
            <form className="prompt" onSubmit={submit}>
              <div className="prompt-field"><input aria-label={t.dest} placeholder={t.placeholder} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" /></div>
              <button type="submit" aria-label={t.buildPlan}><Icon name="arrow" /></button>
            </form>
            <div className="suggestions"><span>{t.try}</span>{t.suggestions.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
          </>}

          {stage === "checking" && <div className="checking-state"><div className="scan-orb"><span /></div><div><p>{t.mapping}</p><strong>{t.checking}</strong></div><div className="checking-bars"><i/><i/><i/></div></div>}

          {stage === "ready" && <div className="workspace-preview">
            <div className="thread">
              <div className="thread-head"><span className="status-dot" /><div><small>{t.yourRoute}</small><strong>{query}</strong></div><button onClick={returnToRouteEditor}>{t.edit}</button></div>
              <div className="assistant-message"><span className="mini-mark"><Icon name="spark" /></span><p>{t.assistant}</p></div>
              <div className="proof-row"><span><Icon name="source" /><b>7</b> {t.sources}</span><span><Icon name="check" />{t.mapped}</span><span><Icon name="check" />{t.updated}</span></div>
            </div>
            <div className="pack-panel">
              <div className="pack-title"><span><Icon name="folder" /></span><div><small>{t.workspace}</small><strong>{t.pack}</strong></div><span className="complete">{t.files}</span></div>
              <div className="file-list">
                {t.rows.map(([n,title,meta]) =>
                  <button className="file-row" key={n} onClick={() => setGate(true)}><span className="file-no">{n}</span><Icon name="file" /><span><strong>{title}</strong><small>{meta}</small></span><Icon name="lock" /></button>
                )}
              </div>
              <div className="pack-actions"><button className="secondary-cta" onClick={() => setGate(true)}>{t.download}</button><button className="primary-cta" onClick={() => setGate(true)}>{t.open} <Icon name="arrow" /></button></div>
            </div>
          </div>}
        </div>
      </section>

      <div className="product-foot">A <img src="luya-circle.svg" alt="Lüya" width="24" height="24" /> <span className="product-foot-brand">Lüya</span> product</div>

      <AuthDialog open={gate} onOpenChange={setGate} locale={locale} />
    </main>
  );
}
