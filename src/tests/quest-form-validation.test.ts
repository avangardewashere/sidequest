import { describe, expect, it } from "vitest";
import {
  MAX_NOTE_BODY_LEN,
  validateCadence,
  validateNoteBody,
  validateQuestTitleDescription,
  validateTags,
} from "@/lib/quest-form-validation";

describe("validateCadence", () => {
  it("accepts oneoff and daily without days", () => {
    expect(validateCadence({ kind: "oneoff" })).toBeNull();
    expect(validateCadence({ kind: "daily" })).toBeNull();
  });

  it("requires days for weekdays", () => {
    expect(validateCadence({ kind: "weekdays" })).toMatch(/day/i);
    expect(validateCadence({ kind: "weekdays", daysOfWeek: [1, 2] })).toBeNull();
  });

  it("requires everyNDays for custom", () => {
    expect(validateCadence({ kind: "custom", daysOfWeek: [1], everyNDays: undefined as unknown as number })).toMatch(
      /interval/i,
    );
    expect(validateCadence({ kind: "custom", daysOfWeek: [1], everyNDays: 2 })).toBeNull();
  });
});

describe("validateTags", () => {
  it("rejects more than 8 tags", () => {
    const tags = Array.from({ length: 9 }, (_, i) => `t${i}`);
    expect(validateTags(tags)).toMatch(/8/);
  });

  it("rejects tags longer than 32 chars", () => {
    expect(validateTags(["a".repeat(33)])).toMatch(/32/);
  });

  it("accepts a valid short list", () => {
    expect(validateTags(["work", "home"])).toBeNull();
  });
});

describe("validateNoteBody", () => {
  it("allows empty when optional", () => {
    expect(validateNoteBody("   ", true)).toBeNull();
  });

  it("rejects HTML", () => {
    expect(validateNoteBody("hello <b>x</b>", false)).toMatch(/HTML/i);
  });

  it("rejects over max length", () => {
    expect(validateNoteBody("x".repeat(MAX_NOTE_BODY_LEN + 1), false)).toMatch(/4096/);
  });
});

describe("validateQuestTitleDescription", () => {
  it("requires non-empty fields", () => {
    expect(validateQuestTitleDescription("", "d")).toMatch(/Title/);
    expect(validateQuestTitleDescription("t", "")).toMatch(/Description/);
  });

  it("accepts trimmed valid input", () => {
    expect(validateQuestTitleDescription("  Title  ", "Desc")).toBeNull();
  });
});
