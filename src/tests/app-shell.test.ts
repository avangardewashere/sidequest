import { describe, expect, it } from "vitest";
import { appShellTitle, shouldHideCaptureFab } from "@/lib/app-shell";

describe("appShellTitle", () => {
  it("maps primary routes", () => {
    expect(appShellTitle("/")).toBe("Today");
    expect(appShellTitle("/quests/view")).toBe("Quests");
    expect(appShellTitle("/quests/create")).toBe("Create quest");
    expect(appShellTitle("/stats")).toBe("Stats");
    expect(appShellTitle("/you")).toBe("You");
  });

  it("detects edit and detail quest paths", () => {
    expect(appShellTitle("/quests/507f1f77bcf86cd799439011/edit")).toBe("Edit quest");
    expect(appShellTitle("/quests/507f1f77bcf86cd799439011")).toBe("Quest");
  });
});

describe("shouldHideCaptureFab", () => {
  it("hides on onboarding and quest detail", () => {
    expect(shouldHideCaptureFab("/onboarding")).toBe(true);
    expect(shouldHideCaptureFab("/quests/507f1f77bcf86cd799439011")).toBe(true);
  });

  it("shows on list, create, and edit", () => {
    expect(shouldHideCaptureFab("/quests/view")).toBe(false);
    expect(shouldHideCaptureFab("/quests/create")).toBe(false);
    expect(shouldHideCaptureFab("/quests/507f1f77bcf86cd799439011/edit")).toBe(false);
    expect(shouldHideCaptureFab("/")).toBe(false);
  });
});
