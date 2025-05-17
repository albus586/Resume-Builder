import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// Use "request" with "void" to explicitly show we're ignoring it
export async function GET(request: Request): Promise<NextResponse> {
  // Use void to explicitly mark the parameter as intentionally unused
  void request;

  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("resume-builder");

    // Get profile data
    const profile = await db.collection("profiles").findOne({ userId });

    // Fetch user data from users collection to get the name
    const userData = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { name: 1, email: 1, profilePhotoUrl: 1 } }
      );

    // Merge user data with profile data
    const combinedData = {
      ...(profile || { userId }),
      // Use user's name from the users collection if available
      name: userData?.name || profile?.name || "User",
      email: userData?.email || profile?.email,
      profilePhotoUrl: userData?.profilePhotoUrl || profile?.profilePhotoUrl,
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("resume-builder");
    const data = await request.json();

    // Explicitly mark _id as intentionally unused with void
    const { _id, ...dataWithoutId } = data;
    void _id; // This explicitly acknowledges we're not using _id

    // Remove any undefined or null values to allow partial updates
    Object.keys(dataWithoutId).forEach((key) => {
      if (dataWithoutId[key] === undefined || dataWithoutId[key] === null) {
        delete dataWithoutId[key];
      }
    });

    // Ensure userId is set
    dataWithoutId.userId = userId;

    // Use findOneAndUpdate to both update and return the document in one operation
    const result = await db.collection("profiles").findOneAndUpdate(
      { userId },
      { $set: dataWithoutId },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
