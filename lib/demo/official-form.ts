// Adapted from visa-master/workspace/src/server/services/form-session.mjs.
// The map owns fields and geometry; this module owns the local demo draft.
import map from "./data/form-map.json" with { type: "json" };
import chinese from "./data/form-map.zh-CN.json" with { type: "json" };
export type FormValue = string | string[] | boolean;
export type FormValues = Record<string, FormValue>;
export type Condition = {
  all?: Condition[];
  any?: Condition[];
  not?: Condition;
  eq?: { field: string; value: unknown };
  ne?: { field: string; value: unknown };
  in?: { field: string; values: unknown[] };
  contains?: { field: string; value: string };
  present?: { field: string };
};
export type FormQuestion = {
  id: string;
  profileKey: string;
  label: string;
  prompt?: string;
  type: string;
  required?: boolean;
  format?: string;
  transforms?: string[];
  validation?: {
    maxLength?: number;
    pattern?: string;
    minSelections?: number;
    maxSelections?: number;
  };
  condition?: Condition;
  guidance?: string;
  choices?: { value: string; label: string }[];
};
export const formMap = map;
export const sourceUrl = "/forms/spain-schengen.pdf";
export const branchQuestions: FormQuestion[] = [
  ["applicant.is_minor", "Is the applicant under 18?", "申请人是否未满18岁？"],
  [
    "applicant.eu_family_qualified",
    "Does the EU/EEA/Swiss family-member exemption apply?",
    "是否适用欧盟、欧洲经济区或瑞士公民家属豁免？",
  ],
  [
    "applicant.nationality.birth_differs",
    "Was your nationality at birth different?",
    "出生时国籍是否不同？",
  ],
  [
    "applicant.has_additional_nationality",
    "Do you hold another nationality?",
    "是否持有其他国籍？",
  ],
  [
    "form_filler.differs_from_applicant",
    "Is someone else filling this form for you?",
    "是否由他人代填此表？",
  ],
  [
    "journey.host_details_required",
    "Will you stay at a hotel or with a host?",
    "是否入住酒店或由个人接待？",
  ],
  [
    "journey.company_details_required",
    "Are you invited by a company or organisation?",
    "是否由公司或组织邀请？",
  ],
  [
    "journey.final_destination_permit_required",
    "Do you need an entry permit for a final destination outside Schengen?",
    "是否需要申根区之外最终目的地的入境许可？",
  ],
].map(([id, label, prompt]) => ({
  id,
  profileKey: id,
  label,
  prompt,
  type: "boolean",
  required: true,
}));
export function matches(
  condition: Condition | undefined,
  values: FormValues,
): boolean {
  if (!condition) return true;
  if (condition.all) return condition.all.every((c) => matches(c, values));
  if (condition.any) return condition.any.some((c) => matches(c, values));
  if (condition.not) return !matches(condition.not, values);
  if (condition.eq) return values[condition.eq.field] === condition.eq.value;
  if (condition.ne) return values[condition.ne.field] !== condition.ne.value;
  if (condition.in)
    return condition.in.values.includes(values[condition.in.field]);
  if (condition.contains) {
    const v = values[condition.contains.field];
    return Array.isArray(v) && v.includes(condition.contains.value);
  }
  if (condition.present) return !empty(values[condition.present.field]);
  return false;
}
export function empty(value: FormValue | undefined) {
  return (
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  );
}
export function displayValue(
  q: FormQuestion,
  value: FormValue | undefined,
): string {
  if (typeof value !== "string") return "";
  let text = value;
  for (const t of q.transforms ?? []) {
    if (t === "trim") text = text.trim();
    if (t === "uppercase") text = text.toUpperCase();
  }
  if (q.format === "dd-mm-yyyy" && /^\d{4}-\d{2}-\d{2}$/.test(text))
    text = text.split("-").reverse().join("-");
  return text;
}
export function fieldError(
  q: FormQuestion,
  value: FormValue | undefined,
): string | null {
  if (empty(value)) return null;
  if (q.type === "boolean")
    return typeof value === "boolean" ? null : "Choose yes or no.";
  if (q.type === "multiple-choice") {
    if (
      !Array.isArray(value) ||
      value.some((v) => !q.choices?.some((c) => c.value === v))
    )
      return "Choose valid options.";
    if (
      value.length < (q.validation?.minSelections ?? 0) ||
      value.length > (q.validation?.maxSelections ?? Infinity)
    )
      return "Check the number of selected options.";
    return null;
  }
  if (typeof value !== "string") return "Enter text.";
  if (q.type === "single-choice")
    return q.choices?.some((c) => c.value === value)
      ? null
      : "Choose a valid option.";
  if (
    q.type === "date" &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value)
  )
    return "Enter a valid date.";
  const text = displayValue(q, value);
  if (/[^\x20-\x7e\xa0-\xff\n]/.test(text))
    return "Use Latin letters (pinyin for Chinese names) in the PDF.";
  if (q.type !== "multiline" && text.includes("\n")) return "Use one line.";
  if (text.length > (q.validation?.maxLength ?? 2000))
    return "This answer is too long.";
  if (q.validation?.pattern && !new RegExp(q.validation.pattern).test(text))
    return "Check the format of this answer.";
  if (q.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
    return "Enter a valid email address.";
  return null;
}
// Tourism always needs the mapped accommodation/host details; the old yes/no
// answer must not suppress them. The map still owns any family exemption.
export function formContext(values: FormValues): FormValues {
  return Array.isArray(values["journey.purposes"]) && values["journey.purposes"].includes("tourism")
    ? { ...values, "journey.host_details_required": true }
    : values;
}
export function formQuestions(
  locale: string,
  values: FormValues,
): FormQuestion[] {
  values = formContext(values);
  const positions = new Map<string, number>();
  map.placements.forEach((p) => {
    const n = p.page * 1e7 + p.rect.y * 1000 + p.rect.x;
    positions.set(
      p.questionId,
      Math.min(positions.get(p.questionId) ?? Infinity, n),
    );
  });
  const localized = new Map(chinese.questions.map((q) => [q.id, q]));
  const fields = (map.questions as FormQuestion[])
    .filter(
      (q) =>
        !["photo", "signature"].includes(q.type) &&
        matches(q.condition, values),
    )
    .sort((a, b) => (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0))
    .map((q) => {
      const zh = localized.get(q.id) as
        { label: string; choices?: Record<string, string> } | undefined;
      return locale === "cn" && zh
        ? {
            ...q,
            label: zh.label,
            choices: q.choices?.map((c) => ({
              ...c,
              label: zh.choices?.[c.value] ?? c.label,
            })),
          }
        : q;
    });
  return [
    ...branchQuestions.filter(q => q.id !== "journey.host_details_required" || (Array.isArray(values["journey.purposes"]) && !values["journey.purposes"].includes("tourism"))).map((q) => ({
      ...q,
      label: locale === "cn" ? q.prompt! : q.label,
    })),
    ...fields,
  ];
}
export function restoreFormValues(raw: unknown): FormValues {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: FormValues = {};
  for (const q of [...branchQuestions, ...(map.questions as FormQuestion[])]) {
    const v = (raw as FormValues)[q.profileKey];
    if (typeof v === "boolean" && q.type === "boolean")
      result[q.profileKey] = v;
    else if (
      typeof v === "string" &&
      v.length <= 2000 &&
      !["photo", "signature"].includes(q.type)
    )
      result[q.profileKey] = v;
    else if (
      Array.isArray(v) &&
      v.length <= 20 &&
      v.every((x) => typeof x === "string" && x.length < 100)
    )
      result[q.profileKey] = v;
  }
  return result;
}
