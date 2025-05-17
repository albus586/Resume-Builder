// app/api/resume/ats-score/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

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

export async function GET(request: NextRequest) {
  try {
    // Extract auth token from headers
    const headersList = await headers();
    const authHeader = headersList.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    // Get user email from token or query params (prioritize token)
    const providedEmail = request.nextUrl.searchParams.get("email");
    const resumeId = request.nextUrl.searchParams.get("resumeId");
    const tokenEmail = token ? getUserEmailFromToken(token) : null;

    // Use either the email from token or from query params
    const userEmail = tokenEmail || providedEmail;

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Only proceed if we have a valid userEmail
    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "User email is required",
        },
        { status: 400 }
      );
    }

    // Set up the query - filter by both email and resumeId if available
    const query: any = { userEmail: userEmail };
    if (resumeId) {
      // If resumeId is provided, add it to the query to get specific resume's score
      try {
        query._id = new ObjectId(resumeId);
      } catch (err) {
        console.error("Invalid ObjectId format:", err);
        // If the ID isn't a valid ObjectId, just use it as is (though this likely won't match anything)
        query._id = resumeId;
      }
    }

    console.log("Database query:", query);

    // Find the resume with the given ID and email
    const resume = await db.collection("resumes").findOne(query);

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume not found",
        },
        { status: 404 }
      );
    }

    console.log("Resume found:", resume._id, "ATS Score:", resume.atsScore);

    // Return the ATS score details - make sure we convert it to the expected format
    // Since your database stores it as direct numbers, not arrays
    return NextResponse.json({
      success: true,
      atsScore: {
        total_score: resume.atsScore?.total_score || 0,
        keyword_match: resume.atsScore?.keyword_match || 0,
        work_experience: resume.atsScore?.work_experience || 0,
        technical_skills: resume.atsScore?.technical_skills || 0,
        education_certifications:
          resume.atsScore?.education_certifications || 0,
        projects_achievements: resume.atsScore?.projects_achievements || 0,
        soft_skills_summary: resume.atsScore?.soft_skills_summary || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching ATS score:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch ATS score",
      },
      { status: 500 }
    );
  }
}
