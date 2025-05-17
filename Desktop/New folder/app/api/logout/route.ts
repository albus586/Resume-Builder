import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Clear the session cookie
  (await cookies()).delete("token");

  return NextResponse.json({ message: "Logged out successfully" });
}
