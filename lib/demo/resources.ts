import routeData from "./data/route.json";
import artifactData from "./data/artifacts.json";
import documentData from "./data/documents.en.json";
import sources from "./data/sources.json";
import evidence from "./data/evidence.json";
import provenance from "./data/provenance.json";
import formMap from "./data/form-map.json";
import verification from "./data/form-map-verification.json";
import { type Locale } from "./intake";
export { provenance, sources, formMap, verification };
export type Action = {
  id: string;
  number: number;
  title: string;
  evidenceGoal: string;
  instruction: string;
  completionEvidence: string;
  resourceIds?: string[];
  requirementIds?: string[];
  claimIds?: string[];
  complianceConditions?: { id: string; title: string; instruction: string }[];
  applicantHandoff?: { title: string; description: string; sourceId?: string };
};
export const actions: Action[] = routeData.casePlan.actions;
export type Block = {
  type: string;
  text?: string;
  level?: number;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  fields?: string[];
  tone?: string;
};
export type Resource = {
  id: string;
  title: string;
  kind: "guide" | "template" | "official" | "map";
  subtitle?: string;
  blocks?: Block[];
  url?: string;
};
export const resources: Resource[] = [
  ...documentData.documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    kind: (doc.deliverAs === "docx" ? "template" : "guide") as Resource["kind"],
    subtitle: doc.subtitle,
    blocks: doc.blocks as Block[],
  })),
  ...sources.downloads.map((doc) => ({
    id: doc.id,
    title: doc.purpose.replace(/^Current /, ""),
    kind: "official" as const,
    url: sources.initial.find(
      (source) => source.id === doc.selectors[0].parent,
    )!.url,
  })),
  {
    id: "application-form-map",
    title: "Schengen application form · field map",
    kind: "map",
    subtitle: formMap.source.edition,
  },
];
export function actionText(action: Action, locale: Locale) {
  const translations = routeData.casePlan.actionText["zh-CN"] as Record<
    string,
    { title: string; instruction: string; evidenceGoal: string }
  >;
  return locale === "cn" ? { ...action, ...translations[action.id] } : action;
}
export function actionResources(action: Action): Resource[] {
  const ids = new Set(action.resourceIds ?? []);
  for (const id of action.requirementIds ?? []) {
    const requirement = artifactData.requirements.find((r) => r.id === id);
    if (requirement && "artifact" in requirement && requirement.artifact)
      ids.add(requirement.artifact);
  }
  if (action.id === "official-application-form")
    ids.add("application-form-map");
  if (ids.size === 0) ids.add("chengdu-tourism-checklist");
  return resources.filter((r) => ids.has(r.id));
}
export function actionSources(action: Action) {
  const claims = new Set(action.claimIds ?? []);
  for (const id of action.requirementIds ?? [])
    for (const claim of artifactData.requirements.find((r) => r.id === id)
      ?.claims ?? [])
      claims.add(claim);
  const ids = new Set(
    evidence.claims
      .filter((c) => claims.has(c.id))
      .flatMap((c) => c.checks.map((check) => check.source)),
  );
  const matched = sources.initial.filter((source) => ids.has(source.id));
  return matched.length
    ? matched
    : sources.initial.filter((s) => s.id === "bls-tourism-en");
}
