import { z } from "zod";

export const onboardingFocusAreaSchema = z.enum(["work", "health", "learning", "life"]);
export const onboardingEncouragementStyleSchema = z.enum(["gentle", "direct", "celebration"]);
export const onboardingWeeklyTargetSchema = z.number().int().min(1).max(21);

export const onboardingPreferencesSchema = z.object({
  focusArea: onboardingFocusAreaSchema,
  weeklyTarget: onboardingWeeklyTargetSchema,
  encouragementStyle: onboardingEncouragementStyleSchema,
});

export const onboardingCompletionSchema = onboardingPreferencesSchema.extend({
  complete: z.literal(true),
});

export function toOnboardingPayload(user: {
  onboardingCompletedAt?: Date | null;
  onboardingFocusArea?: string | null;
  onboardingWeeklyTarget?: number | null;
  onboardingEncouragementStyle?: string | null;
}) {
  return {
    completed: Boolean(user.onboardingCompletedAt),
    completedAt: user.onboardingCompletedAt ? user.onboardingCompletedAt.toISOString() : null,
    focusArea: user.onboardingFocusArea ?? null,
    weeklyTarget: user.onboardingWeeklyTarget ?? null,
    encouragementStyle: user.onboardingEncouragementStyle ?? null,
  };
}
