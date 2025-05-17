"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeUpload } from "@/components/resume-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Profile } from "@/schema/profile";
import { toast } from "sonner"; // Import toast from sonner

// Define a type for resume data
interface ResumeData {
  [key: string]: unknown;
}

export function ResumeCardContainer() {
  const router = useRouter();
  const { open, isMobile } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    role: "",
    jobDescription: "",
    keySkills: "",
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    role: false,
    jobDescription: false,
    keySkills: false,
  });
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [profileImported, setProfileImported] = useState(false);

  // Calculate offset for centering
  const offsetClass =
    open && !isMobile
      ? "ml" // Offset when sidebar is open
      : isMobile
      ? ""
      : "ml-6"; // Offset when sidebar is collapsed

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id === "job-description"
        ? "jobDescription"
        : id === "key-skills"
        ? "keySkills"
        : id]: value,
    });

    // Clear error when user types in a required field
    if (
      id === "title" ||
      id === "role" ||
      id === "job-description" ||
      id === "key-skills"
    ) {
      setFormErrors({
        ...formErrors,
        [id === "job-description"
          ? "jobDescription"
          : id === "key-skills"
          ? "keySkills"
          : id]: false,
      });
    }
  };

  const validateForm = () => {
    const errors = {
      title: !formData.title.trim(),
      role: !formData.role.trim(),
      jobDescription: !formData.jobDescription.trim(),
      keySkills: !formData.keySkills.trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some((hasError) => hasError);
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.role.trim() !== "" &&
      formData.jobDescription.trim() !== "" &&
      formData.keySkills.trim() !== "" &&
      // Require at least one of resume or profile data
      (resumeData !== null || profileData !== null)
    );
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://resume-builder-backend-362387414228.asia-south1.run.app/api/upload-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Resume upload failed");
      }

      const data = await response.json();
      setResumeData(data);
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume. Please try again.");
    }
  };

  const handleProfileFetch = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Profile fetch failed");
      }

      const data = await response.json();
      setProfileData(data);
      setProfileImported(true);
      toast.success("Successfully imported details from profile!");
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to import profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    if (!resumeData && !profileData) {
      toast.error("Please either upload a resume or import your profile.");
      return;
    }

    setLoading(true);

    try {
      // Convert form data to jobDetails JSON format
      const jobDetails = {
        job_role: formData.role,
        job_title: formData.title,
        job_description: formData.jobDescription,
        responsibilities: formData.keySkills,
      };

      // Combine data objects into the required format
      // Now we don't require both to be present
      const combinedData = {
        jobDetails: jobDetails,
        resume: resumeData || {}, // Provide empty object if not available
        profile: profileData || {}, // Provide empty object if not available
      };

      console.log("Sending data to generate_resume:", combinedData);

      const response = await fetch(
        "https://resume-builder-backend-362387414228.asia-south1.run.app/generate_resume",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(combinedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Resume generation failed");
      }

      const data = await response.json();

      // Store the PDF data and LaTeX code in localStorage
      localStorage.setItem("generatedResumePDF", data.pdf);
      localStorage.setItem("generatedResumeLatex", data.latex_code);

      // Get token from localStorage (if user is logged in)
      const token = localStorage.getItem("token");

      // Try to get user email from session storage or localStorage
      let userEmail = null;
      try {
        // Try to get user information from localStorage if available
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          userEmail = user.email;
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }

      // Also save to MongoDB database
      try {
        const saveResponse = await fetch("/api/resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            formData: {
              title: formData.title,
              role: formData.role,
              jobDescription: formData.jobDescription,
              keySkills: formData.keySkills,
            },
            pdfData: data.pdf,
            latexCode: data.latex_code,
            userEmail: userEmail, // Pass the email instead of userId
          }),
        });

        if (!saveResponse.ok) {
          console.warn("Resume Generated locally but not to database");
        } else {
          toast.success("Resume Generated successfully!");
        }
      } catch (saveError) {
        console.error("Error saving to database:", saveError);
        // Continue even if database save fails
      }

      // Navigate to the generated resume page
      router.push("/generated-resume");
    } catch (error: unknown) {
      console.error("Error during resume generation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error generating resume";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center min-h-screen p-4 ${offsetClass} transition-all duration-300`}
    >
      <Card className="w-full max-w-4xl shadow-lg border-0 bg-white dark:bg-[#222831] backdrop-blur-sm">
        <CardHeader className="p-6 pb-2 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-[#00ADB5]" />
            <div>
              <CardTitle className="text-2xl font-bold text-[#393E46]">
                Resume Builder
              </CardTitle>
              <CardDescription className="text-[#393E46]/70 mt-1">
                Create a professional resume tailored to your target role
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First row */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium flex items-center text-[#393E46]"
              >
                <span>Professional Title</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                id="title"
                placeholder="e.g. Senior Software Engineer"
                className={`border border-[#00ADB5]/40 focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] transition-all ${
                  formErrors.title ? "border-red-500" : ""
                }`}
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium flex items-center text-[#393E46]"
              >
                <span>Target Role</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                id="role"
                placeholder="e.g. Full Stack Developer"
                className={`border border-[#00ADB5]/40 focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] transition-all ${
                  formErrors.role ? "border-red-500" : ""
                }`}
                value={formData.role}
                onChange={handleInputChange}
              />
            </div>

            {/* Second row - Job description as textarea */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="job-description"
                className="text-sm font-medium flex items-center text-[#393E46]"
              >
                <span>Job Description</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here to optimize your resume"
                className={`border border-[#00ADB5]/40 h-24 focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] transition-all ${
                  formErrors.jobDescription ? "border-red-500" : ""
                }`}
                value={formData.jobDescription}
                onChange={handleInputChange}
              />
              {formErrors.jobDescription && (
                <p className="text-sm text-red-500">
                  Job Description is required
                </p>
              )}
            </div>

            {/* Third row */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="key-skills"
                className="text-sm font-medium flex items-center text-[#393E46]"
              >
                <span>Key Skills & Responsibilities</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Textarea
                id="key-skills"
                placeholder="List your key skills and responsibilities relevant to this role"
                className={`border border-[#00ADB5]/40 h-24 focus:ring-2 focus:ring-[#00ADB5] focus:border-[#00ADB5] transition-all ${
                  formErrors.keySkills ? "border-red-500" : ""
                }`}
                value={formData.keySkills}
                onChange={handleInputChange}
              />
              {formErrors.keySkills && (
                <p className="text-sm text-red-500">
                  Key Skills & Responsibilities is required
                </p>
              )}
            </div>

            {/* Resume Upload and Profile Fetch in same grid with consistent height */}
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-sm font-medium text-[#393E46] flex items-center">
                <span>Upload Existing Resume</span>
                <span className="text-gray-500 ml-2 text-xs">(Optional)</span>
                {resumeData && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                )}
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 transition-all flex-1 flex items-center ${
                  resumeData
                    ? "border-green-500 bg-green-50"
                    : "border-[#00ADB5]/40 hover:border-[#00ADB5]"
                }`}
              >
                <ResumeUpload onFileUpload={handleFileUpload} />
              </div>
            </div>
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-sm font-medium text-[#393E46] flex items-center">
                <span>Profile Information</span>
                <span className="text-gray-500 ml-2 text-xs">(Optional)</span>
                {profileImported && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                )}
              </label>
              <Button
                variant="outline"
                className={`w-full flex-1 border-2 transition-all flex items-center justify-center ${
                  profileImported
                    ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-[#00ADB5]/40 hover:border-[#00ADB5] hover:bg-[#00ADB5]/5"
                }`}
                onClick={handleProfileFetch}
                disabled={loading && !profileImported}
              >
                {profileImported ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    <span className="text-green-700">Profile Imported</span>
                  </>
                ) : (
                  <>
                    <UserCircle className="mr-2 h-5 w-5 text-[#00ADB5]" />
                    <span className="text-[#393E46]">Import From Profile</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-2 flex flex-col sm:flex-row gap-3 rounded-b-lg">
          <Button
            className="w-full sm:w-auto bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white font-medium py-3 px-8 order-1 sm:order-2 shadow-md hover:shadow-lg transition-all flex items-center justify-center text-base"
            onClick={handleGenerate}
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Resume
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
