"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  Share2,
  ArrowLeft,
  Plus,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Import for modal components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Dynamic import for PDF components
import dynamic from "next/dynamic";

// Import CSS required for PDF rendering
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

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

// Type definition for resume
type Resume = {
  _id?: string; // MongoDB ID
  id?: number;
  position?: string;
  formData?: any;
  atsScore?: number;
  createdAt?: string;
  date?: string;
  pdfData?: string;
  latexCode?: string;
  userEmail?: string;
  atsScoreDetails?: {
    total_score?: number[];
    keyword_match?: number[];
    work_experience?: number[];
    technical_skills?: number[];
    education_certifications?: number[];
    projects_achievements?: number[];
    soft_skills_summary?: number[];
  };
};

export default function ViewResume() {
  // State for modals
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [shareLink, setShareLink] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resumes from the API instead of localStorage
  useEffect(() => {
    async function fetchResumes() {
      try {
        setIsLoading(true);
        setError(null);

        // Get the authentication token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You must be logged in to view your resumes");
          setIsLoading(false);
          return;
        }

        // Fetch resumes from the API
        const response = await fetch("/api/resume", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch resumes: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          console.log("API response data:", data.resumes);

          // Log the detailed structure of the first resume's ATS score for debugging
          if (data.resumes.length > 0) {
            console.log(
              "First resume ATS score data:",
              data.resumes[0].atsScore
            );
            console.log("First resume userEmail:", data.resumes[0].userEmail);
          }

          // Format the resumes to match our UI requirements
          const formattedResumes = data.resumes.map((resume: any) => {
            // Check if atsScore is present and properly handle its format
            let formattedAtsScore = 0; // Default score
            let formattedAtsScoreDetails = null;

            if (resume.atsScore) {
              // If it's a direct number, use it
              if (typeof resume.atsScore === "number") {
                formattedAtsScore = resume.atsScore;
              }
              // If it's an object with the structure from the database
              else if (typeof resume.atsScore === "object") {
                // Get total_score directly (not as array)
                if (resume.atsScore.total_score !== undefined) {
                  formattedAtsScore = resume.atsScore.total_score;
                }

                // Convert all scores to the format expected by the frontend
                formattedAtsScoreDetails = {
                  total_score: [resume.atsScore.total_score || 0],
                  keyword_match: [resume.atsScore.keyword_match || 0],
                  work_experience: [resume.atsScore.work_experience || 0],
                  technical_skills: [resume.atsScore.technical_skills || 0],
                  education_certifications: [
                    resume.atsScore.education_certifications || 0,
                  ],
                  projects_achievements: [
                    resume.atsScore.projects_achievements || 0,
                  ],
                  soft_skills_summary: [
                    resume.atsScore.soft_skills_summary || 0,
                  ],
                };
              }
            }

            return {
              _id: resume._id,
              id: resume._id || resume.id || Date.now(),
              position:
                resume.formData?.role ||
                resume.formData?.title ||
                resume.formData?.position ||
                "Resume",
              atsScore: formattedAtsScore,
              date:
                resume.date ||
                new Date(resume.createdAt || Date.now()).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                ),
              pdfData: resume.pdfData,
              latexCode: resume.latexCode,
              userEmail: resume.userEmail, // Store userEmail for reference
              atsScoreDetails: formattedAtsScoreDetails,
            };
          });

          setResumes(formattedResumes);
        } else {
          throw new Error(data.error || "Failed to fetch resumes");
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setError("Error loading your resumes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResumes();
  }, []);

  // Helper function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 80) return "bg-[#00ADB5]";
    return "bg-orange-600";
  };

  // Helper function to determine score text
  const getScoreText = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    return "Average";
  };

  // Handler for preview button
  const handlePreview = (resume: Resume) => {
    setSelectedResume(resume);
    setIsPreviewOpen(true);
  };

  // Handler for download button
  const handleDownload = (resume: Resume) => {
    if (resume.pdfData) {
      const linkSource = `data:application/pdf;base64,${resume.pdfData}`;
      const downloadLink = document.createElement("a");
      const fileName = `${
        resume.position || "resume".toLowerCase().replace(/\s+/g, "-")
      }-resume.pdf`;

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    }
  };

  // Handler for share button
  const handleShare = (resume: Resume) => {
    setSelectedResume(resume);
    // Generate a mock share link (in a real app, this would be a proper URL)
    setShareLink(`${window.location.origin}/shared-resume/${resume.id}`);
    setIsShareOpen(true);
  };

  // Handler for copying share link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handler for viewing ATS score details
  const handleViewDetails = async (resume: Resume) => {
    try {
      // Store the current resume in state
      setSelectedResume(resume);

      // If we already have detailed scores, just open the modal
      if (
        resume.atsScoreDetails &&
        resume.atsScoreDetails.total_score &&
        resume.atsScoreDetails.total_score.length > 0
      ) {
        setIsDetailsOpen(true);
        return;
      }

      // Otherwise, try to fetch detailed scores from the API using userEmail
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token available");
        setIsDetailsOpen(true); // Still open the modal, but it will show "not available" message
        return;
      }

      // Fetch the detailed ATS scores from the API using userEmail
      const response = await fetch(
        `/api/resume/ats-score?email=${encodeURIComponent(
          resume.userEmail || ""
        )}&resumeId=${resume._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.atsScore) {
          console.log("Fetched ATS score details:", data.atsScore);

          // Update the selected resume with the detailed scores
          // Converting from direct numbers in DB to arrays for the frontend
          const updatedResume = {
            ...resume,
            atsScoreDetails: {
              total_score: [data.atsScore.total_score || 0],
              keyword_match: [data.atsScore.keyword_match || 0],
              work_experience: [data.atsScore.work_experience || 0],
              technical_skills: [data.atsScore.technical_skills || 0],
              education_certifications: [
                data.atsScore.education_certifications || 0,
              ],
              projects_achievements: [data.atsScore.projects_achievements || 0],
              soft_skills_summary: [data.atsScore.soft_skills_summary || 0],
            },
          };
          setSelectedResume(updatedResume);

          // Also update the resume in the resumes array
          setResumes((prevResumes) =>
            prevResumes.map((r) => (r.id === resume.id ? updatedResume : r))
          );
        }
      } else {
        console.error("Failed to fetch detailed ATS scores");
      }

      // Open the modal whether we got updated data or not
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching ATS score details:", error);
      setIsDetailsOpen(true); // Still open the modal with whatever data we have
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
              Your Resumes
            </h1>
          </div>
          <div className="ml-auto">
            <Link href="/create-resume">
              <Button
                variant="outline"
                className="border text-"
                style={{
                  borderColor: "rgba(57, 62, 70, 0.2)",
                  color: "#393E46",
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow overflow-auto py-4 px-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-[#393E46]">
              Resume Collection
            </h2>
            <p className="text-zinc-500">
              View, download, or share your previously created resumes
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-32 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="mt-4 text-gray-500">
                  Loading your resumes...
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="text-red-500 mb-2 text-lg">Error</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No resumes found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                You haven't created any resumes yet. Create your first resume to
                see it here.
              </p>
              <Link href="/home">
                <Button>Create Resume</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-[#393E46]/10"
                >
                  <div className="flex flex-col h-full">
                    {/* Top section with image preview and ATS score side by side */}
                    <div className="flex flex-row h-[200px]">
                      {/* Left half - Resume image preview */}
                      <div className="relative w-1/2 flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Always display image.png instead of rendering PDF */}
                          <Image
                            src="/image.png"
                            alt={`Resume for ${resume.position}`}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 300px"
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                              padding: "8px",
                            }}
                          />
                        </div>
                      </div>

                      {/* Right half - Large ATS score display */}
                      <div className="w-1/2 flex flex-col items-center justify-center p-4 border-l border-[#393E46]/10">
                        <div className="text-center">
                          <span className="block text-sm font-medium text-[#393E46]/70 mb-1">
                            ATS SCORE
                          </span>
                          <div
                            className={`text-4xl font-bold mb-2 ${
                              (resume.atsScore || 0) >= 90
                                ? "text-green-600"
                                : (resume.atsScore || 0) >= 80
                                ? "text-[#00ADB5]"
                                : "text-orange-600"
                            }`}
                          >
                            {/* Display actual total_score from atsScoreDetails if available, according to schema */}
                            {resume.atsScoreDetails?.total_score?.[0] ||
                              resume.atsScore ||
                              0}
                            %
                          </div>
                          <span
                            className={`text-sm px-3 py-1 rounded-full ${getScoreColor(
                              resume.atsScore || 0
                            )} text-white`}
                          >
                            {getScoreText(resume.atsScore || 0)}
                          </span>

                          {/* Add View Details button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 text-xs border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/10"
                            onClick={() => {
                              setSelectedResume(resume);
                              setIsDetailsOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom section with position, date and actions */}
                    <CardContent className="p-4 border-t border-[#393E46]/10">
                      <h2 className="font-semibold text-xl mb-1 text-[#393E46]">
                        {resume.position}
                      </h2>
                      <p className="text-zinc-500 text-sm mb-4">
                        {resume.date}
                      </p>

                      <div className="flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/5"
                          onClick={() => handlePreview(resume)}
                          disabled={!resume.pdfData}
                        >
                          <Eye size={16} />
                          <span>Preview</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/5"
                          onClick={() => handleDownload(resume)}
                          disabled={!resume.pdfData}
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 border-[#393E46]/20 text-[#393E46] hover:bg-[#00ADB5]/5"
                          onClick={() => handleShare(resume)}
                        >
                          <Share2 size={16} />
                          <span>Share</span>
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* PDF Preview Modal - Keep this unchanged to preserve PDF viewing functionality */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col pdf-preview-container">
            <DialogHeader>
              <DialogTitle>Resume Preview</DialogTitle>
              <DialogDescription>
                {selectedResume?.position} - {selectedResume?.date}
              </DialogDescription>
            </DialogHeader>
            <div
              className="flex-grow flex items-center justify-center overflow-auto min-h-[70vh] hide-scrollbar"
              style={{
                scrollbarWidth: "none" /* Firefox */,
                msOverflowStyle: "none" /* IE */,
              }}
            >
              {selectedResume?.pdfData ? (
                <PDFViewer
                  file={`data:application/pdf;base64,${selectedResume.pdfData}`}
                  pageNumber={1}
                  defaultScale={0.6} // Set default scale to 60%
                  onLoadSuccess={() => {}}
                  onError={(error) => {
                    console.error("PDF preview error:", error);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center p-8 text-center text-gray-500">
                  No PDF preview available for this resume
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button
                onClick={() => selectedResume && handleDownload(selectedResume)}
                disabled={!selectedResume?.pdfData}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Resume</DialogTitle>
              <DialogDescription>
                Share this resume with others using the link below
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 mt-2">
              <div className="grid flex-1 gap-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={shareLink}
                  readOnly
                />
              </div>
              <Button size="sm" className="px-3" onClick={handleCopyLink}>
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <DialogFooter className="sm:justify-start mt-4">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Modal - New modal for displaying detailed ATS score components */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>ATS Score Details</DialogTitle>
              <DialogDescription>
                Detailed breakdown of the ATS score for this resume
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedResume?.atsScoreDetails ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#393E46] mb-2">
                      Keyword Match
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#00ADB5] h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails
                                .keyword_match?.[0] || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedResume.atsScoreDetails.keyword_match?.[0] || 0}
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#393E46] mb-2">
                      Work Experience
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#00ADB5] h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails
                                .work_experience?.[0] || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedResume.atsScoreDetails.work_experience?.[0] ||
                          0}
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#393E46] mb-2">
                      Technical Skills
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#00ADB5] h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails
                                .technical_skills?.[0] || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedResume.atsScoreDetails.technical_skills?.[0] ||
                          0}
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#393E46] mb-2">
                      Education & Certifications
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#00ADB5] h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails
                                .education_certifications?.[0] || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedResume.atsScoreDetails
                          .education_certifications?.[0] || 0}
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#393E46] mb-2">
                      Projects & Achievements
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#00ADB5] h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails
                                .projects_achievements?.[0] || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedResume.atsScoreDetails
                          .projects_achievements?.[0] || 0}
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#393E46] mb-2">
                      Soft Skills & Summary
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-[#00ADB5] h-2.5 rounded-full"
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails
                                .soft_skills_summary?.[0] || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedResume.atsScoreDetails
                          .soft_skills_summary?.[0] || 0}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 mt-4 pt-4 border-t">
                    <h3 className="text-base font-semibold text-[#393E46] mb-3">
                      Overall Score
                    </h3>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                        <div
                          className={`${getScoreColor(
                            selectedResume.atsScoreDetails.total_score?.[0] || 0
                          )} h-3 rounded-full`}
                          style={{
                            width: `${
                              selectedResume.atsScoreDetails.total_score?.[0] ||
                              0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-lg font-bold">
                        {selectedResume.atsScoreDetails.total_score?.[0] || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    Detailed ATS score breakdown is not available for this
                    resume.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
