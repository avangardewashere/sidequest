import { connectToDatabase } from "@/lib/db";
import {
  backfillCompletionDates,
  countCompletionDateGaps,
  swapCompletionLogUniqueIndexes,
} from "@/lib/migrations/completion-date-migration";

async function run() {
  await connectToDatabase();

  const before = await countCompletionDateGaps();
  console.log(`[7.3] completionDate gaps before backfill: ${before}`);

  const updated = await backfillCompletionDates();
  console.log(`[7.3] completionDate backfilled documents: ${updated}`);

  const after = await countCompletionDateGaps();
  console.log(`[7.3] completionDate gaps after backfill: ${after}`);

  if (after > 0) {
    throw new Error(`Backfill incomplete; ${after} completion logs still missing completionDate.`);
  }

  await swapCompletionLogUniqueIndexes();
  console.log("[7.3] completion log index swap complete.");
}

run()
  .then(() => {
    console.log("[7.3] migration finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[7.3] migration failed.", error);
    process.exit(1);
  });
