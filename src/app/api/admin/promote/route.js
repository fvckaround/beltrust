import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email } = body;

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  if (user.role === "admin") {
    return NextResponse.json({ error: "This user is already an admin" }, { status: 400 });
  }

  user.role = "admin";
  await user.save();

  return NextResponse.json({ message: `${user.email} promoted to admin`, user: { email: user.email } });
}