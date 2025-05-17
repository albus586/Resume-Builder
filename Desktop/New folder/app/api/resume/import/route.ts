// app/api/resume/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { headers } from "next/headers";

// Helper function to extract user email from token
function getUserEmailFromToken(token: string): string | null {
  try {
    // Split the token and decode the payload
    const payload = token.split(".")[1];
    if (!payload) return null;

    // Base64 decode the payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64").toString()
    );
    return decodedPayload.email || null;
  } catch (error) {
    console.error("Error extracting user email from token:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumes } = body;

    // Validate input
    if (!Array.isArray(resumes) || resumes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or empty resumes array",
        },
        { status: 400 }
      );
    }

    // Extract auth token from headers
    const headersList = await headers();
    const authHeader = headersList.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    // Get user email from token
    const userEmail = token ? getUserEmailFromToken(token) : null;

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to import resumes",
        },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Format resumes for database insertion
    const resumesToInsert = resumes.map((resume) => ({
      ...resume,
      userEmail, // Store email instead of userId
      importedFromLocalStorage: true,
      createdAt: new Date(resume.createdAt || Date.now()),
      updatedAt: new Date(),
    }));

    // Insert all resumes
    const result = await db.collection("resumes").insertMany(resumesToInsert);

    return NextResponse.json(
      {
        success: true,
        message: `${result.insertedCount} resumes imported successfully`,
        insertedIds: result.insertedIds,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error importing resumes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to import resumes",
      },
      { status: 500 }
    );
  }
}
