"use client";

import createGlobe from "cobe";
import { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

type Stage = "idle" | "checking" | "ready";

const concepts = [
  { id: "passage", no: "01", name: "Calm Passage", headline: <>Cross borders,<br /><em>not paperwork.</em></>, sub: "Visa Master researches the official rules, builds your application pack, and guides every step—without the agency price tag.", prompt: "I’m traveling from Taipei to Paris for 12 days", note: "Recommended · warm editorial utility" },
  { id: "passport", no: "02", name: "Passport OS", headline: <>Your trip has<br /><em>a system now.</em></>, sub: "One verified operating system for requirements, forms, evidence and submission—built around your exact route.", prompt: "Taiwan passport · 3 weeks in the UK", note: "Technical · precise · high-trust" },
  { id: "openworld", no: "03", name: "Open World", headline: <>Tell us where.<br /><em>We’ll clear the way.</em></>, sub: "From official requirements to ready-to-use files, Visa Master makes the path to your next country feel obvious.", prompt: "I want to see the cherry blossoms in Japan", note: "Bold · human · memorable" },
  { id: "orbit", no: "04", name: "Document Orbit", headline: <>One trip in.<br /><em>A complete pack out.</em></>, sub: "Visa Master turns your itinerary into a living application folder: sourced, structured, and ready to submit.", prompt: "Business trip from Manila to Berlin in October", note: "Minimal · artifact-first · product-led" },
  { id: "nightflight", no: "05", name: "Night Flight", headline: <>Go further.<br /><em>With certainty.</em></>, sub: "An AI visa co-pilot that checks the rules, maps the process and assembles the evidence for your journey.", prompt: "Digital nomad visa options for Spain", note: "Cinematic · premium · aspirational" },
];

const globeThemes = {
  passage: { dark: 0, base: [0.91, 0.89, 0.82], marker: [0.16, 0.28, 0.95], glow: [0.78, 0.84, 1] },
  passport: { dark: 1, base: [0.06, 0.12, 0.12], marker: [0.5, 1, 0.64], glow: [0.03, 0.2, 0.14] },
  openworld: { dark: 0, base: [0.98, 0.43, 0.19], marker: [0.27, 0.08, 0.7], glow: [1, 0.78, 0.2] },
  orbit: { dark: 0, base: [0.86, 0.89, 0.92], marker: [1, 0.3, 0.13], glow: [0.9, 0.92, 0.96] },
  nightflight: { dark: 1, base: [0.05, 0.08, 0.24], marker: [0.98, 0.55, 0.22], glow: [0.08, 0.15, 0.5] },
} as const;

const landmarks = [
  { id: "paris", city: "Paris", place: "Eiffel Tower", location: [48.86, 2.35] as [number, number], photo: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "tokyo", city: "Tokyo", place: "Tokyo Tower", location: [35.68, 139.69] as [number, number], photo: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "giza", city: "Giza", place: "Great Pyramids", location: [29.98, 31.13] as [number, number], photo: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "newyork", city: "New York", place: "Statue of Liberty", location: [40.69, -74.04] as [number, number], photo: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "rio", city: "Rio", place: "Christ the Redeemer", location: [-22.95, -43.21] as [number, number], photo: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "sydney", city: "Sydney", place: "Opera House", location: [-33.87, 151.21] as [number, number], photo: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "singapore", city: "Singapore", place: "Jewel Changi", location: [1.35, 103.82] as [number, number], photo: "https://images.unsplash.com/photo-1752859677447-2739187de181?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "beijing", city: "Beijing", place: "Forbidden City", location: [39.9, 116.4] as [number, number], photo: "https://images.unsplash.com/photo-1555085634-3444448f450c?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "chengdu", city: "Chengdu", place: "Giant Panda Base", location: [30.67, 104.07] as [number, number], photo: "https://touristtraveltips.com/images/east-asia/china_chengdu_panda_1769657028016.webp" },
  { id: "sanfrancisco", city: "San Francisco", place: "Golden Gate", location: [37.77, -122.42] as [number, number], photo: "https://images.unsplash.com/photo-1510883327084-b48fb14fc7cf?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "madrid", city: "Madrid", place: "Royal Palace", location: [40.42, -3.7] as [number, number], photo: "https://images.unsplash.com/photo-1569676814972-31aa39db5817?auto=format&fit=crop&w=280&h=180&q=76" },
  { id: "buenosaires", city: "Buenos Aires", place: "The Obelisk", location: [-34.6, -58.38] as [number, number], photo: "https://images.unsplash.com/photo-1745409927264-0db48faf407b?auto=format&fit=crop&w=280&h=280&q=76" },
  { id: "capetown", city: "Cape Town", place: "Table Mountain", location: [-33.92, 18.42] as [number, number], photo: "https://images.unsplash.com/photo-1744604030401-b24c5975a574?auto=format&fit=crop&w=280&h=280&q=76" },
] as const;

function Globe({ concept, docked }: { concept: keyof typeof globeThemes; docked: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const dockedRef = useRef(docked);
  const dragRef = useRef({ active: false, x: 0, y: 0, dx: 0, dy: 0 });
  const [webgl, setWebgl] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const host = canvas.parentElement;
    let phi = concept === "openworld" ? 1.8 : 0.4;
    let theta = 0.18;
    let frame = 0;
    const theme = globeThemes[concept];
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2, width: 760, height: 760, phi, theta,
      dark: theme.dark, diffuse: concept === "passport" ? 0.5 : 1.4,
      mapSamples: 18000,
      mapBrightness: concept === "nightflight" ? 5 : 2.8,
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
  }, [concept]);

  useEffect(() => {
    dockedRef.current = docked;
    const globe = globeRef.current;
    if (!globe) return;
    const theme = globeThemes[concept];
    const fullMarkers = landmarks.map(({ id, location }) => ({ id, location: [...location] as [number, number], size: 0.024 }));

    if (!docked) {
      globe.update({
        width: 760,
        height: 760,
        dark: theme.dark,
        diffuse: concept === "passport" ? 0.5 : 1.4,
        mapSamples: 18000,
        mapBrightness: concept === "nightflight" ? 5 : 2.8,
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
      const darkBase: [number, number, number] = concept === "passport"
        ? [0.12, 0.36, 0.22]
        : [0.12, 0.18, 0.42];
      const darkGlow: [number, number, number] = concept === "passport"
        ? [0.5, 1, 0.64]
        : [1, 0.55, 0.22];
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
  }, [concept, docked]);

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
      return <figure
        className={`city-card city-${landmark.id}${collapsed ? " is-collapsed" : ""}`}
        key={landmark.id}
        role="button"
        tabIndex={0}
        aria-pressed={collapsed}
        aria-label={`${collapsed ? "Show" : "Hide"} photo for ${landmark.city}, ${landmark.place}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => toggleCard(landmark.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCard(landmark.id);
          }
        }}
      >
        {/* The concept prototype intentionally uses hotlinked thumbnail URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={landmark.photo} alt={`${landmark.place} in ${landmark.city}`} />
        <figcaption><strong>{landmark.city}</strong><span>{landmark.place}</span></figcaption>
      </figure>;
    })}
  </>;
}

function Icon({ name }: { name: "spark" | "arrow" | "file" | "folder" | "check" | "lock" | "source" }) {
  const paths = {
    spark: <><path d="M12 2l1.45 5.1L18 9l-4.55 1.9L12 16l-1.45-5.1L6 9l4.55-1.9L12 2Z"/><path d="m5 15 .8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z"/></>,
    arrow: <><path d="M5 12h13"/><path d="m14 7 5 5-5 5"/></>,
    file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></>,
    folder: <path d="M3 6h7l2 2h9v11H3z"/>, check: <path d="m5 12 4 4L19 6"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    source: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>,
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
  const [active, setActive] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [globeDocked, setGlobeDocked] = useState(false);
  const [globeReturning, setGlobeReturning] = useState(false);
  const [query, setQuery] = useState(concepts[0].prompt);
  const [gate, setGate] = useState(false);
  const concept = concepts[active];

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
        const globeTop = viewportWidth <= 700 ? 210 : Math.max(18, (stageTop + composerTop - globeSize) / 2);
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

  function chooseConcept(index: number) {
    setActive(index); setQuery(concepts[index].prompt); setGate(false);
    if (stage === "idle") {
      setGlobeDocked(false);
      setGlobeReturning(false);
    } else {
      returnToRouteEditor();
    }
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
  const isDocked = globeDocked;

  return (
    <main ref={siteRef} className={`site concept-${concept.id} stage-${stage}${globeReturning ? " globe-returning" : ""}`} data-concept={concept.id} style={{ "--composer-top": "calc(100dvh - 148px)" } as CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Visa Master home"><span className="brand-mark-slot" ref={brandMarkRef}><span className="brand-orbit" /></span><span>visa<span>master</span></span></a>
        <div className="top-actions"><span className="concept-counter">CONCEPT {concept.no} / 05</span><button className="quiet-button" onClick={() => setGate(true)}>Get started</button></div>
      </header>
      <nav className="concept-switcher" aria-label="Landing page concepts">
        {concepts.map((item, index) => <button key={item.id} className={index === active ? "active" : ""} onClick={() => chooseConcept(index)}><span>{item.no}</span>{item.name}</button>)}
      </nav>

      <section id="top" className="hero">
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <div className={`globe-home ${isDocked ? "docked" : ""}`}>
          <Globe concept={concept.id as keyof typeof globeThemes} docked={isDocked} />
        </div>
        <div className="hero-copy"><h1>{concept.headline}</h1><p className="subhead">{concept.sub}</p></div>

        <div className="journey-card" ref={journeyRef}>
          {stage === "idle" && <>
            <form className="prompt" onSubmit={submit}>
              <div className="prompt-field"><label htmlFor="route-input">Where are you going?</label><input id="route-input" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" /></div>
              <button type="submit" aria-label="Build my visa plan"><Icon name="arrow" /></button>
            </form>
            <div className="suggestions"><span>Try</span>{["Taipei → Paris", "UK visitor visa", "Spain nomad visa"].map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
          </>}

          {stage === "checking" && <div className="checking-state"><div className="scan-orb"><span /></div><div><p>Mapping your route</p><strong>Checking jurisdiction, entry rules and official sources…</strong></div><div className="checking-bars"><i/><i/><i/></div></div>}

          {stage === "ready" && <div className="workspace-preview">
            <div className="thread">
              <div className="thread-head"><span className="status-dot" /><div><small>YOUR ROUTE</small><strong>{query}</strong></div><button onClick={returnToRouteEditor}>Edit</button></div>
              <div className="assistant-message"><span className="mini-mark"><Icon name="spark" /></span><p>I checked your route against official sources. Here’s the application workspace I prepared.</p></div>
              <div className="proof-row"><span><Icon name="source" /><b>7</b> official sources</span><span><Icon name="check" />Requirements mapped</span><span><Icon name="check" />Updated today</span></div>
            </div>
            <div className="pack-panel">
              <div className="pack-title"><span><Icon name="folder" /></span><div><small>GENERATED WORKSPACE</small><strong>France · Short-stay visa</strong></div><span className="complete">8 files</span></div>
              <div className="file-list">
                {[["01","Application roadmap","Interactive checklist"],["02","Requirements matrix","Evidence matched"],["03","Cover letter","Ready to personalize"],["04","Travel itinerary","12 days · generated"]].map(([n,title,meta]) =>
                  <button className="file-row" key={n} onClick={() => setGate(true)}><span className="file-no">{n}</span><Icon name="file" /><span><strong>{title}</strong><small>{meta}</small></span><Icon name="lock" /></button>
                )}
              </div>
              <div className="pack-actions"><button className="secondary-cta" onClick={() => setGate(true)}>Download pack</button><button className="primary-cta" onClick={() => setGate(true)}>Open my workspace <Icon name="arrow" /></button></div>
            </div>
          </div>}
        </div>
      </section>

      {gate && <div className="modal-backdrop" onMouseDown={() => setGate(false)}><div className="signup-modal" role="dialog" aria-modal="true" aria-labelledby="signup-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setGate(false)} aria-label="Close">×</button><span className="modal-mark"><Icon name="spark" /></span><small>YOUR VISA PACK IS READY</small><h2 id="signup-title">Save your progress.<br />Finish with confidence.</h2><p>Create a free workspace to download the files, track requirements, and keep official sources up to date.</p><button className="google-button"><b>G</b> Continue with Google</button><button className="email-button">Continue with email <Icon name="arrow" /></button><span className="fineprint">No credit card · Your documents stay private</span></div></div>}
    </main>
  );
}
