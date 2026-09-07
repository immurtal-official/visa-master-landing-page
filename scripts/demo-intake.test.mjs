import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  answerLabel,
  additionalReview,
  reviewFields,
  applyIntakeMessage,
  extractIntakeFacts,
  fieldIds,
  matchesRoute,
  nextQuestion,
  parseAnswer,
  restoreDemo,
  startDemo,
  unsupportedQuestion,
} from "../lib/demo/intake.ts";

const supported = Object.fromEntries(fieldIds.map((id) => [id, "supported"]));
test("departure does not imply hukou, passport, or applicant category", () => {
  const state = startDemo("Chengdu → Madrid");
  assert.deepEqual(state.answers, { destination: "supported" });
  assert.equal(nextQuestion(state.answers), "hukou");
  assert.equal(matchesRoute(state.answers), false);
});
test("unsupported and ambiguous initial routes do not get a Spain match", () => {
  assert.equal(
    unsupportedQuestion(startDemo("UK visitor visa").answers),
    "destination",
  );
  for (const text of [
    "Not Spain",
    "France and Spain",
    "不是西班牙",
    "somewhere warm",
  ])
    assert.equal(startDemo(text).answers.destination, undefined);
});
test("core match and answered review questions are necessary to enter the Workspace", () => {
  assert.ok(matchesRoute(supported));
  for (const field of fieldIds) {
    assert.equal(matchesRoute({ ...supported, [field]: undefined }), false);
    assert.equal(matchesRoute({ ...supported, [field]: "unsupported" }), reviewFields.includes(field));
    assert.equal(
      unsupportedQuestion({ ...supported, [field]: "unsupported" }),
      reviewFields.includes(field) ? undefined : field,
    );
  }
});
test("choices work in every supported UI language", () => {
  for (const field of fieldIds)
    for (const locale of ["en", "cn", "es"]) {
      assert.equal(
        parseAnswer(field, answerLabel(field, "supported", locale)),
        "supported",
      );
      assert.equal(
        parseAnswer(field, answerLabel(field, "unsupported", locale)),
        "unsupported",
      );
    }
});
test("free text does not accept negation, partial passport details, or impossible ages", () => {
  assert.equal(parseAnswer("hukou", "I do not live in Chengdu"), undefined);
  assert.equal(parseAnswer("passport", "Chinese"), undefined);
  assert.equal(parseAnswer("employment", "not employed"), "unsupported");
  assert.equal(parseAnswer("age", "17"), "unsupported");
  assert.equal(parseAnswer("age", "18"), "supported");
  assert.equal(parseAnswer("age", "999"), undefined);
});
test("valid tab state survives refresh, including sample status", () => {
  const state = {
    ...startDemo("Spain"),
    answers: supported,
    view: "workspace",
    sample: true,
  };
  assert.deepEqual(restoreDemo(JSON.stringify(state)), state);
});
test("corrupt or incompatible storage is ignored, incomplete Workspace is demoted", () => {
  for (const raw of [
    null,
    "oops",
    "{}",
    "[]",
    '{"version":2}',
    JSON.stringify({
      ...startDemo("Spain"),
      answers: { injected: "supported" },
    }),
  ])
    assert.equal(restoreDemo(raw), null);
  assert.equal(
    restoreDemo(JSON.stringify({ ...startDemo("Spain"), view: "workspace" }))
      .view,
    "thread",
  );
});
test("bundled source snapshots retain their recorded hashes and resource references", () => {
  const read = (name) =>
    JSON.parse(
      readFileSync(new URL(`../lib/demo/data/${name}.json`, import.meta.url)),
    );
  for (const [name, entry] of Object.entries(read("provenance").files)) {
    const content = readFileSync(
      new URL(`../lib/demo/data/${name}.json`, import.meta.url),
    );
    assert.equal(
      createHash("sha256").update(content).digest("hex"),
      entry.sha256,
      name,
    );
  }
  const route = read("route");
  const requirements = read("artifacts").requirements;
  const resourceIds = new Set([
    ...read("documents.en").documents.map((d) => d.id),
    ...read("sources").downloads.map((d) => d.id),
  ]);
  assert.equal(route.casePlan.actions.length, 14);
  for (const action of route.casePlan.actions) {
    for (const id of action.resourceIds ?? [])
      assert.ok(resourceIds.has(id), `${action.id}: ${id}`);
    for (const id of action.requirementIds ?? [])
      assert.ok(
        requirements.some((r) => r.id === id),
        `${action.id}: ${id}`,
      );
  }
});

test("action threads keep independent histories, drafts, and the selected action", () => {
  const state = {
    ...startDemo("Spain"),
    answers: supported,
    view: "workspace",
    activeAction: "employment-evidence",
    threads: {
      "employment-evidence": {
        draft: "Explain the signature",
        messages: [
          { id: "1", role: "user", text: "What do I need?" },
          { id: "2", role: "assistant", intent: "requirements" },
        ],
      },
      "visa-photographs": {
        draft: "",
        messages: [
          { id: "3", role: "user", text: "Show the documents" },
          { id: "4", role: "assistant", intent: "resources" },
        ],
      },
    },
  };
  assert.deepEqual(restoreDemo(JSON.stringify(state)), state);
});

test("invalid thread replies are discarded without losing the applicant intake", () => {
  const state = {
    ...startDemo("Spain"),
    threads: {
      "employment-evidence": {
        draft: "",
        messages: [{ id: "1", role: "assistant", intent: "pretend-submitted" }],
      },
    },
  };
  const restored = restoreDemo(JSON.stringify(state));
  assert.deepEqual(restored.answers, state.answers);
  assert.deepEqual(restored.threads["employment-evidence"].messages, []);
});

test("hukou matching never treats current residence as household registration", () => {
  for (const answer of ["成都", "成都户口", "户口在成都", "My hukou is registered in Chengdu"])
    assert.equal(parseAnswer("hukou", answer), "supported");
  for (const answer of ["我住在成都", "I live in Chengdu", "成都居住证", "户口不在成都", "My hukou is not in Chengdu"])
    assert.equal(parseAnswer("hukou", answer), undefined);
});

test("legacy residence answers require hukou confirmation without losing other progress", () => {
  const otherAnswers = Object.fromEntries(Object.entries(supported).filter(([id]) => id !== "hukou"));
  const state = {
    ...startDemo("Spain"),
    answers: { ...otherAnswers, residence: "supported" },
    view: "workspace",
    activeAction: "employment-evidence",
    threads: { "employment-evidence": { draft: "Keep this draft", messages: [] } },
  };
  const restored = restoreDemo(JSON.stringify(state));
  assert.deepEqual(restored.answers, otherAnswers);
  assert.equal(restored.view, "thread");
  assert.equal(nextQuestion(restored.answers), "hukou");
  assert.equal(matchesRoute(restored.answers), false);
  assert.deepEqual(restored.threads, state.threads);
  assert.equal(restored.activeAction, state.activeAction);
});

test("initial message extracts explicit multiple facts and asks only for missing information", () => {
  const state = startDemo("chengdu hukou to spain, tourism");
  assert.deepEqual(state.answers, { destination: "supported", hukou: "supported", purpose: "supported" });
  assert.equal(nextQuestion(state.answers), "filingResidence");
  assert.equal(state.answers.passport, undefined);
});

test("one English or Chinese message can provide the complete demo profile", () => {
  for (const text of [
    "Chengdu hukou, Spain tourism for two weeks, Chinese ordinary passport, I am 30, employed, just me, I live in mainland China, self-funded, first Schengen trip",
    "成都户口，去西班牙旅游14天，中国普通护照，我30岁，公司在职员工，一个人，常住中国大陆，自费，第一次去申根",
  ]) assert.ok(matchesRoute(startDemo(text).answers), text);
});

test("follow-ups fill multiple missing facts while retaining the earlier ones", () => {
  const initial = startDemo("chengdu hukou to spain, tourism").answers;
  const next = applyIntakeMessage(initial, "14 days, Chinese ordinary passport, I am 30, employed, just me, I live in mainland China, self-funded, first Schengen trip", "duration");
  assert.ok(matchesRoute(next));
  assert.equal(next.hukou, "supported");
});

test("uncertainty, conflicting facts and residence alone never silently match", () => {
  for (const text of ["I live in Chengdu", "I depart from Chengdu", "My hukou is not in Chengdu", "Maybe Chengdu hukou", "成都居住证"]) {
    assert.equal(startDemo(text).answers.hukou, undefined, text);
  }
  for (const text of ["France and Spain", "Spain or France", "not Spain", "Maybe Spain"]) {
    assert.equal(startDemo(text).answers.destination, undefined, text);
  }
  assert.equal(startDemo("Chengdu hukou, Shanghai hukou").answers.hukou, undefined);
  assert.equal(applyIntakeMessage(supported, "my hukou is not in Chengdu", "duration").hukou, undefined);
  assert.equal(applyIntakeMessage(supported, "I am 17", "duration").age, undefined);
  assert.equal(applyIntakeMessage(supported, "17", "age").age, "unsupported");
  assert.equal(startDemo("self-employed").answers.employment, "unsupported");
});

test("tourism does not imply a short stay; duration ranges are checked", () => {
  assert.equal(startDemo("Spain tourism").answers.duration, undefined);
  assert.equal(startDemo("Spain tourism for 120 days").answers.duration, "unsupported");
  assert.equal(startDemo("Spain tourism for 10 to 120 days").answers.duration, "unsupported");
  assert.equal(startDemo("Spain tourism for at least 30 days").answers.duration, undefined);
  assert.equal(parseAnswer("duration", "two weeks"), "supported");
  assert.equal(extractIntakeFacts("I am 30 years old").answers.duration, undefined);
});

test("typed option labels remain valid in the adaptive intake", () => {
  for (const id of fieldIds)
    for (const locale of ["en", "cn", "es"])
      for (const value of ["supported", "unsupported"])
        assert.equal(applyIntakeMessage({}, answerLabel(id, value, locale), id)[id], value);
});

test("audit: stay history, residence country and funding must be confirmed", () => {
  for (const id of ["priorStay", "filingResidence", "funding"])
    assert.equal(matchesRoute({ ...supported, [id]: undefined }), false);
  const answers = startDemo("Chengdu hukou, Spain tourism 14 days, I live abroad, parents pay for my trip").answers;
  assert.equal(answers.filingResidence, "unsupported");
  assert.equal(answers.funding, "unsupported");
  assert.equal(parseAnswer("priorStay", "yes"), "unsupported");
  assert.equal(parseAnswer("priorStay", "no"), "supported");
  assert.equal(startDemo("No Schengen stays in the 180 days before this trip").answers.duration, undefined);
  assert.equal(startDemo("No Schengen stays in the 180 days before this trip").answers.priorStay, "supported");
});

test("audit: multiple destinations and non-demo hukou are not silently matched", () => {
  for (const text of ["Spain and Portugal", "Spain, Netherlands", "西班牙和瑞士"])
    assert.equal(startDemo(text).answers.destination, undefined);
  assert.equal(parseAnswer("hukou", "云南户口"), undefined);
  assert.equal(matchesRoute({ ...supported, hukou: undefined }), false);
});

test("review flags allow the roadmap, survive reload, and clear when answers change", () => {
  const answers = { ...supported, priorStay: "unsupported", funding: "unsupported" };
  assert.equal(matchesRoute(answers), true);
  assert.equal(unsupportedQuestion(answers), undefined);
  assert.deepEqual(additionalReview(answers), ["priorStay", "funding"]);
  const restored = restoreDemo(JSON.stringify({ ...startDemo("Spain"), answers, view: "workspace" }));
  assert.equal(restored.view, "workspace");
  assert.deepEqual(additionalReview(restored.answers), ["priorStay", "funding"]);
  assert.deepEqual(additionalReview({ ...answers, funding: "supported" }), ["priorStay"]);
  assert.equal(matchesRoute({ ...answers, passport: "unsupported" }), false);
});
