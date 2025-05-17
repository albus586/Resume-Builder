"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Mic,
  Send,
  MicOff,
  FileText,
  Edit,
} from "lucide-react";
import Image from "next/image";

// Import react-pdf components with dynamic import to avoid SSR issues
import dynamic from "next/dynamic";

// Import CSS required for PDF rendering
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Dynamic import of react-pdf components to avoid SSR issues
const PDFViewer = dynamic(
  () => import("../../components/pdf-viewer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  }
);

// Update the ChatMessage type
type ChatMessage = {
  isUser: boolean;
  text: string;
  timestamp: Date;
  image?: string; // Add image support
};

type LoadingState = {
  status: boolean;
  message: string;
};

// Update component to check for selected PDF content
export default function GeneratedResumePage() {
  // PDF viewer state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [currentPdfSource, setCurrentPdfSource] =
    useState<string>("/sample-resume.pdf");
  const [pdfDebugError, setPdfDebugError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [latexCode, setLatexCode] = useState<string | null>(null);

  // Chat state
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      isUser: false,
      text: "Hi there! I'm your resume assistant. How can I help you with your resume today?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState<LoadingState>({
    status: false,
    message: "",
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add state for position
  const [resumePosition, setResumePosition] = useState<string>(
    "Professional Resume"
  );

  // Load PDF data from localStorage when component mounts
  useEffect(() => {
    const loadResumeData = () => {
      try {
        // Get PDF and LaTeX data from localStorage
        const pdfData = localStorage.getItem("generatedResumePDF");
        const latexCode = localStorage.getItem("generatedResumeLatex");

        // Try to get the position from localStorage too
        const position = localStorage.getItem("resumePosition");
        if (position) {
          setResumePosition(position);
        }

        if (pdfData) {
          setPdfData(pdfData);
          // Create a data URL from base64-encoded PDF
          setCurrentPdfSource(`data:application/pdf;base64,${pdfData}`);
        }

        if (latexCode) {
          setLatexCode(latexCode);
        }
      } catch (error) {
        console.error("Error loading resume data:", error);
        setPdfDebugError(
          "Failed to load the generated resume. Please try again."
        );
      }
    };

    loadResumeData();
  }, []);

  // Modify the useEffect for better scroll handling
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [chatMessages]);

  const toggleMicrophone = () => {
    setIsRecording(!isRecording);
    // Microphone functionality would be implemented here
  };

  // Add new state for image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add function to handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add download functionality for the PDF
  const handleDownloadPDF = () => {
    if (pdfData) {
      const linkSource = `data:application/pdf;base64,${pdfData}`;
      const downloadLink = document.createElement("a");
      const fileName = "generated-resume.pdf";

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  // Replace handleSaveResume to include position and calculate ATS score
  const handleSaveResume = async () => {
    if (pdfData && latexCode) {
      try {
        setLoading({
          status: true,
          message: "Calculating ATS score and saving resume...",
        });

        // Get job position details from localStorage or use current position
        const jobTitle = localStorage.getItem("resumeRole") || resumePosition;
        const jobDescription =
          localStorage.getItem("resumeDescription") ||
          "No description available";
        const keySkills =
          localStorage.getItem("resumeSkills") || "No specific skills required";

        // Create a formatted job description text for the ATS template
        const formattedJobDescription = `
Job Title: ${jobTitle}
Role: ${resumePosition}
Description: ${jobDescription}
Responsibilities: ${jobDescription}
        `;

        console.log("Sending ATS score request with formatted job description");

        // Send request to calculate ATS score
        const atsResponse = await fetch(
          "https://resume-builder-backend-362387414228.asia-south1.run.app/calculate-ats-score",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job_details: formattedJobDescription, // Send as a formatted string
              latexCode: latexCode,
            }),
          }
        );

        // Get ATS score data
        let atsScore = null;
        if (atsResponse.ok) {
          const atsData = await atsResponse.json();
          console.log("Received ATS score data:", atsData);
          if (atsData.status === "success") {
            // Store the raw ATS score for transformation
            const rawScore = atsData.ats_score;

            // Format the ATS score according to the schema expected by the database
            // The backend returns numbers, but our schema expects arrays
            atsScore = {
              total_score:
                typeof rawScore.total_score === "number"
                  ? rawScore.total_score
                  : 0,
              keyword_match:
                typeof rawScore.keyword_match === "number"
                  ? rawScore.keyword_match
                  : 0,
              work_experience:
                typeof rawScore.work_experience === "number"
                  ? rawScore.work_experience
                  : 0,
              technical_skills:
                typeof rawScore.technical_skills === "number"
                  ? rawScore.technical_skills
                  : 0,
              education_certifications:
                typeof rawScore.education_certifications === "number"
                  ? rawScore.education_certifications
                  : 0,
              projects_achievements:
                typeof rawScore.projects_achievements === "number"
                  ? rawScore.projects_achievements
                  : 0,
              soft_skills_summary:
                typeof rawScore.soft_skills_summary === "number"
                  ? rawScore.soft_skills_summary
                  : 0,
            };

            console.log("Formatted ATS score for database:", atsScore);
          } else {
            console.error("ATS score calculation error:", atsData.error);
          }
        } else {
          console.error(
            "ATS score request failed with status:",
            atsResponse.status
          );
          try {
            const errorData = await atsResponse.json();
            console.error("Error details:", errorData);
          } catch (e) {
            console.error("Could not parse error response");
          }
        }

        // Create a new resume object with unique ID and current time
        const savedResume = {
          id: Date.now(),
          position: resumePosition,
          atsScore: atsScore?.total_score?.[0] || 92, // Use the total score or fallback to 92
          date: `Saved on ${new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
          pdfData: pdfData,
          latexCode: latexCode,
          atsScoreDetails: atsScore,
        };

        // Get existing saved resumes or start with empty array
        let existingResumes = [];
        const savedResumesString = localStorage.getItem("savedResumes");

        if (savedResumesString) {
          try {
            existingResumes = JSON.parse(savedResumesString);
          } catch (e) {
            console.error("Error parsing saved resumes:", e);
          }
        }

        // Check if there's an existing resume with the same position
        const existingResumeIndex = existingResumes.findIndex(
          (resume: any) => resume.position === resumePosition
        );

        // Add or update the resume in the array
        if (existingResumeIndex !== -1) {
          // Replace the existing resume
          existingResumes[existingResumeIndex] = savedResume;
        } else {
          // Add as a new resume at the beginning
          existingResumes = [savedResume, ...existingResumes];
        }

        // Save back to localStorage
        localStorage.setItem("savedResumes", JSON.stringify(existingResumes));

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
          console.log("Saving resume to database with ATS score:", atsScore);

          // Ensure all required fields have valid values for form validation
          const validFormData = {
            title: resumePosition || "Professional Resume",
            role: jobTitle || "Professional Role",
            jobDescription: jobDescription || "No description available",
            keySkills: keySkills || "No specific skills required",
          };

          console.log("Form data being sent:", validFormData);

          const saveResponse = await fetch("/api/resume", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              formData: validFormData,
              pdfData: pdfData,
              latexCode: latexCode,
              atsScore: atsScore,
              userEmail: userEmail,
              updateExisting: true, // Flag to indicate we want to update existing resume if there's one with same role
            }),
          });

          if (!saveResponse.ok) {
            console.warn("Resume saved locally but not to database");
            const errorResponse = await saveResponse.text();
            console.error("Database save error:", errorResponse);
          } else {
            const responseData = await saveResponse.json();
            console.log(
              `Resume ${
                responseData.updated ? "updated" : "saved"
              } successfully to database`
            );
          }
        } catch (saveError) {
          console.error("Error saving to database:", saveError);
          // Continue even if database save fails
        }

        // Add a confirmation message
        setChatMessages((prev) => [
          ...prev,
          {
            isUser: false,
            text: `I've ${
              existingResumeIndex !== -1 ? "updated" : "saved"
            } your ${resumePosition} resume! ATS Score: ${
              typeof atsScore?.total_score === "number"
                ? atsScore.total_score.toFixed(1)
                : "92"
            }%. You can view it in the 'View Resume' section.`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Error during ATS calculation or save:", error);
        setChatMessages((prev) => [
          ...prev,
          {
            isUser: false,
            text: "I've saved your resume, but there was an issue calculating the ATS score.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading({ status: false, message: "" });
      }
    }
  };

  // Add this helper function near the top of the component
  const preprocessText = (text: string): string => {
    // Remove trailing/leading whitespace and split into lines
    const lines = text.trim().split("\n");

    return lines
      .map((line) => {
        const trimmed = line.trim();

        // Handle section headers (text in all caps with line below)
        if (trimmed.match(/^\*\*[A-Z\s]+\*\*$/)) {
          return trimmed.replace(/\*\*/g, "") + "\n" + "─".repeat(30);
        }

        // Handle bold text (**text**)
        if (trimmed.includes("**")) {
          return trimmed.replace(/\*\*(.+?)\*\*/g, "$1");
        }

        // Handle bullet points
        if (trimmed.startsWith("*")) {
          return "• " + trimmed.substring(1).trim();
        }

        // Handle section headers with colons
        if (trimmed.includes(":")) {
          const [header, content] = trimmed.split(":");
          if (content) {
            return `${header.trim()}:\n${content.trim()}`;
          }
        }

        return line;
      })
      .filter((line) => line) // Remove empty lines
      .join("\n");
  };

  // Add effect to check for selected PDF content
  useEffect(() => {
    // Function to handle selection from localStorage
    const checkForSelectedContent = () => {
      try {
        const selectedImageData = localStorage.getItem("recent-pdf-selection");
        if (selectedImageData) {
          console.log("Found PDF selection in localStorage");
          setImagePreview(selectedImageData);
          // We don't use setSelectedImage since we have the data URL directly
        }
      } catch (error) {
        console.error("Error checking for PDF selection:", error);
      }
    };

    // Check immediately on mount
    checkForSelectedContent();

    // Custom event listener for when a new selection is made
    const handlePdfSelectionCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{ imageData: string }>;
      console.log("PDF selection event received");
      setImagePreview(customEvent.detail.imageData);
    };

    // Add event listener for custom event
    window.addEventListener("pdf-selection-created", handlePdfSelectionCreated);

    // Also set up a polling mechanism as backup
    const intervalId = setInterval(checkForSelectedContent, 1000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "pdf-selection-created",
        handlePdfSelectionCreated
      );
    };
  }, []);

  // Update handleSendMessage to extract position information if present
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !imagePreview) return;

    // Check if message contains position information
    if (
      inputMessage.toLowerCase().includes("position") ||
      inputMessage.toLowerCase().includes("job") ||
      inputMessage.toLowerCase().includes("role")
    ) {
      // Extract potential position information
      const positionMatch = inputMessage.match(
        /(?:for|as|position|job|role)(?:\s+(?:a|an|the))?\s+([^.,!?]+)/i
      );
      if (positionMatch && positionMatch[1]) {
        const extractedPosition = positionMatch[1].trim();
        if (extractedPosition.length > 3 && extractedPosition.length < 50) {
          setResumePosition(extractedPosition);
          localStorage.setItem("resumePosition", extractedPosition);
        }
      }
    }

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        isUser: true,
        text: inputMessage || "Sent an image",
        timestamp: new Date(),
        image: imagePreview || undefined,
      },
    ]);

    setLoading({
      status: true,
      message: imagePreview ? "Analyzing image..." : "Updating your resume...",
    });

    try {
      if (imagePreview) {
        console.log("Processing image from preview");

        // Convert base64 data URL to a Blob
        const imageBlob = await fetch(imagePreview).then((r) => r.blob());

        // Create a File object from the Blob
        const imageFile = new File([imageBlob], "selection.png", {
          type: "image/png",
        });

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("query", inputMessage || "Please analyze this image");

        console.log("Sending request to backend");
        const response = await fetch(
          "https://resume-builder-backend-362387414228.asia-south1.run.app/process",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          console.log("Successfully processed image");
          setChatMessages((prev) => [
            ...prev,
            {
              isUser: false,
              text: preprocessText(data.response),
              timestamp: new Date(),
            },
          ]);
        } else {
          throw new Error(data.error || "Failed to process image");
        }
      } else if (inputMessage.trim()) {
        // Handle text messages for resume modification
        const response = await fetch(
          "https://resume-builder-backend-362387414228.asia-south1.run.app/modify-resume",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: inputMessage,
              latexCode: latexCode,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          // Update PDF and LaTeX code
          setPdfData(data.pdf);
          setLatexCode(data.latex_code);
          setCurrentPdfSource(`data:application/pdf;base64,${data.pdf}`);

          // Store in localStorage
          localStorage.setItem("generatedResumePDF", data.pdf);
          localStorage.setItem("generatedResumeLatex", data.latex_code);

          // Add assistant response
          setChatMessages((prev) => [
            ...prev,
            {
              isUser: false,
              text: "I've updated your resume according to your request. You can see the changes in the preview.",
              timestamp: new Date(),
            },
          ]);
        } else {
          throw new Error(data.error || "Failed to modify resume");
        }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          isUser: false,
          text: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading({ status: false, message: "" });
      setInputMessage("");
      setSelectedImage(null);
      setImagePreview(null);
      localStorage.removeItem("recent-pdf-selection");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fix missing pagination handlers
  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#EEEEEE] flex flex-col">
        {/* Header */}
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] border-b px-4"
          style={{
            backgroundColor: "#EEEEEE",
            borderColor: "rgba(57, 62, 70, 0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" style={{ color: "#393E46" }} />
            <h1 className="text-xl font-semibold" style={{ color: "#393E46" }}>
              {resumePosition}
            </h1>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              className="border text-"
              style={{
                borderColor: "rgba(57, 62, 70, 0.2)",
                color: "#393E46",
              }}
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow overflow-hidden py-4 px-4">
          {/* Updated grid layout: 70% for PDF, 30% for chat */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-6 h-full">
            {/* PDF Preview */}
            <div
              className="md:col-span-7 bg-white p-6 rounded-lg shadow-md border flex flex-col h-[calc(100vh-6rem)]"
              style={{ borderColor: "rgba(57, 62, 70, 0.1)" }}
            >
              <h2 className="text-xl font-bold mb-4 text-[#393E46] flex items-center justify-between">
                <span>Resume Preview</span>
                <span className="text-xs font-normal ml-2 text-green-500 bg-green-50 px-2 py-0.5 rounded">
                  Generated PDF
                </span>
              </h2>
              <div className="flex-grow overflow-hidden flex flex-col">
                <div className="relative flex-grow overflow-auto bg-gray-100 rounded-md flex items-center justify-center">
                  {isPdfLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
                      <div className="animate-spin h-8 w-8 border-4 border-[#00ADB5] border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <PDFViewer
                    file={currentPdfSource}
                    pageNumber={pageNumber}
                    onLoadSuccess={(numPages) => {
                      setNumPages(numPages);
                      setIsPdfLoading(false);
                    }}
                    onError={(error) => {
                      console.error("PDF error:", error);
                      setPdfDebugError(error.message);
                      setIsPdfLoading(false);
                    }}
                  />
                  {/* debug error display */}
                  {pdfDebugError && (
                    <div className="absolute inset-0 p-4 bg-red-50 text-red-700 text-sm overflow-auto">
                      <strong>PDF Error:</strong>
                      <pre className="whitespace-pre-wrap">{pdfDebugError}</pre>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageNumber <= 1 || !numPages}
                    onClick={handlePreviousPage} // Use the handler
                    className="text-xs border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/5"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-[#393E46]">
                    {!numPages ? "..." : `Page ${pageNumber} of ${numPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!numPages || pageNumber >= numPages}
                    onClick={handleNextPage}
                    className="text-xs border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/5"
                  >
                    Next
                  </Button>
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <Button
                    style={{ backgroundColor: "#00ADB5", color: "white" }}
                    disabled={!pdfData}
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>

                  <Button
                    variant="outline"
                    style={{
                      borderColor: "rgba(57, 62, 70, 0.2)",
                      color: "#393E46",
                    }}
                    onClick={handleSaveResume}
                    disabled={!latexCode || !pdfData}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Save Resume
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Interface (30% width) - reduced from 2/5 to 3/10 columns */}
            <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md border border-[#393E46]/10 flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
              <h2 className="text-xl font-bold mb-4 text-[#393E46] flex-shrink-0">
                Resume Assistant
              </h2>
              <div className="flex-1 min-h-0 flex flex-col">
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#00ADB5]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#00ADB5]/30"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[90%] p-3 rounded-lg break-words ${
                          msg.isUser
                            ? "bg-[#00ADB5] text-white rounded-tr-none"
                            : "bg-[#EEEEEE] text-[#393E46] rounded-tl-none"
                        }`}
                      >
                        {msg.image && (
                          <div className="mb-2">
                            {/* Replace <img> with Next.js <Image> component for optimized images */}
                            <Image
                              src={msg.image}
                              alt="Uploaded content"
                              width={300}
                              height={200}
                              className="max-w-full rounded-lg"
                              style={{
                                maxHeight: "200px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        )}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.text.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                              {line.startsWith("─") ? (
                                <hr className="my-2 border-[#393E46]/20" />
                              ) : line.startsWith("•") ? (
                                <div className="ml-2 mb-1">{line}</div>
                              ) : (
                                <div
                                  className={
                                    line.match(/^[A-Z\s]+$/)
                                      ? "font-bold text-lg mt-3 mb-1"
                                      : line.includes(":")
                                      ? "font-semibold mt-2"
                                      : "mb-1"
                                  }
                                >
                                  {line}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="text-xs mt-1 opacity-70">
                          {msg.timestamp
                            .toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              hourCycle: "h12",
                            })
                            .toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {loading.status && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%] p-4 rounded-lg bg-[#EEEEEE] text-[#393E46] rounded-tl-none">
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-[#00ADB5] rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-[#393E46]/70">
                            {loading.message}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    {imagePreview && (
                      <div className="relative w-full mb-2 border border-gray-300 rounded-lg p-1 bg-white">
                        <Image
                          src={imagePreview}
                          alt="PDF Selection Preview"
                          width={300}
                          height={200}
                          className="w-full max-h-32 object-contain rounded-lg"
                          unoptimized // Add this since the source is a data URL
                          onError={(e) =>
                            console.error("Error loading image preview:", e)
                          }
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                            localStorage.removeItem("recent-pdf-selection");
                            console.log("Manually cleared PDF selection");
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer p-2 rounded-full border border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/5"
                      >
                        <FileText className="h-4 w-4" />
                      </label>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={toggleMicrophone}
                        className={`rounded-full ${
                          isRecording
                            ? "bg-[#00ADB5]/10 text-[#00ADB5] border-[#00ADB5]"
                            : "border-[#393E46]/20 text-[#393E46]"
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-grow relative">
                        <textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-full px-3 py-2 text-sm border border-[#393E46]/20 rounded-md focus:outline-none focus:border-[#00ADB5] resize-none"
                          placeholder="Type your message..."
                          rows={1}
                          style={{ maxHeight: "120px", minHeight: "40px" }}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() && !selectedImage}
                        className="bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-white rounded-full aspect-square p-2"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
