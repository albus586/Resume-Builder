import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db("resume-builder");

    // Find user
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user's profile
    const profile = await db
      .collection("profiles")
      .findOne({ userId: user._id.toString() });
    if (!profile) {
      // Create profile if it doesn't exist (fallback for existing users)
      await db.collection("profiles").insertOne({
        userId: user._id.toString(),
        email,
        name: "",
        contact: {
          email: email,
        },
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "1h" }
    );

    // Create response with token and user information for localStorage
    const response = NextResponse.json({
      token: token, // Include token in the response
      userId: user._id,
      email: user.email, // Include email in the response
      profile: profile || { userId: user._id.toString(), email },
    });

    // Set HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
