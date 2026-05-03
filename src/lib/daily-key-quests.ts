/**
 * UTC daily-key quests (generated “dailies” rollups). Matches cadence-first docs and legacy `isDaily` rows.
 */
export const DAILY_KEY_QUEST_MATCH: {
  $or: Array<{ "cadence.kind": "daily" } | { isDaily: true }>;
} = {
  $or: [{ "cadence.kind": "daily" }, { isDaily: true }],
};
