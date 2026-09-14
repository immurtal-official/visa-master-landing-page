import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import {
  formMap,
  formQuestions,
  matches,
  fieldError,
  displayValue,
  restoreFormValues,
} from "../lib/demo/official-form.ts";
import { renderFormPdf } from "../lib/demo/form-pdf.ts";
import { restoreDemo, fieldIds } from "../lib/demo/intake.ts";
const bytes = readFileSync(
  new URL("../public/forms/spain-schengen.pdf", import.meta.url),
);
test("bundled source exactly matches approved map, geometry and page count", async () => {
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    formMap.source.sha256,
  );
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 5);
  for (const p of formMap.source.pages) {
    assert.ok(Math.abs(pdf.getPage(p.page - 1).getWidth() - p.width) < 0.01);
    assert.ok(Math.abs(pdf.getPage(p.page - 1).getHeight() - p.height) < 0.01);
  }
});
test("conditional sponsor fields appear only when applicable and hidden values are not rendered", async () => {
  assert.equal(
    matches(
      { contains: { field: "funding.payer", value: "sponsor" } },
      { "funding.payer": ["applicant"] },
    ),
    false,
  );
  assert.ok(
    formQuestions("en", { "funding.payer": ["sponsor"] }).some(
      (q) => q.id === "funding.sponsor.identity",
    ),
  );
  assert.ok(
    !formQuestions("en", { "funding.payer": ["applicant"] }).some(
      (q) => q.id === "funding.sponsor.identity",
    ),
  );
  const result = await renderFormPdf(
    {
      "funding.payer": ["applicant"],
      "funding.sponsor.identity.other_detail": "不可渲染",
    },
    bytes,
  );
  assert.equal(Object.keys(result.errors).length, 0);
});
test("validation rejects impossible dates, invalid choices and unsupported text; formats dates", () => {
  const birth = formQuestions("en", {}).find(
    (q) => q.id === "applicant.birth.date",
  );
  assert.ok(fieldError(birth, "2026-02-30"));
  assert.equal(fieldError(birth, "2000-02-29"), null);
  assert.equal(displayValue(birth, "2000-02-29"), "29-02-2000");
  assert.ok(
    fieldError({ type: "single-choice", choices: [{ value: "one" }] }, "two"),
  );
  assert.ok(fieldError({ type: "text" }, "张三"));
  assert.equal(fieldError({ type: "boolean" }, false), null);
});
test("draft restores with bounds and false boolean answers survive", () => {
  const state = restoreDemo(
    JSON.stringify({
      version: 1,
      query: "Spain",
      sample: false,
      view: "workspace",
      answers: Object.fromEntries(fieldIds.map((id) => [id, "supported"])),
      formValues: {
        "applicant.is_minor": false,
        "applicant.name.given": "TEST",
        bad: "x".repeat(2001),
      },
    }),
  );
  assert.equal(state.formValues["applicant.is_minor"], false);
  assert.equal(state.formValues.bad, undefined);
  assert.deepEqual(restoreFormValues({ ...state.formValues, unknown: "no" }), {
    "applicant.name.given": "TEST",
    "applicant.is_minor": false,
  });
});
test("export preserves five pages, leaves signatures empty and reports overflow", async () => {
  const result = await renderFormPdf(
    {
      "applicant.name.family": "TEST",
      "applicant.name.given": "APPLICANT",
      "applicant.birth.date": "2000-02-29",
      "applicant.sex": "female",
      "declaration.signature": "fake",
    },
    bytes,
  );
  assert.deepEqual(result.errors, {});
  const pdf = await PDFDocument.load(result.bytes);
  assert.equal(pdf.getPageCount(), 5);
  const overflow = await renderFormPdf(
    { "applicant.contact.email": "a".repeat(1900) + "@example.com" },
    bytes,
  );
  assert.ok(overflow.errors["applicant.contact.email"]);
});

test('narrow company contact field renders at the map minimum font size', async () => {
  const result = await renderFormPdf({
    'applicant.eu_family_qualified': false,
    'journey.company_details_required': true,
    'inviting_company.contact.email': 'ana@example.invalid'
  }, bytes);
  assert.deepEqual(result.errors, {});
});

test('form conversation restores chronological answers and rejects malformed turns', () => {
 const turn={questionId:'applicant.name.family',prompt:'What is your surname?',text:'ZHANG'};
 const state=restoreDemo(JSON.stringify({version:1,query:'Spain',sample:false,view:'workspace',answers:Object.fromEntries(fieldIds.map(id=>[id,'supported'])),formTurns:[turn,{...turn,text:'WANG'},null,{...turn,text:'x'.repeat(2001)}]}));
 assert.deepEqual(state.formTurns,[turn,{...turn,text:'WANG'}]);
});

test('conversation questions preserve the mapped document and date context', async () => {
 const {formPrompt}=await import('../lib/demo/form-prompts.ts');
 const fields=formMap.questions;
 const question=id=>fields.find(q=>q.id===id);
 const values={'travel_document.type':'ordinary_passport'};
 assert.match(formPrompt(question('travel_document.expiry_date'),'en',values),/passport expire/);
 assert.match(formPrompt(question('travel_document.expiry_date'),'cn',values),/护照有效期/);
 assert.match(formPrompt(question('travel_document.issue_date'),'en',values),/passport issued/);
 assert.match(formPrompt(question('travel_document.expiry_date'),'en',{}),/travel document expire/);
 assert.match(formPrompt(question('residence.permit.valid_until'),'en',values),/residence permit/);
 assert.match(formPrompt(question('final_destination_permit.valid_until'),'en',values),/outside Schengen/);
 assert.match(formPrompt(question('declaration.place'),'en',values),/sign the application/);
});

test('post-form follow-ups route to demo help without becoming PDF answers', async () => {
 const {formFollowupIntent}=await import('../lib/demo/action-thread.ts');
 assert.equal(formFollowupIntent('Can I change my passport expiry date?'),'requirements');
 assert.equal(formFollowupIntent('我要修改名字'),'requirements');
 assert.equal(formFollowupIntent('How do I download the PDF?'),'resources');
 assert.equal(formFollowupIntent('在哪里签名？'),'completion');
 assert.equal(formFollowupIntent('Something else'),'limits');
});

test('tourism asks accommodation details directly even after an old No answer', async () => {
 const values={'journey.purposes':['tourism'],'journey.host_details_required':false};
 const questions=formQuestions('en',values);
 assert.ok(!questions.some(q=>q.id==='journey.host_details_required'));
 for(const id of ['host.name','host.address','host.email','host.phone']) assert.ok(questions.some(q=>q.id===id));
 const result=await renderFormPdf({...values,'host.email':'not-an-email'},bytes);
 assert.ok(result.errors['host.email']);
 const exempt=formQuestions('en',{...values,'applicant.eu_family_qualified':true});
 assert.ok(!exempt.some(q=>q.id==='host.name'));
});
