import { createHmac, randomBytes } from "node:crypto";

const secret = process.env.INVITE_SECURITY_SECRET;
const label = process.argv.slice(2).join(" ").trim() || "Private beta";

if (!secret || secret.length < 32) {
  console.error("Add an INVITE_SECURITY_SECRET of at least 32 characters before creating phrases.");
  process.exitCode = 1;
} else {
  const phrase = `vm-${randomBytes(12).toString("base64url")}`;
  const digest = createHmac("sha256", secret)
    .update(`phrase:${phrase.toLowerCase()}`)
    .digest("hex");
  const sqlLabel = label.replaceAll("'", "''");

  console.log(`Invite phrase (shown once): ${phrase}`);
  console.log("\nAdd this row in the Supabase SQL Editor:\n");
  console.log(
    `insert into public.invite_phrases (label, phrase_digest, max_redemptions) values ('${sqlLabel}', '${digest}', 1);`,
  );
}
