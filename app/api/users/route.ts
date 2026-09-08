import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Parollarni qaytarmaslik uchun select
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
