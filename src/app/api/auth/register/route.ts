import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

const registerSchema = z.object({
  email: z.string().email(),
  displayName: z.string().trim().min(2).max(32),
  password: z.string().min(6).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectToDatabase();
  const existingUser = await UserModel.findOne({ email: parsed.data.email });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    await UserModel.create({
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      passwordHash,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    console.error("Register user creation failed", error);
    return NextResponse.json({ error: "Unable to register user" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
