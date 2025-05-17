// app/api/resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ResumeFormSchema } from "@/schema/resume";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract auth token from headers
    const headersList = await headers();
    const authHeader = headersList.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    // Get user email from token if it exists
    const userEmail = token
      ? getUserEmailFromToken(token)
      : body.userEmail || null;

    // Validate form data
    const validatedFormData = ResumeFormSchema.parse(body.formData);

    // Check if the request includes an updateMode flag
    const updateExisting = body.updateExisting || false;
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Create document to be saved/updated (always include createdAt to avoid TypeScript errors)
    const resumeDocument = {
      formData: validatedFormData,
      pdfData: body.pdfData,
      latexCode: body.latexCode,
      atsScore: body.atsScore || null,
      createdAt: new Date(), // Include this for both cases to avoid TypeScript errors
      updatedAt: new Date(),
      userEmail: userEmail,
    };

    // Check if the user already has a resume for this role
    const existingResume = await db.collection("resumes").findOne({
      userEmail: userEmail,
      "formData.role": validatedFormData.role,
    });

    let result;
    
    if (existingResume && updateExisting) {
      // Update the existing resume
      result = await db.collection("resumes").updateOne(
        { _id: new ObjectId(existingResume._id) },
        { 
          $set: {
            formData: resumeDocument.formData,
            pdfData: resumeDocument.pdfData,
            latexCode: resumeDocument.latexCode,
            atsScore: resumeDocument.atsScore,
            updatedAt: resumeDocument.updatedAt,
            userEmail: resumeDocument.userEmail,
          } 
        }
      );
      
      return NextResponse.json(
        {
          success: true,
          message: "Resume updated successfully",
          resumeId: existingResume._id,
          updated: true,
        },
        { status: 200 }
      );
    } else {
      // Insert as a new resume
      result = await db.collection("resumes").insertOne(resumeDocument);
      
      return NextResponse.json(
        {
          success: true,
          message: "Resume data saved successfully",
          resumeId: result.insertedId,
          updated: false,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error saving resume data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save resume data",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract auth token from headers
    const headersList = await headers();
    const authHeader = headersList.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    // Get user email from token or query params
    const providedEmail = request.nextUrl.searchParams.get("email");
    const tokenEmail = token ? getUserEmailFromToken(token) : null;

    // Use either the email from token or from query params
    const userEmail = tokenEmail || providedEmail;

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Only return resumes for the authenticated user
    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "User email is required",
        },
        { status: 400 }
      );
    }

    const resumes = await db
      .collection("resumes")
      .find({ userEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      resumes,
    });
  } catch (error: any) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch resumes",
      },
      { status: 500 }
    );
  }
}
