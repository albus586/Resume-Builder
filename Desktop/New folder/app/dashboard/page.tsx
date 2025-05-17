"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Code,
  Award,
  Briefcase,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our data structures
type ResumeActivity = {
  type: string;
  title: string;
  time: string;
  date?: Date; // For sorting
  roleId?: string; // To link to the resume
};

type SkillWithLevel = {
  name: string;
  level: string; // For calculating progress bar
  category: string;
};

type ResumeData = {
  id: string;
  title: string;
  role: string;
  createdAt: string;
  atsScore?: number | { total_score: number; [key: string]: any };
  atsScoreDetails?: any;
};

export default function Dashboard() {
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard data
  const [resumeCount, setResumeCount] = useState<number>(0);
  const [skillsCount, setSkillsCount] = useState<number>(0);
  const [averageAtsScore, setAverageAtsScore] = useState<number>(0);
  const [suggestedPositions, setSuggestedPositions] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<ResumeActivity[]>([]);
  const [topSkills, setTopSkills] = useState<SkillWithLevel[]>([]);

  // Theme colors
  const themeColors = {
    primary: "#00ADB5",
    secondary: "#393E46",
    background: "#EEEEEE",
    card: "#FFFFFF",
    accent: "#00ADB5",
    text: "#393E46",
    border: "rgba(57, 62, 70, 0.1)",
  };

  // Function to get color based on ATS score
  const getAtsScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return `bg-[${themeColors.primary}]`;
    if (score >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // Helper to format relative time
  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  };

  // Calculate skill level percentage for visualization
  const getSkillLevelPercentage = (level: string): number => {
    switch (level.toLowerCase()) {
      case "expert":
        return 95;
      case "advanced":
        return 85;
      case "intermediate":
        return 70;
      case "beginner":
        return 45;
      default:
        return 60; // Default value
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Get user info from local storage
        const userDataString = localStorage.getItem("user");
        if (!userDataString) {
          throw new Error("User not logged in");
        }

        const userData = JSON.parse(userDataString);
        const userEmail = userData.email;

        // Get auth token from local storage
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Fetch user's resumes
        const resumesResponse = await fetch(
          `/api/resume?email=${encodeURIComponent(userEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resumesResponse.ok) {
          throw new Error("Failed to fetch resumes");
        }

        const resumesData = await resumesResponse.json();
        const resumes: ResumeData[] = resumesData.resumes || [];

        // Set resume count
        setResumeCount(resumes.length);

        // Calculate average ATS score
        if (resumes.length > 0) {
          const validScores = resumes
            .map((resume) => {
              if (resume.atsScore) {
                return typeof resume.atsScore === "number"
                  ? resume.atsScore
                  : resume.atsScore.total_score || 0;
              }
              return 0;
            })
            .filter((score) => score > 0);

          const avgScore =
            validScores.length > 0
              ? Math.round(
                  validScores.reduce((sum, score) => sum + score, 0) /
                    validScores.length
                )
              : 0;

          setAverageAtsScore(avgScore);
        }

        // Create activity items from resumes
        const activities: ResumeActivity[] = resumes.map((resume) => {
          const createdDate = new Date(resume.createdAt);
          return {
            type: "Resume Created",
            title: resume.role || resume.title,
            time: getRelativeTimeString(createdDate),
            date: createdDate,
            roleId: resume.id,
          };
        });

        // Sort activities by date (newest first)
        activities.sort((a, b) => {
          if (a.date && b.date) {
            return b.date.getTime() - a.date.getTime();
          }
          return 0;
        });

        setRecentActivity(activities.slice(0, 5)); // Get most recent 5 activities

        // Extract unique positions for suggestions based on roles in resumes
        const uniqueRoles = [...new Set(resumes.map((resume) => resume.role))];
        setSuggestedPositions(uniqueRoles);

        // Fetch user profile for skills
        const profileResponse = await fetch(
          `/api/profile?email=${encodeURIComponent(userEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log("Profile data:", profileData);

          // Handle skills from your specific profile structure
          let allSkills: SkillWithLevel[] = [];

          // Check if profile contains a skills object with categorized arrays (your database structure)
          if (
            profileData.skills &&
            typeof profileData.skills === "object" &&
            !Array.isArray(profileData.skills)
          ) {
            // Process programming languages
            if (Array.isArray(profileData.skills.programmingLanguages)) {
              profileData.skills.programmingLanguages.forEach(
                (skill: string) => {
                  allSkills.push({
                    name: skill,
                    level: "advanced",
                    category: "programming",
                  });
                }
              );
            }

            // Process frameworks
            if (Array.isArray(profileData.skills.frameworks)) {
              profileData.skills.frameworks.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "advanced",
                  category: "frameworks",
                });
              });
            }

            // Process databases
            if (Array.isArray(profileData.skills.databases)) {
              profileData.skills.databases.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "intermediate",
                  category: "databases",
                });
              });
            }

            // Process tools
            if (Array.isArray(profileData.skills.tools)) {
              profileData.skills.tools.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "intermediate",
                  category: "tools",
                });
              });
            }
          }

          // Also check technicalSkills if available (fallback)
          if (Object.keys(profileData.technicalSkills || {}).length > 0) {
            const technicalSkills = profileData.technicalSkills;

            // Process programming languages
            if (Array.isArray(technicalSkills.programmingLanguages)) {
              technicalSkills.programmingLanguages.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "advanced",
                  category: "programming",
                });
              });
            }

            // Process frameworks and libraries
            if (Array.isArray(technicalSkills.frameworksLibraries)) {
              technicalSkills.frameworksLibraries.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "advanced",
                  category: "frameworks",
                });
              });
            }

            // Process tools and software
            if (Array.isArray(technicalSkills.toolsSoftwares)) {
              technicalSkills.toolsSoftwares.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "intermediate",
                  category: "tools",
                });
              });
            }

            // Process databases
            if (Array.isArray(technicalSkills.databases)) {
              technicalSkills.databases.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "intermediate",
                  category: "databases",
                });
              });
            }

            // Process cloud platforms
            if (Array.isArray(technicalSkills.cloudPlatforms)) {
              technicalSkills.cloudPlatforms.forEach((skill: string) => {
                allSkills.push({
                  name: skill,
                  level: "intermediate",
                  category: "cloud",
                });
              });
            }
          }

          // Add languages if available
          if (Array.isArray(profileData.languagesKnown)) {
            profileData.languagesKnown.forEach((lang: string) => {
              allSkills.push({
                name: lang,
                level: "fluent",
                category: "language",
              });
            });
          }

          // Remove duplicates (in case skills are listed in multiple places)
          const uniqueSkills = allSkills.filter(
            (skill, index, self) =>
              index === self.findIndex((s) => s.name === skill.name)
          );

          // Set skills count and top skills
          console.log(`Found ${uniqueSkills.length} unique skills`);
          setSkillsCount(uniqueSkills.length);

          // Sort skills by level to get top skills
          const sortedSkills = [...uniqueSkills].sort((a, b) => {
            const levelA = getSkillLevelPercentage(a.level);
            const levelB = getSkillLevelPercentage(b.level);
            return levelB - levelA;
          });

          setTopSkills(sortedSkills.slice(0, 5)); // Get top 5 skills
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        // Set fallback data
        setResumeCount(0);
        setSkillsCount(0);
        setAverageAtsScore(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading states for each section
  const LoadingCard = () => (
    <Card className="p-5 bg-white border-[#393E46]/10 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-full">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32 mt-2" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </Card>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#EEEEEE] flex flex-col">
        {/* Header with modernized style */}
        <header
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] border-b px-6"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <SidebarTrigger
              className="-ml-1"
              style={{ color: themeColors.text }}
            />
            <div>
              <h1
                className="text-xl font-semibold"
                style={{ color: themeColors.text }}
              >
                Dashboard
              </h1>
              <p className="text-xs text-zinc-500">
                Overview of your resume portfolio
              </p>
            </div>
          </div>
        </header>

        {/* Main Content with improved spacing and shadows */}
        <div className="flex-grow overflow-auto py-6 px-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Error loading dashboard data</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeColors.text }}
                >
                  Welcome to Your Resume Hub
                </h2>
                <p className="text-zinc-500">
                  Track your resume activity, skills, and performance all in one
                  place.
                </p>
              </div>
              {isLoading && (
                <div className="flex items-center text-zinc-500 text-sm">
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Loading data...
                </div>
              )}
            </div>
          )}

          {/* Stats Cards with enhanced visual styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Resumes Created Card */}
            {isLoading ? (
              <LoadingCard />
            ) : (
              <Card className="p-5 bg-white border-[#393E46]/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1 font-medium">
                      Resumes Created
                    </p>
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: themeColors.text }}
                    >
                      {resumeCount}
                    </h3>
                    <Link
                      href="/view-resume"
                      className="mt-3 text-xs inline-flex items-center text-[#00ADB5] hover:underline"
                    >
                      <span>View all resumes</span>
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-[#00ADB5]/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-[#00ADB5]" />
                  </div>
                </div>
              </Card>
            )}

            {/* Skills Card with animation effects */}
            {isLoading ? (
              <LoadingCard />
            ) : (
              <Card className="p-5 bg-white border-[#393E46]/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1 font-medium">
                      Skills Listed
                    </p>
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: themeColors.text }}
                    >
                      {skillsCount}
                    </h3>
                    <Link
                      href="/profile"
                      className="mt-3 text-xs inline-flex items-center text-[#00ADB5] hover:underline"
                    >
                      <span>Manage skills</span>
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-full">
                    <Code className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            )}

            {/* Average ATS Score Card with better progress indicator */}
            {isLoading ? (
              <LoadingCard />
            ) : (
              <Card className="p-5 bg-white border-[#393E46]/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1 font-medium">
                      Average ATS Score
                    </p>
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: themeColors.text }}
                    >
                      {averageAtsScore > 0 ? `${averageAtsScore}%` : "N/A"}
                    </h3>
                    {averageAtsScore > 0 && (
                      <div className="mt-2 h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getAtsScoreColor(
                            averageAtsScore
                          )} transition-all duration-500`}
                          style={{ width: `${averageAtsScore}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-3 rounded-full">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </Card>
            )}

            {/* Suggested Positions Card with interactive elements */}
            {isLoading ? (
              <LoadingCard />
            ) : (
              <Card className="p-5 bg-white border-[#393E46]/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1 font-medium">
                      Unique Positions
                    </p>
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: themeColors.text }}
                    >
                      {suggestedPositions.length}
                    </h3>
                    {suggestedPositions.length > 0 && (
                      <div className="mt-2 text-xs flex items-center">
                        <Zap className="h-3 w-3 mr-1 text-purple-500" />
                        <span className="text-zinc-500 truncate max-w-[120px]">
                          {suggestedPositions[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Bottom Section with enhanced layout and card effects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity with better styling */}
            <Card className="p-6 bg-white border-[#393E46]/10 hover:shadow-lg transition-all duration-300 lg:col-span-2">
              <h3
                className="text-lg font-bold mb-5"
                style={{ color: themeColors.text }}
              >
                <div className="flex items-center">
                  <div className="bg-[#00ADB5]/10 p-2 rounded-md mr-3">
                    <Clock className="h-5 w-5 text-[#00ADB5]" />
                  </div>
                  Recent Activity
                </div>
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-[#393E46]/5"
                    >
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-1/2 mt-1" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="p-6 text-center rounded-lg border border-dashed border-[#393E46]/20">
                  <p className="text-zinc-500 mb-2">No activity yet</p>
                  <p className="text-xs text-zinc-400">
                    Create your first resume to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 rounded-lg hover:bg-[#00ADB5]/5 border border-[#393E46]/5 transition-colors"
                    >
                      <div className="flex-grow">
                        <p
                          className="text-base font-medium"
                          style={{ color: themeColors.text }}
                        >
                          {activity.title}
                        </p>
                        <p className="text-xs text-zinc-500">{activity.type}</p>
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-nowrap">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top Skills with improved visualization */}
            <Card className="p-6 bg-white border-[#393E46]/10 hover:shadow-lg transition-all duration-300">
              <h3
                className="text-lg font-bold mb-5"
                style={{ color: themeColors.text }}
              >
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-md mr-3">
                    <Code className="h-5 w-5 text-blue-600" />
                  </div>
                  Top Skills
                </div>
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-32" />
                    </div>
                  ))}
                </div>
              ) : topSkills.length === 0 ? (
                <div className="p-6 text-center rounded-lg border border-dashed border-[#393E46]/20">
                  <p className="text-zinc-500 mb-2">No skills added yet</p>
                  <Link
                    href="/profile"
                    className="text-xs text-[#00ADB5] hover:underline"
                  >
                    Complete your profile to add skills
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-medium"
                          style={{ color: themeColors.text }}
                        >
                          {skill.name}
                        </span>
                        <span className="text-xs text-zinc-500 capitalize">
                          {skill.category}
                        </span>
                      </div>
                      <div className="w-32">
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-[#00ADB5] rounded-full transition-all duration-500"
                            style={{
                              width: `${getSkillLevelPercentage(skill.level)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-right text-xs text-zinc-400 mt-0.5 capitalize">
                          {skill.level}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      className="w-full mt-3 text-[#393E46] border-[#393E46]/20 hover:bg-[#00ADB5]/5"
                    >
                      Manage Skills
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
