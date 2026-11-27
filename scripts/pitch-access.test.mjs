import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  hasPitchAccess,
  isCorrectPitchPassword,
  isPitchPath,
  PITCH_ACCESS_DEFAULT,
  pitchAccessToken,
  pitchNextPath,
  pitchPassword,
} from "../lib/pitch-access.ts";

test("every pitch page and its files are gated, and nothing else is", () => {
  for (const path of [
    "/pitch",
    "/pitch/index.html",
    "/pitch/v6",
    "/pitch/v6/index.html",
    "/pitch-vm2luya",
    "/pitch-vm2luya/en",
    "/pitch-vm2luya/assets/demo-vm.mp4",
  ]) {
    assert.equal(isPitchPath(path), true, path);
  }

  for (const path of ["/", "/pitch-access", "/api/pitch-access", "/pitches", "/workspace", "/pitch-vm2luya-notes"]) {
    assert.equal(isPitchPath(path), false, path);
  }
});

test("proxy.ts matches every path that lib/pitch-access.ts gates", () => {
  const proxy = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  for (const matcher of ['"/pitch"', '"/pitch/:path*"', '"/pitch-vm2luya"', '"/pitch-vm2luya/:path*"']) {
    assert.ok(proxy.includes(matcher), `proxy.ts matcher is missing ${matcher}`);
  }
});

test("no configured password means nobody gets in", () => {
  assert.equal(pitchPassword({}), null);
  assert.equal(pitchPassword({ PITCH_ACCESS_PASSWORD: "   " }), null);
  assert.equal(isCorrectPitchPassword("", null), false);
  assert.equal(isCorrectPitchPassword("anything", null), false);
  assert.equal(hasPitchAccess("anything", null), false);
});

test("only the exact password is accepted", () => {
  const password = pitchPassword({ PITCH_ACCESS_PASSWORD: " Kyoto-in-May " });
  assert.equal(password, "Kyoto-in-May");
  assert.equal(isCorrectPitchPassword("Kyoto-in-May", password), true);
  assert.equal(isCorrectPitchPassword("  Kyoto-in-May  ", password), true);
  assert.equal(isCorrectPitchPassword("kyoto-in-may", password), false);
  assert.equal(isCorrectPitchPassword("Kyoto-in-Ma", password), false);
  assert.equal(isCorrectPitchPassword("", password), false);
});

test("the cookie is tied to the current password", () => {
  const token = pitchAccessToken("Kyoto-in-May");
  assert.match(token, /^[0-9a-f]{64}$/);
  assert.equal(hasPitchAccess(token, "Kyoto-in-May"), true);
  assert.equal(hasPitchAccess(token, "a-new-password"), false);
  assert.equal(hasPitchAccess(undefined, "Kyoto-in-May"), false);
  assert.equal(hasPitchAccess("", "Kyoto-in-May"), false);
  assert.equal(hasPitchAccess(`${token}0`, "Kyoto-in-May"), false);
  assert.equal(hasPitchAccess("Kyoto-in-May", "Kyoto-in-May"), false);
});

test("after the password the viewer only ever lands on a pitch page", () => {
  assert.equal(pitchNextPath("/pitch/v6"), "/pitch/v6");
  assert.equal(pitchNextPath("/pitch-vm2luya/en?x=1#12"), "/pitch-vm2luya/en?x=1#12");

  for (const value of [null, undefined, "", "/workspace", "https://example.com/pitch", "//example.com/pitch", "/\\example.com", "pitch"]) {
    assert.equal(pitchNextPath(value), PITCH_ACCESS_DEFAULT, String(value));
  }
});
