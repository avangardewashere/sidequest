import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { currentLevelProgress } from "@/lib/xp";

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await UserModel.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const levelProgress = currentLevelProgress(user.totalXp);

  return NextResponse.json({
    profile: {
      email: user.email,
      displayName: user.displayName,
      totalXp: user.totalXp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      xpIntoLevel: levelProgress.xpIntoLevel,
      xpForNextLevel: levelProgress.xpForNextLevel,
    },
  });
}
