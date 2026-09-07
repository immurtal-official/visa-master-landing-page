import type { ActionThreadState } from "./action-thread";
export type Locale = "en" | "cn" | "es";
export const local = (locale: Locale, en: string, cn: string, es: string) =>
  ({ en, cn, es })[locale];
export const fieldIds = [
  "destination",
  "hukou",
  "filingResidence",
  "purpose",
  "duration",
  "priorStay",
  "passport",
  "age",
  "employment",
  "funding",
  "party",
] as const;
export type FieldId = (typeof fieldIds)[number];
export type Answers = Partial<Record<FieldId, string>>;
export type DemoState = {
  version: 1;
  query: string;
  answers: Answers;
  inferred?: FieldId[];
  replies?: { question: FieldId; text: string }[];
  view: "thread" | "workspace";
  sample: boolean;
  threads?: Record<string, ActionThreadState>;
  activeAction?: string;
};
export const storageKey = "visa-master.curated-demo.v1";
const words = (en: string, cn: string, es: string) => ({ en, cn, es });
export const questions = {
  destination: {
    label: words("Main destination", "主要目的地", "Destino principal"),
    prompt: words(
      "Where will you spend most of your trip?",
      "这次旅行主要去哪个国家？",
      "¿En qué país pasarás la mayor parte del viaje?",
    ),
    detail: words(
      "For tourism, apply through your longest-stay country; if stays are equal, use the first Schengen country entered. This demo covers Spain.",
      "旅游行程按停留时间最长的国家申请；时间相同则按首次入境的申根国家申请。此演示支持西班牙。",
      "Para turismo, solicita al país de estancia más larga; en caso de empate, al primero de entrada a Schengen. Esta demo cubre España.",
    ),
    options: [
      words("Spain", "西班牙", "España"),
      words("Another destination", "其他国家", "Otro destino"),
    ],
  },
  hukou: {
    label: words("Hukou location", "户籍所在地", "Lugar de registro hukou"),
    prompt: words(
      "Where is your hukou registered?",
      "你的户口在哪里？",
      "¿Dónde está registrado tu hukou?",
    ),
    detail: words(
      "Use your household registration book. The real district covers Sichuan, Yunnan, Guizhou and Chongqing; this demo is limited to Chengdu hukou.",
      "请以户口本登记地为准。实际成都领区包含四川、云南、贵州、重庆；此演示仅覆盖成都户籍。",
      "Usa tu registro familiar. La demarcación incluye Sichuan, Yunnan, Guizhou y Chongqing; esta demo solo cubre hukou de Chengdú.",
    ),
    options: [
      words("Chengdu, China", "中国成都", "Chengdú, China"),
      words("Somewhere else", "其他地方", "Otro lugar"),
    ],
  },
  filingResidence: {
    label: words("Country of residence", "常住国家", "País de residencia"),
    prompt: words("Do you currently live in mainland China?", "你目前常住中国大陆吗？", "¿Resides actualmente en China continental?"),
    detail: words("Hukou alone does not establish where you should apply if you live abroad. This demo covers applicants living in mainland China.", "如果常住海外，不能仅凭成都户口判断递签地点。此演示支持常住中国大陆的申请人。", "El hukou no basta para determinar dónde solicitar si resides en el extranjero. Esta demo cubre residentes en China continental."),
    options: [words("Yes, I live in mainland China", "是，常住中国大陆", "Sí, resido en China continental"), words("I live abroad or need to check", "常住海外，或需要确认", "Resido fuera o necesito confirmarlo")],
  },
  priorStay: {
    label: words("Recent Schengen stays", "近期申根停留", "Estancias recientes en Schengen"),
    prompt: words("Any Schengen stays in the 180 days before this trip?", "本次入境前 180 天内，你在申根区停留过吗？", "¿Has estado en Schengen en los 180 días anteriores a este viaje?"),
    detail: words("The limit is 90 days in any rolling 180-day period, including earlier visits. Previous stays need a date-by-date calculation outside this demo.", "限制是任意连续 180 天内累计最多 90 天，包含之前的停留。有既往停留时，需要按出入境日期另行计算，此演示暂不处理。", "El límite es de 90 días en cualquier período de 180 días, incluidas visitas anteriores. Las estancias previas requieren un cálculo de fechas fuera de esta demo."),
    options: [words("No Schengen stays in that period", "这段时间没有申根停留", "Ninguna estancia en ese período"), words("Yes, or I am not sure", "有，或不确定", "Sí, o no estoy seguro")],
  },
  funding: {
    label: words("Trip funding", "旅行费用来源", "Financiación del viaje"),
    prompt: words("Who will pay for your trip?", "这次旅行的费用由谁承担？", "¿Quién pagará tu viaje?"),
    detail: words("The base documents cover your own income and savings. Sponsored or mixed funding needs additional evidence; you can still open the roadmap.", "基础材料按本人收入和存款准备。他人资助或混合出资需要补充材料，但仍可查看路线图。", "Los documentos base cubren ingresos y ahorros propios. La financiación externa o mixta requiere pruebas adicionales; puedes abrir la hoja de ruta."),
    options: [words("My own income and savings", "我本人的收入和存款", "Mis propios ingresos y ahorros"), words("Parents, another sponsor, or mixed funding", "父母、他人资助或混合出资", "Padres, otro patrocinador o financiación mixta")],
  },
  purpose: {
    label: words("Trip purpose", "旅行目的", "Motivo del viaje"),
    prompt: words(
      "What brings you to Spain?",
      "这次去西班牙的目的是什么？",
      "¿Qué te lleva a España?",
    ),
    detail: words(
      "This demo covers tourism. We’ll confirm the length of your stay separately.",
      "此演示支持旅游申请，停留天数会单独确认。",
      "Esta demo cubre turismo. Confirmaremos la duración por separado.",
    ),
    options: [
      words(
        "Tourism",
        "旅游",
        "Turismo",
      ),
      words(
        "Work, study, or another purpose",
        "工作、学习或其他目的",
        "Trabajo, estudios u otro motivo",
      ),
    ],
  },
  duration: {
    label: words("Length of stay", "停留时间", "Duración de la estancia"),
    prompt: words("How long will you stay in the Schengen area?", "这次计划在申根区停留多久？", "¿Cuánto tiempo estarás en el espacio Schengen?"),
    detail: words("Count the whole Schengen trip, including countries other than Spain.", "请计算整个申根区行程，包括西班牙以外的申根国家。", "Incluye todo el viaje por Schengen, no solo España."),
    options: [words("Up to 90 days", "不超过 90 天", "Hasta 90 días"), words("More than 90 days", "超过 90 天", "Más de 90 días")],
  },
  passport: {
    label: words("Travel document", "旅行证件", "Documento de viaje"),
    prompt: words(
      "Which passport will you travel with?",
      "你将使用哪种护照出行？",
      "¿Con qué pasaporte viajarás?",
    ),
    detail: words(
      "Just the type for now. You do not need to share your passport number or a scan.",
      "现在只需要证件类型，无需提供护照号码或扫描件。",
      "Solo el tipo por ahora. No necesitas compartir el número ni una copia.",
    ),
    options: [
      words(
        "Chinese ordinary passport",
        "中国普通护照",
        "Pasaporte ordinario chino",
      ),
      words(
        "A different travel document",
        "其他旅行证件",
        "Otro documento de viaje",
      ),
    ],
  },
  age: {
    label: words("Age group", "年龄范围", "Grupo de edad"),
    prompt: words(
      "Are you 18 or older?",
      "你是否已满 18 岁？",
      "¿Tienes 18 años o más?",
    ),
    detail: words(
      "Children have a different set of requirements.",
      "未成年申请人需要不同的材料。",
      "Los menores tienen requisitos diferentes.",
    ),
    options: [
      words("Yes, 18 or older", "是，已满 18 岁", "Sí, 18 años o más"),
      words("Under 18", "未满 18 岁", "Menor de 18 años"),
    ],
  },
  employment: {
    label: words("Employment", "工作状态", "Situación laboral"),
    prompt: words(
      "What is your current work situation?",
      "你目前的工作状态是？",
      "¿Cuál es tu situación laboral actual?",
    ),
    detail: words(
      "This helps me select the right employment and financial documents.",
      "这将帮助我匹配在职证明和财务材料。",
      "Esto permite seleccionar los documentos laborales y financieros adecuados.",
    ),
    options: [
      words(
        "Employed by a company",
        "公司在职员工",
        "Trabajo por cuenta ajena",
      ),
      words(
        "Self-employed, student, or other",
        "自雇、学生或其他",
        "Autónomo, estudiante u otro",
      ),
    ],
  },
  party: {
    label: words("Applicants", "申请人数", "Solicitantes"),
    prompt: words(
      "Who are we preparing an application for?",
      "这次为谁准备申请？",
      "¿Para quién preparamos la solicitud?",
    ),
    detail: words(
      "The demo prepares one employed adult’s application. Family plans will come later.",
      "此演示支持一位在职成年人的申请，家庭申请将后续开放。",
      "La demo prepara una solicitud de un adulto empleado. Las familias llegarán más adelante.",
    ),
    options: [
      words(
        "Just me · one applicant",
        "仅我自己 · 一位申请人",
        "Solo yo · un solicitante",
      ),
      words(
        "Family or multiple applicants",
        "家庭或多位申请人",
        "Familia o varios solicitantes",
      ),
    ],
  },
} as const;
export function answerLabel(id: FieldId, value: string, locale: Locale) {
  return value === "supported"
    ? questions[id].options[0][locale]
    : questions[id].options[1][locale];
}
export function nextQuestion(answers: Answers): FieldId | undefined {
  return fieldIds.find((id) => !answers[id]);
}
export const reviewFields: readonly FieldId[] = ["priorStay", "funding"];
export function additionalReview(answers: Answers) {
  return reviewFields.filter(id => answers[id] === "unsupported");
}
export function unsupportedQuestion(answers: Answers): FieldId | undefined {
  return fieldIds.find(id => !reviewFields.includes(id) && answers[id] && answers[id] !== "supported");
}
export function matchesRoute(answers: Answers) {
  return fieldIds.every(id => answers[id] === "supported" || (reviewFields.includes(id) && answers[id] === "unsupported"));
}

// Bounded demo extraction: only explicit facts, with per-clause negation and
// conflicts kept unresolved. A city alone never establishes hukou.
export function extractIntakeFacts(text: string) {
  const found = new Map<FieldId, Set<string>>();
  const uncertain = new Set<FieldId>();
  const add = (id: FieldId, value: string) => {
    const values = found.get(id) ?? new Set<string>();
    values.add(value);
    found.set(id, values);
  };
  const rules: [FieldId, RegExp, RegExp?][] = [
    ["destination", /\b(spain|madrid|barcelona|españa)\b|西班牙|马德里|巴塞罗那/i,
      /\b(france|paris|uk|united kingdom|britain|london|japan|tokyo|italy|germany|francia|portugal|greece|netherlands|switzerland|austria|belgium|sweden|norway|denmark|finland|poland|prague|rome|amsterdam)\b|法国|英国|日本|意大利|德国|葡萄牙|希腊|荷兰|瑞士|奥地利|比利时|瑞典|挪威|丹麦|芬兰|波兰/i],
    ["hukou", /\bchengdu\s+(?:household registration|hukou)\b|\b(?:my\s+)?hukou\s+(?:(?:is\s+)?registered\s+)?(?:is\s+)?in\s+chengdu\b|成都(?:的)?(?:户口|户籍)|(?:户口|户籍)(?:所在地)?(?:是|在|为)成都|hukou\s+(?:registrado\s+)?en\s+chengdú/i,
      /(?:户口|户籍)(?:所在地)?(?:是|在|为)(?:北京|上海|广州|深圳)|(?:北京|上海|广州|深圳)(?:户口|户籍)|\b(?:beijing|shanghai|guangzhou|shenzhen)\s+hukou\b/i],
    ["filingResidence", /\b(?:i (?:currently )?live|i reside|residing) in (?:mainland china|china|chengdu)\b|常住中国大陆|我(?:目前)?住在成都|resido en china continental/i,
      /\b(?:i (?:currently )?live|i reside|residing) (?:abroad|in (?:the uk|the us|germany|france|japan|spain|canada|australia))\b|常住海外|住在国外/i],
    ["funding", /\b(?:self[- ]funded|self[- ]funding|my own (?:income|savings)|pay(?:ing)? for (?:the|my) trip myself)\b|自费|自己承担费用|本人(?:的)?收入和存款|mis propios ingresos y ahorros/i,
      /\b(?:(?:parents?|father|mother) (?:will )?(?:pay|fund|sponsor)|sponsored by|mixed funding)\b|父母(?:出资|资助|承担)|他人资助|混合出资|financiación mixta/i],
    ["purpose", /\b(tourism|tourist|holiday|vacation|turismo)\b|旅游|观光/i,
      /\b(?:for work|for study|to study|business trip|work visa|student visa)\b|留学|商务|工作签证|去工作|去学习/i],
    ["passport", /\bchinese ordinary passport\b|中国普通护照|pasaporte ordinario chino/i,
      /\b(?:british|american|us|japanese|indian|french) passport\b|英国护照|美国护照|日本护照|中国公务护照|中国外交护照/i],
    ["age", /\b(?:adult|18 or older|over 18)\b|已满18岁|成年人|mayor de edad/i,
      /\b(?:minor|under 18)\b|未满18岁|未成年人|menor de edad/i],
    ["employment", /\b(?:employed|company employee|full[- ]time employee)\b|在职|公司职员|公司员工|上班族|trabajo por cuenta ajena/i,
      /\b(?:unemployed|self[- ]employed|student|retired)\b|失业|自雇|退休|学生|autónomo|estudiante|jubilado/i],
    ["party", /\b(?:just me|one applicant|only me|travel(?:ling|ing)? alone|solo traveler)\b|仅我自己|只有我|一个人|一位申请人|solo yo|un solicitante/i,
      /\b(?:two|three|four|multiple) applicants?\b|\b(?:with my (?:wife|husband|family|children)|family trip)\b|两位申请人|多位申请人|一家人|我们一家|和(?:妻子|丈夫|家人|孩子)|varios solicitantes/i],
  ];
  const normalized = text.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)(?=\s+(?:days?|weeks?)\b)/gi,
    value => String(["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"].indexOf(value.toLowerCase()) + 1));
  for (const raw of normalized.split(/[,，;；。.!！?？\n]|\bbut\b|但是|不过/i)) {
    const clause = raw.trim();
    if (!clause) continue;
    const negated = /\b(?:not|no|without|except|instead|maybe|perhaps|might|if|or)\b|不是|不在|没有|并非|不去|不确定|可能|也许|如果|或者|还是|非成都|不持有/i.test(clause);
    for (const [id, positive, negative] of rules) {
      const yes = positive.test(clause) && !(id === "employment" && /self[- ]employed/i.test(clause)) && !(id === "age" && /未成年人/.test(clause));
      const no = negative?.test(clause);
      if (yes || no) {
        if (negated) uncertain.add(id);
        else { if (yes) add(id, "supported"); if (no) add(id, "unsupported"); }
      }
    }
    // Negated hukou sentences may interrupt the positive phrase.
    if (negated && /hukou|户口|户籍/i.test(clause)) uncertain.add("hukou");
    if (negated && /passport|护照/i.test(clause)) uncertain.add("passport");
    if (negated && /employed|在职|工作/i.test(clause)) uncertain.add("employment");
    const ages = [...clause.matchAll(/(?:\b(?:i am|i'm|age|aged)\s*)(\d{1,3})\b|(\d{1,3})\s*(?:years? old|[- ]year[- ]old|岁|años)/gi)];
    for (const age of ages) {
      const n = Number(age[1] ?? age[2]);
      if (negated || n > 120) uncertain.add("age");
      else add("age", n >= 18 ? "supported" : "unsupported");
    }
    if (/first (?:ever )?schengen trip|首次去申根|第一次去申根/i.test(clause) && !negated) add("priorStay", "supported");
    if (/schengen|申根/i.test(clause) && /180/.test(clause) && /before|past|previous|last|前|过去|之前/i.test(clause)) {
      if (/no (?:schengen )?stays|have not (?:visited|been)|没有(?:在申根区)?停留|未去过|没去过/i.test(clause)) add("priorStay", "supported");
      else uncertain.add("priorStay");
      continue;
    }
    if (/past|previous|last|过去|之前/i.test(clause)) continue;
    const durations = [...clause.matchAll(/(?:(\d+)\s*(?:-|–|to|至|到)\s*)?(\d+)\s*(days?|weeks?|天|周|días|semanas)/gi)];
    for (const duration of durations) {
      const n = Math.max(Number(duration[1] ?? duration[2]), Number(duration[2])) * (/weeks?|周|semanas/i.test(duration[3]) ? 7 : 1);
      if (negated || n < 1 || /more than|at least|over|超过|至少/i.test(clause)) uncertain.add("duration");
      else add("duration", n <= 90 ? "supported" : "unsupported");
    }
  }
  const answers: Answers = {};
  for (const [id, values] of found) {
    if (values.size > 1) uncertain.add(id);
    if (!uncertain.has(id)) answers[id] = [...values][0];
  }
  return { answers, uncertain: [...uncertain] };
}

export function applyIntakeMessage(previous: Answers, text: string, current: FieldId) {
  const facts = extractIntakeFacts(text);
  const answers = { ...previous };
  for (const id of facts.uncertain) delete answers[id];
  for (const [key, value] of Object.entries(facts.answers)) {
    const id = key as FieldId;
    if (id !== current && previous[id] && previous[id] !== value) delete answers[id];
    else answers[id] = value;
  }
  // Exact option labels and whole-answer parsing outrank conservative clause
  // ambiguity (for example, the option “Yes, 18 or older” contains “or”).
  const direct = parseAnswer(current, text);
  if (direct) answers[current] = direct;
  return answers;
}

export function startDemo(query: string): DemoState {
  const answers = extractIntakeFacts(query.slice(0, 500)).answers;
  return {
    version: 1,
    query: query.slice(0, 500),
    answers,
    inferred: Object.keys(answers) as FieldId[],
    replies: [],
    view: "thread",
    sample: false,
  };
}

export function parseAnswer(id: FieldId, text: string): string | undefined {
  const normalized = text
    .trim()
    .toLocaleLowerCase()
    .replace(/[.!。！]+$/, "");
  for (let i = 0; i < 2; i++)
    if (
      Object.values(questions[id].options[i]).some(
        (v) => v.toLocaleLowerCase() === normalized,
      )
    )
      return i === 0 ? "supported" : "unsupported";
  // Match whole answers, never positive keywords inside a negated sentence.
  const patterns: Record<FieldId, RegExp> = {
    filingResidence: /^(?:mainland china|中国大陆)$/i,
    priorStay: /^(?:no schengen stays in that period|这段时间没有申根停留|ninguna estancia en ese período)$/i,
    funding: /^(?:self[- ]funded|自费)$/i,
    destination: /^(spain|españa|西班牙|madrid|马德里)$/i,
    hukou:
      /^(chengdu(?:,? (?:sichuan,? )?china)?|成都|中国成都|中国四川成都|成都户口|成都户籍|户口在成都|我的户口在成都|chengdu hukou|my hukou is (?:registered )?in chengdu|chengdú)$/i,
    duration: /^(?:up to 90 days|不超过\s*90\s*天|hasta 90 días)$/i,
    purpose: /^(tourism|旅游|turismo|holiday|vacation)$/i,
    passport:
      /^(chinese ordinary passport|中国普通护照|pasaporte ordinario chino)$/i,
    age: /^(yes|是|sí|adult|成年人|18\+)$/i,
    employment: /^(employed|在职|公司职员|empleado)$/i,
    party: /^(just me|solo|one|1|我自己|一个人|一人|solo yo)$/i,
  };
  if (id === "priorStay" && /^(?:no|没有|否|ninguna)$/i.test(normalized)) return "supported";
  if (id === "priorStay" && /^(?:yes|有|是|sí)$/i.test(normalized)) return "unsupported";
  if (id === "filingResidence" && /^(?:yes|是|sí)$/i.test(normalized)) return "supported";
  if (patterns[id].test(normalized)) return "supported";
  if (id === "duration") return extractIntakeFacts(normalized).answers.duration;
  if (id === "age" && /^\d{1,3}$/.test(normalized) && Number(normalized) <= 120)
    return Number(normalized) >= 18 ? "supported" : "unsupported";
  if (
    /^(other|no|not employed|unemployed|student|self-employed|retired|family|其他|不是|否|失业|学生|自雇|退休|家庭|otro|no trabajo)$/i.test(
      normalized,
    )
  )
    return "unsupported";
  return undefined;
}
export function restoreDemo(raw: string | null): DemoState | null {
  try {
    const data = JSON.parse(raw ?? "null");
    if (
      !data ||
      data.version !== 1 ||
      typeof data.query !== "string" ||
      data.query.length > 500 ||
      typeof data.sample !== "boolean" ||
      !["thread", "workspace"].includes(data.view) ||
      !data.answers ||
      typeof data.answers !== "object" ||
      Array.isArray(data.answers)
    )
      return null;
    const answers: Answers = {};
    for (const [key, value] of Object.entries(data.answers)) {
      // Older demos asked about residence. Preserve other answers and threads,
      // but ask for hukou explicitly instead of reinterpreting that answer.
      if (key === "residence" && ["supported", "unsupported"].includes(value as string))
        continue;
      if (
        !fieldIds.includes(key as FieldId) ||
        !["supported", "unsupported"].includes(value as string)
      )
        return null;
      answers[key as FieldId] = value as string;
    }
    const threads: Record<string, ActionThreadState> = {};
    if (
      data.threads &&
      typeof data.threads === "object" &&
      !Array.isArray(data.threads)
    ) {
      for (const [id, value] of Object.entries(data.threads).slice(0, 30)) {
        if (
          !/^[a-z][a-z-]{0,80}$/.test(id) ||
          !value ||
          typeof value !== "object"
        )
          continue;
        const thread = value as ActionThreadState;
        if (
          typeof thread.draft !== "string" ||
          thread.draft.length > 2000 ||
          !Array.isArray(thread.messages)
        )
          continue;
        const messages = thread.messages
          .slice(-100)
          .filter(
            (message) =>
              message &&
              typeof message.id === "string" &&
              message.id.length < 100 &&
              ((message.role === "user" &&
                typeof message.text === "string" &&
                message.text.length <= 2000) ||
                (message.role === "assistant" &&
                  [
                    "guidance",
                    "requirements",
                    "resources",
                    "completion",
                    "limits",
                  ].includes(message.intent))),
          );
        threads[id] = { draft: thread.draft, messages };
      }
    }
    return {
      ...(data.threads ? { threads } : {}),
      ...(typeof data.activeAction === "string" &&
      /^[a-z][a-z-]{0,80}$/.test(data.activeAction)
        ? { activeAction: data.activeAction }
        : {}),
      ...(Array.isArray(data.replies) ? { replies: data.replies.slice(-100).filter((reply: { question: FieldId; text: string }) =>
        reply && fieldIds.includes(reply.question) && typeof reply.text === "string" && reply.text.length <= 1000) } : {}),
      ...(Array.isArray(data.inferred) ? { inferred: data.inferred.filter((id: FieldId) => fieldIds.includes(id) && answers[id]) } : {}),
      version: 1,
      query: data.query,
      answers,
      sample: data.sample,
      view:
        data.view === "workspace" && matchesRoute(answers)
          ? "workspace"
          : "thread",
    };
  } catch {
    return null;
  }
}
