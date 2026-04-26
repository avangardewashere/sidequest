import { describe, expect, it } from "vitest";
import { FocusSessionModel } from "@/models/FocusSession";

describe("FocusSession model indexes", () => {
  it("declares required indexes on the schema", () => {
    const indexes = FocusSessionModel.schema.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        [{ userId: 1, startedAt: -1 }, {}],
        [
          { userId: 1, endedAt: 1 },
          { partialFilterExpression: { endedAt: null }, unique: true },
        ],
      ]),
    );
  });
});
