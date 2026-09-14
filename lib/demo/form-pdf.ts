import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import {
  displayValue,
  fieldError,
  formMap,
  formContext,
  matches,
  sourceUrl,
  type FormQuestion,
  type FormValues,
} from "./official-form.ts";

let source: Promise<ArrayBuffer> | undefined;
async function sourceBytes() {
  source ??= fetch(sourceUrl)
    .then(async (r) => {
      if (!r.ok)
        throw new Error("Could not load the official PDF. Please retry.");
      const bytes = await r.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      if (hash !== formMap.source.sha256)
        throw new Error("The PDF does not match the approved field map.");
      return bytes;
    })
    .catch((e) => {
      source = undefined;
      throw e;
    });
  return source;
}
function fit(
  text: string,
  font: PDFFont,
  width: number,
  height: number,
  multiline: boolean,
) {
  for (
    let size = Math.min(9, Math.max(5, height * (multiline ? 0.48 : 0.7)));
    size >= 3.5;
    size -= 0.5
  ) {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      if (!multiline) {
        lines.push(paragraph);
        continue;
      }
      let line = "";
      for (const char of paragraph) {
        if (font.widthOfTextAtSize(line + char, size) > width && line) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
      lines.push(line);
    }
    if (
      lines.length * size * 1.12 <= height &&
      lines.every((l) => font.widthOfTextAtSize(l, size) <= width)
    )
      return { lines, size };
  }
  throw new Error(
    "Answer does not fit the official field. Shorten it before exporting.",
  );
}
export async function renderFormPdf(
  values: FormValues,
  bytes?: ArrayBuffer | Uint8Array,
) {
  values = formContext(values);
  const pdf = await PDFDocument.load(bytes ?? (await sourceBytes()));
  if (pdf.getPageCount() !== formMap.source.pageCount)
    throw new Error("Unexpected PDF page count.");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const questions = new Map(
    (formMap.questions as FormQuestion[]).map((q) => [q.id, q]),
  );
  const errors: Record<string, string> = {};
  for (const p of formMap.placements) {
    const q = questions.get(p.questionId);
    if (
      !q ||
      !matches(q.condition, values) ||
      ["photo", "signature"].includes(p.control)
    )
      continue;
    const value = values[q.profileKey];
    const problem = fieldError(q, value);
    if (problem) {
      errors[q.id] = problem;
      continue;
    }
    const page = pdf.getPage(p.page - 1),
      r = p.rect,
      y = page.getHeight() - r.y - r.height;
    const color = rgb(0.04, 0.18, 0.38);
    if (p.control === "checkbox") {
      const choice = "choiceValue" in p ? p.choiceValue : undefined;
      if (
        choice &&
        (Array.isArray(value) ? value.includes(choice) : value === choice)
      ) {
        const inset = Math.max(0.7, Math.min(r.width, r.height) * 0.16);
        page.drawLine({
          start: { x: r.x + inset, y: y + inset },
          end: { x: r.x + r.width - inset, y: y + r.height - inset },
          thickness: 0.8,
          color,
        });
        page.drawLine({
          start: { x: r.x + inset, y: y + r.height - inset },
          end: { x: r.x + r.width - inset, y: y + inset },
          thickness: 0.8,
          color,
        });
      }
    } else {
      const text = displayValue(q, value);
      if (!text) continue;
      try {
        const { lines, size } = fit(
          text,
          font,
          r.width - 3,
          r.height - 3,
          p.control === "multiline",
        );
        lines.forEach((line, i) =>
          page.drawText(line, {
            x: r.x + 1.5,
            y: y + r.height - 1.5 - size - i * size * 1.12,
            size,
            font,
            color,
          }),
        );
      } catch (e) {
        errors[q.id] =
          e instanceof Error ? e.message : "Could not render answer.";
      }
    }
  }
  return { bytes: await pdf.save(), errors };
}
