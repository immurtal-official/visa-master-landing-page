import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

// Explicit, offline snapshot. Nothing at runtime reaches into the sibling repo.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.argv[2] ?? resolve(root, "../visa-master"));
const routeDir =
  "agent/skills/research-core/references/routes/spain-schengen-tourism-chengdu-employed-adult";
const files = Object.fromEntries(
  ["route", "artifacts", "sources", "evidence", "documents.en"].map((name) => [
    name,
    `${routeDir}/${name}.json`,
  ]),
);
files["form-map"] =
  "toolchain/forms/maps/schengen-application/spain-es-en-zh-2026-08.json";
files["form-map-verification"] =
  "toolchain/forms/maps/schengen-application/spain-es-en-zh-2026-08.verification.json";
const output = resolve(root, "lib/demo/data");
await mkdir(output, { recursive: true });
const provenance = {
  repository: "immurtal-official/visa-master",
  revision: execFileSync("git", ["-C", source, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  liveVerified: false,
  files: {},
};
for (const [name, path] of Object.entries(files)) {
  const content = await readFile(resolve(source, path), "utf8");
  JSON.parse(content);
  await writeFile(resolve(output, `${name}.json`), content);
  provenance.files[name] = {
    path,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}
await writeFile(
  resolve(output, "provenance.json"),
  JSON.stringify(provenance, null, 2) + "\n",
);
console.log(
  `Bundled ${Object.keys(files).length} curated resources. No live verification performed.`,
);
