import { additionalReview, local, type Answers, type Locale } from "@/lib/demo/intake";

export function AdditionalReview({ answers, locale, actionId }: {
  answers: Answers; locale: Locale; actionId?: string;
}) {
  const fields = additionalReview(answers).filter(id => !actionId ||
    actionId === "assemble-application" ||
    (id === "funding" ? actionId === "financial-evidence" : actionId === "genuine-itinerary"));
  if (!fields.length) return null;
  const c = (en: string, cn: string, es: string) => local(locale, en, cn, es);
  return <aside className="demo-additional-review" aria-label={c("Additional review needed", "需要额外核验", "Revisión adicional pendiente")}>
    <strong>{c("Additional review needed", "需要额外核验", "Revisión adicional pendiente")}</strong>
    <ul>{fields.map(id => <li key={id}>{id === "priorStay"
      ? c("Check previous entry and exit dates against the rolling 90/180-day limit before finalizing your itinerary. This demo has not calculated your remaining days.", "确定行程前，请结合既往出入境日期核算任意连续 180 天内最多停留 90 天的限制。此演示尚未计算你的剩余天数。", "Antes de finalizar el itinerario, revisa las entradas y salidas previas y el límite de 90/180 días. La demo no ha calculado tus días restantes.")
      : c("Confirm the sponsor and required financial evidence. Parent-funded trips also need the original birth certificate and a copy. The base documents do not yet cover your complete funding evidence.", "请确认资助人及所需财务证明。父母资助还需出生证明原件及复印件，当前基础材料尚未覆盖你的完整资金证明。", "Confirma el patrocinador y las pruebas económicas necesarias. Si pagan tus padres, también se necesita el certificado de nacimiento original y una copia. Los documentos base aún no cubren todas las pruebas de financiación.")}</li>)}</ul>
  </aside>;
}
