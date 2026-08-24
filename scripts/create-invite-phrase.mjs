import { createHmac, randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);

function parseArguments() {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      label: { type: "string" },
      phrase: { type: "string" },
      "sql-only": { type: "boolean" },
    },
  });

  if (values.label && positionals.length > 0) {
    throw new Error("Use either a positional label or --label, not both.");
  }

  return {
    help: values.help ?? false,
    label: (values.label ?? positionals.join(" ")).trim() || "Private beta",
    customPhrase: values.phrase,
    sqlOnly: values["sql-only"] ?? false,
  };
}

function normalizePhrase(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function printUsage() {
  console.log(`Create a single-use invite phrase in the configured Supabase project.

Usage:
  npm run invite:create -- "Private beta"
  npm run invite:create -- --label "Private beta" --phrase "LUYA-EARLY-2026"

Options:
  --label <label>    Internal database label
  --phrase <phrase>  Custom phrase (6-160 characters after normalization)
  --sql-only         Print SQL instead of inserting the phrase
  --help             Show this help`);
}

async function createInvite() {
  const options = parseArguments();

  if (options.help) {
    printUsage();
    return;
  }

  const inviteSecuritySecret = process.env.INVITE_SECURITY_SECRET;
  if (!inviteSecuritySecret || inviteSecuritySecret.length < 32) {
    throw new Error(
      "Add an INVITE_SECURITY_SECRET of at least 32 characters before creating phrases.",
    );
  }

  const phrase = options.customPhrase
    ? normalizePhrase(options.customPhrase)
    : `vm-${randomBytes(12).toString("base64url")}`;

  const invalidCustomPhrase =
    options.customPhrase && (phrase.length < 6 || phrase.length > 160);

  if (invalidCustomPhrase) {
    throw new Error("A custom invite phrase must be 6-160 characters after normalization.");
  }

  const digest = createHmac("sha256", inviteSecuritySecret)
    .update(`phrase:${normalizePhrase(phrase)}`)
    .digest("hex");
  const displayPhrase = phrase.toUpperCase();

  if (options.sqlOnly) {
    const sqlLabel = options.label.replaceAll("'", "''");
    const sqlPhrase = displayPhrase.replaceAll("'", "''");
    console.log(`Invite phrase (shown once): ${displayPhrase}`);
    console.log("\nAdd this row in the Supabase SQL Editor:\n");
    console.log(
      `insert into public.invite_phrases (label, phrase, phrase_digest, max_redemptions) values ('${sqlLabel}', '${sqlPhrase}', '${digest}', 1);`,
    );
    return;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Automatic creation requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY. Use --sql-only for manual insertion.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { error } = await supabase.from("invite_phrases").insert({
    label: options.label,
    phrase: displayPhrase,
    phrase_digest: digest,
    max_redemptions: 1,
  });

  if (error?.code === "23505") {
    throw new Error("That invite phrase already exists in Supabase.");
  }
  if (error) {
    throw new Error(`Supabase could not create the invite phrase: ${error.message}`);
  }

  console.log("Invite phrase created in Supabase.");
  console.log(`Invite phrase (shown once): ${displayPhrase}`);
}

try {
  await createInvite();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unable to create the invite phrase.");
  process.exitCode = 1;
}
