// schema/resume.ts
import { z } from "zod";

// Schema for the form data
export const ResumeFormSchema = z.object({
  title: z.string().min(1, "Professional Title is required"),
  role: z.string().min(1, "Target Role is required"),
  jobDescription: z.string().min(1, "Job Description is required"),
  keySkills: z.string().min(1, "Key Skills are required"),
});

// Schema for ATS score data
export const ATSScoreSchema = z.object({
  education_certifications: z.array(z.number()).optional(),
  keyword_match: z.array(z.number()).optional(),
  projects_achievements: z.array(z.number()).optional(),
  soft_skills_summary: z.array(z.number()).optional(),
  technical_skills: z.array(z.number()).optional(),
  total_score: z.array(z.number()).optional(),
  work_experience: z.array(z.number()).optional(),
});

// Schema for the generated resume data
export const GeneratedResumeSchema = z.object({
  formData: ResumeFormSchema,
  pdfData: z.string().optional(), // Base64 encoded PDF
  latexCode: z.string().optional(), // LaTeX code
  atsScore: ATSScoreSchema.optional(), // ATS score data
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  userEmail: z.string().email().nullable().optional(), // Store email instead of userId
});

// Type definitions based on the schemas
export type ResumeFormData = z.infer<typeof ResumeFormSchema>;
export type ATSScoreData = z.infer<typeof ATSScoreSchema>;
export type GeneratedResumeData = z.infer<typeof GeneratedResumeSchema>;

// Type for saved resumes from localStorage
export interface SavedResume {
  id: string;
  title: string;
  role: string;
  createdAt: string;
  pdfData: string;
  latexCode: string;
  atsScore?: ATSScoreData;
}
