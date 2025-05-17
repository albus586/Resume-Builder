import { useEffect, useState, useRef } from "react";
import { Profile } from "@/schema/profile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash,
  Upload,
  CheckCircle2,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData: Profile | null;
  onSaveSuccess?: () => void;
}

export function ProfileForm({ initialData, onSaveSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState<Partial<Profile>>(
    initialData || {
      education: [
        { degree: "", university: "", location: "", startYear: 0, endYear: 0 },
      ],
      workExperience: [
        {
          jobTitle: "",
          companyName: "",
          location: "",
          startDate: "",
          endDate: "",
          responsibilities: [],
        },
      ],
      projects: [
        { projectTitle: "", shortDescription: "", technologiesUsed: [] },
      ],
      technicalSkills: {
        programmingLanguages: [],
        frameworksLibraries: [],
        toolsSoftwares: [],
        cloudPlatforms: [],
        databases: [],
      },
    }
  );

  // Profile photo upload state
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    formData.profilePhoto || null
  );
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPhotoPreview(initialData.profilePhoto || null);
    }
  }, [initialData]);

  const [openSections, setOpenSections] = useState({
    personal: true,
    contact: false,
    career: false,
    education: false,
    workExperience: false,
    projects: false,
    certifications: false,
    languages: false,
    references: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (
    section: keyof Profile,
    field: string,
    value: string | string[] | number | Record<string, unknown>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]:
        field && typeof prev[section] === "object"
          ? {
              ...(prev[section] as object),
              [field]: value,
            }
          : value,
    }));
  };

  const handleArrayInputChange = (
    section: keyof Pick<
      Profile,
      | "education"
      | "workExperience"
      | "projects"
      | "certificationsCourses"
      | "references"
    >,
    index: number,
    field: string,
    value: string | string[] | number
  ) => {
    setFormData((prev) => {
      const newArray = [...(prev[section] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile saved successfully");
        onSaveSuccess?.();
      } else {
        throw new Error("Failed to save profile");
      }
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch(
        "https://resume-builder-backend-362387414228.asia-south1.run.app/api/upload-resume",
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }

      const uploadedData = await response.json();

      // Merge the received data with existing form data while preserving existing entries
      setFormData((prev) => {
        const mergedData = { ...prev };

        // Merge education (append new entries)
        if (uploadedData.education?.length) {
          mergedData.education = [
            ...(prev.education || []),
            ...uploadedData.education.filter(
              (newEdu: { degree: string; university: string }) =>
                !(prev.education || []).some(
                  (existingEdu) =>
                    existingEdu.degree === newEdu.degree &&
                    existingEdu.university === newEdu.university
                )
            ),
          ];
        }

        // Merge work experience (append new entries)
        if (uploadedData.workExperience?.length) {
          mergedData.workExperience = [
            ...(prev.workExperience || []),
            ...uploadedData.workExperience.filter(
              (newExp: { jobTitle: string; companyName: string }) =>
                !(prev.workExperience || []).some(
                  (existingExp) =>
                    existingExp.jobTitle === newExp.jobTitle &&
                    existingExp.companyName === newExp.companyName
                )
            ),
          ];
        }

        // Merge projects (append new entries)
        if (uploadedData.projects?.length) {
          mergedData.projects = [
            ...(prev.projects || []),
            ...uploadedData.projects.filter(
              (newProj: { projectTitle: string }) =>
                !(prev.projects || []).some(
                  (existingProj) =>
                    existingProj.projectTitle === newProj.projectTitle
                )
            ),
          ];
        }

        // Merge certifications (append new entries)
        if (uploadedData.certificationsCourses?.length) {
          mergedData.certificationsCourses = [
            ...(prev.certificationsCourses || []),
            ...uploadedData.certificationsCourses.filter(
              (newCert: { courseName: string; issuingOrganization: string }) =>
                !(prev.certificationsCourses || []).some(
                  (existingCert) =>
                    existingCert.courseName === newCert.courseName &&
                    existingCert.issuingOrganization ===
                      newCert.issuingOrganization
                )
            ),
          ];
        }

        // Merge technical skills (combine arrays and remove duplicates)
        if (uploadedData.technicalSkills) {
          mergedData.technicalSkills = {
            programmingLanguages: [
              ...new Set([
                ...(prev.technicalSkills?.programmingLanguages || []),
                ...(uploadedData.technicalSkills.programmingLanguages || []),
              ]),
            ],
            frameworksLibraries: [
              ...new Set([
                ...(prev.technicalSkills?.frameworksLibraries || []),
                ...(uploadedData.technicalSkills.frameworksLibraries || []),
              ]),
            ],
            toolsSoftwares: [
              ...new Set([
                ...(prev.technicalSkills?.toolsSoftwares || []),
                ...(uploadedData.technicalSkills.toolsSoftwares || []),
              ]),
            ],
            cloudPlatforms: [
              ...new Set([
                ...(prev.technicalSkills?.cloudPlatforms || []),
                ...(uploadedData.technicalSkills.cloudPlatforms || []),
              ]),
            ],
            databases: [
              ...new Set([
                ...(prev.technicalSkills?.databases || []),
                ...(uploadedData.technicalSkills.databases || []),
              ]),
            ],
          };
        }

        // Merge languages and interests (combine arrays and remove duplicates)
        if (uploadedData.languagesKnown?.length) {
          mergedData.languagesKnown = [
            ...new Set([
              ...(prev.languagesKnown || []),
              ...uploadedData.languagesKnown,
            ]),
          ];
        }

        if (uploadedData.interests?.length) {
          mergedData.interests = [
            ...new Set([...(prev.interests || []), ...uploadedData.interests]),
          ];
        }

        // For basic info and contact, only update if current values are empty
        if (!prev.name && uploadedData.name)
          mergedData.name = uploadedData.name;
        if (!prev.gender && uploadedData.gender)
          mergedData.gender = uploadedData.gender;
        if (!prev.dob && uploadedData.dob) mergedData.dob = uploadedData.dob;
        if (!prev.careerObjective && uploadedData.careerObjective) {
          mergedData.careerObjective = uploadedData.careerObjective;
        }

        if (uploadedData.contact) {
          mergedData.contact = {
            ...prev.contact,
            email: prev.contact?.email || uploadedData.contact.email,
            phone: prev.contact?.phone || uploadedData.contact.phone,
            address: {
              ...(prev.contact?.address || {}),
              city:
                prev.contact?.address?.city ||
                uploadedData.contact.address?.city,
              state:
                prev.contact?.address?.state ||
                uploadedData.contact.address?.state,
              country:
                prev.contact?.address?.country ||
                uploadedData.contact.address?.country,
            },
            linkedin: prev.contact?.linkedin || uploadedData.contact.linkedin,
            github: prev.contact?.github || uploadedData.contact.github,
            portfolio:
              prev.contact?.portfolio || uploadedData.contact.portfolio,
          };
        }

        return mergedData;
      });

      toast.success("Resume data merged successfully");
    } catch {
      toast.error("Failed to extract data from resume");
    }
  };

  // Profile photo upload UI only
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setFormData((prev) => ({
        ...prev,
        profilePhoto: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoInput = () => {
    photoInputRef.current?.click();
  };

  // Section completion logic
  const isPersonalComplete =
    !!formData.name && !!formData.gender && !!formData.dob && !!photoPreview;
  const isContactComplete =
    !!formData.contact?.email &&
    !!formData.contact?.phone &&
    !!formData.contact?.address?.city &&
    !!formData.contact?.address?.state &&
    !!formData.contact?.address?.country;
  const isCareerComplete = !!formData.careerObjective;
  const isEducationComplete =
    !!formData.education?.length &&
    formData.education.every(
      (e) => e.degree && e.university && e.location && e.startYear && e.endYear
    );
  const isWorkExperienceComplete =
    !!formData.workExperience?.length &&
    formData.workExperience.every(
      (e) =>
        e.jobTitle &&
        e.companyName &&
        e.location &&
        e.startDate &&
        e.endDate &&
        e.responsibilities &&
        e.responsibilities.length > 0
    );
  const isProjectsComplete =
    !!formData.projects?.length &&
    formData.projects.every(
      (p) => p.projectTitle && p.shortDescription && p.technologiesUsed?.length
    );
  const isCertificationsComplete =
    !!formData.certificationsCourses?.length &&
    formData.certificationsCourses.every(
      (c) => c.courseName && c.issuingOrganization && c.completionDate
    );
  const isLanguagesComplete =
    !!formData.languagesKnown?.length && !!formData.interests?.length;
  const isReferencesComplete =
    !!formData.references?.length &&
    formData.references.every(
      (r) => r.name && r.position && r.email && r.phone
    );

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Resume Upload Button */}
      <div className="flex justify-end mb-2">
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white h-10 px-4 py-2 rounded-lg transition-all duration-300 shadow-md font-medium transform hover:scale-105"
          >
            <Upload className="h-4 w-4" />
            Upload Resume
          </label>
        </div>
      </div>

      {/* Personal Information */}
      <Collapsible
        open={openSections.personal}
        onOpenChange={() => toggleSection("personal")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Personal Information
            {isPersonalComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.personal ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-6 animate-in slide-in-from-top-5 duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-[#F1F5F9] border-4 border-[#00ADB5] shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Profile photo"
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <User className="h-10 w-10 text-[#CBD5E1]" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={triggerPhotoInput}
                  className="absolute bottom-1 right-1 bg-[#00ADB5] hover:bg-[#089DA6] text-white rounded-full p-1.5 shadow-lg transition-colors hover:shadow-xl"
                  aria-label="Upload profile photo"
                >
                  <Upload className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <span className="text-xs text-[#64748B] font-medium">
                Profile Photo
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <div>
                <Label
                  htmlFor="name"
                  className="text-[#393E46] font-medium block mb-1.5"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    handleInputChange("name", "", e.target.value)
                  }
                  className="border-[#00ADB5]/30 focus:border-[#00ADB5] focus:ring-[#00ADB5]/20 rounded-lg shadow-sm h-11"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label
                  htmlFor="gender"
                  className="text-[#393E46] font-medium block mb-1.5"
                >
                  Gender
                </Label>
                <Input
                  id="gender"
                  value={formData.gender || ""}
                  onChange={(e) =>
                    handleInputChange("gender", "", e.target.value)
                  }
                  className="border-[#00ADB5]/30 focus:border-[#00ADB5] focus:ring-[#00ADB5]/20 rounded-lg shadow-sm h-11"
                  placeholder="Enter your gender"
                />
              </div>
              <div>
                <Label
                  htmlFor="dob"
                  className="text-[#393E46] font-medium block mb-1.5"
                >
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob || ""}
                  onChange={(e) => handleInputChange("dob", "", e.target.value)}
                  className="border-[#00ADB5]/30 focus:border-[#00ADB5] focus:ring-[#00ADB5]/20 rounded-lg shadow-sm h-11"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Contact Information - Fixed structure */}
      <Collapsible
        open={openSections.contact}
        onOpenChange={() => toggleSection("contact")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Contact Information
            {isContactComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.contact ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-6 animate-in slide-in-from-top-5 duration-300">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="email"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.contact?.email || ""}
                onChange={(e) =>
                  handleInputChange("contact", "email", e.target.value)
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.contact?.phone || ""}
                onChange={(e) =>
                  handleInputChange("contact", "phone", e.target.value)
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="+1 (123) 456-7890"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label
                htmlFor="city"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                City
              </Label>
              <Input
                id="city"
                value={formData.contact?.address?.city || ""}
                onChange={(e) =>
                  handleInputChange("contact", "address", {
                    ...formData.contact?.address,
                    city: e.target.value,
                  })
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="San Francisco"
              />
            </div>
            <div>
              <Label
                htmlFor="state"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                State
              </Label>
              <Input
                id="state"
                value={formData.contact?.address?.state || ""}
                onChange={(e) =>
                  handleInputChange("contact", "address", {
                    ...formData.contact?.address,
                    state: e.target.value,
                  })
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="California"
              />
            </div>
            <div>
              <Label
                htmlFor="country"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                Country
              </Label>
              <Input
                id="country"
                value={formData.contact?.address?.country || ""}
                onChange={(e) =>
                  handleInputChange("contact", "address", {
                    ...formData.contact?.address,
                    country: e.target.value,
                  })
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="United States"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="linkedin"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.contact?.linkedin || ""}
                onChange={(e) =>
                  handleInputChange("contact", "linkedin", e.target.value)
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label
                htmlFor="github"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                GitHub
              </Label>
              <Input
                id="github"
                value={formData.contact?.github || ""}
                onChange={(e) =>
                  handleInputChange("contact", "github", e.target.value)
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="github.com/yourusername"
              />
            </div>
            <div>
              <Label
                htmlFor="portfolio"
                className="text-[#393E46] font-medium block mb-1.5"
              >
                Portfolio (optional)
              </Label>
              <Input
                id="portfolio"
                value={formData.contact?.portfolio || ""}
                onChange={(e) =>
                  handleInputChange("contact", "portfolio", e.target.value)
                }
                className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                placeholder="yourportfolio.com"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Career Objective */}
      <Collapsible
        open={openSections.career}
        onOpenChange={() => toggleSection("career")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Career Objective
            {isCareerComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.career ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner animate-in slide-in-from-top-5 duration-300">
          <Textarea
            value={formData.careerObjective || ""}
            onChange={(e) =>
              handleInputChange("careerObjective", "", e.target.value)
            }
            placeholder="Write your career objective..."
            className="min-h-[120px] rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] text-[#4B5563] resize-y p-3"
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Education */}
      <Collapsible
        open={openSections.education}
        onOpenChange={() => toggleSection("education")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Education
            {isEducationComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.education ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-4 animate-in slide-in-from-top-5 duration-300">
          {formData.education?.map((edu, index) => (
            <div
              key={index}
              className="space-y-4 p-6 border rounded-lg bg-[#f8fafc] shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Degree
                  </Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "education",
                        index,
                        "degree",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    University
                  </Label>
                  <Input
                    value={edu.university}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "education",
                        index,
                        "university",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Stanford University"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Location
                  </Label>
                  <Input
                    value={edu.location}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "education",
                        index,
                        "location",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Stanford, CA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[#393E46] font-medium block mb-1.5">
                      Start Year
                    </Label>
                    <Input
                      type="number"
                      value={edu.startYear || ""}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "education",
                          index,
                          "startYear",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                      placeholder="2018"
                    />
                  </div>
                  <div>
                    <Label className="text-[#393E46] font-medium block mb-1.5">
                      End Year
                    </Label>
                    <Input
                      type="number"
                      value={edu.endYear || ""}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "education",
                          index,
                          "endYear",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>
              {index > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newEducation = [...(formData.education ?? [])];
                    newEducation.splice(index, 1);
                    setFormData({ ...formData, education: newEducation });
                  }}
                  className="rounded-lg mt-2 hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove Education
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                education: [
                  ...(formData.education || []),
                  {
                    degree: "",
                    university: "",
                    location: "",
                    startYear: 0,
                    endYear: 0,
                  },
                ],
              });
            }}
            className="rounded-lg bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Work Experience */}
      <Collapsible
        open={openSections.workExperience}
        onOpenChange={() => toggleSection("workExperience")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Work Experience
            {isWorkExperienceComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.workExperience ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-4 animate-in slide-in-from-top-5 duration-300">
          {formData.workExperience?.map((exp, index) => (
            <div
              key={index}
              className="space-y-4 p-6 border rounded-lg bg-[#f8fafc] shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Job Title
                  </Label>
                  <Input
                    value={exp.jobTitle}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "workExperience",
                        index,
                        "jobTitle",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Company Name
                  </Label>
                  <Input
                    value={exp.companyName}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "workExperience",
                        index,
                        "companyName",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Google Inc."
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Location
                  </Label>
                  <Input
                    value={exp.location}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "workExperience",
                        index,
                        "location",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Mountain View, CA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[#393E46] font-medium block mb-1.5">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "workExperience",
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                      className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-[#393E46] font-medium block mb-1.5">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "workExperience",
                          index,
                          "endDate",
                          e.target.value
                        )
                      }
                      className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-[#393E46] font-medium block mb-1.5">
                  Responsibilities (one per line)
                </Label>
                <Textarea
                  value={(exp.responsibilities ?? []).join("\n")}
                  onChange={(e) =>
                    handleArrayInputChange(
                      "workExperience",
                      index,
                      "responsibilities",
                      e.target.value
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                    )
                  }
                  className="min-h-[100px] rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] text-[#4B5563] resize-y p-3"
                  placeholder="Enter responsibilities, one per line"
                />
              </div>
              {index > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newWorkExperience = [
                      ...(formData.workExperience || []),
                    ];
                    newWorkExperience.splice(index, 1);
                    setFormData({
                      ...formData,
                      workExperience: newWorkExperience,
                    });
                  }}
                  className="rounded-lg mt-2 hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove Experience
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                workExperience: [
                  ...(formData.workExperience || []),
                  {
                    jobTitle: "",
                    companyName: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    responsibilities: [],
                  },
                ],
              });
            }}
            className="rounded-lg bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Work Experience
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Projects */}
      <Collapsible
        open={openSections.projects}
        onOpenChange={() => toggleSection("projects")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Projects
            {isProjectsComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.projects ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-4 animate-in slide-in-from-top-5 duration-300">
          {formData.projects?.map((project, index) => (
            <div
              key={index}
              className="space-y-4 p-6 border rounded-lg bg-[#f8fafc] shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Project Title
                  </Label>
                  <Input
                    value={project.projectTitle}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "projects",
                        index,
                        "projectTitle",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="E-Commerce Platform"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Project Link (optional)
                  </Label>
                  <Input
                    value={project.projectLink || ""}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "projects",
                        index,
                        "projectLink",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="https://github.com/yourusername/project"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[#393E46] font-medium block mb-1.5">
                  Short Description
                </Label>
                <Textarea
                  value={project.shortDescription}
                  onChange={(e) =>
                    handleArrayInputChange(
                      "projects",
                      index,
                      "shortDescription",
                      e.target.value
                    )
                  }
                  className="min-h-[100px] rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] text-[#4B5563] resize-y p-3"
                  placeholder="Describe your project here..."
                />
              </div>
              <div>
                <Label className="text-[#393E46] font-medium block mb-1.5">
                  Technologies Used (comma-separated)
                </Label>
                <Input
                  value={(project.technologiesUsed ?? []).join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange(
                      "projects",
                      index,
                      "technologiesUsed",
                      e.target.value
                        .split(", ")
                        .filter((tech) => tech.trim() !== "")
                    )
                  }
                  placeholder="e.g. React, Node.js, MongoDB"
                  className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                />
              </div>
              {index > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newProjects = [...(formData.projects || [])];
                    newProjects.splice(index, 1);
                    setFormData({ ...formData, projects: newProjects });
                  }}
                  className="rounded-lg mt-2 hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove Project
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                projects: [
                  ...(formData.projects || []),
                  {
                    projectTitle: "",
                    shortDescription: "",
                    technologiesUsed: [],
                  },
                ],
              });
            }}
            className="rounded-lg bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Certifications & Courses */}
      <Collapsible
        open={openSections.certifications}
        onOpenChange={() => toggleSection("certifications")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Certifications & Courses
            {isCertificationsComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.certifications ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-4 animate-in slide-in-from-top-5 duration-300">
          {formData.certificationsCourses?.map((cert, index) => (
            <div
              key={index}
              className="space-y-4 p-6 border rounded-lg bg-[#f8fafc] shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Course Name
                  </Label>
                  <Input
                    value={cert.courseName}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "certificationsCourses",
                        index,
                        "courseName",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="AWS Certified Solutions Architect"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Issuing Organization
                  </Label>
                  <Input
                    value={cert.issuingOrganization}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "certificationsCourses",
                        index,
                        "issuingOrganization",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Completion Date
                  </Label>
                  <Input
                    type="date"
                    value={cert.completionDate}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "certificationsCourses",
                        index,
                        "completionDate",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                  />
                </div>
              </div>
              {index > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newCertifications = [
                      ...(formData.certificationsCourses || []),
                    ];
                    newCertifications.splice(index, 1);
                    setFormData({
                      ...formData,
                      certificationsCourses: newCertifications,
                    });
                  }}
                  className="rounded-lg mt-2 hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove Certification
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                certificationsCourses: [
                  ...(formData.certificationsCourses || []),
                  {
                    courseName: "",
                    issuingOrganization: "",
                    completionDate: "",
                  },
                ],
              });
            }}
            className="rounded-lg bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Languages & Interests */}
      <Collapsible
        open={openSections.languages}
        onOpenChange={() => toggleSection("languages")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            Languages & Interests
            {isLanguagesComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.languages ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-4 animate-in slide-in-from-top-5 duration-300">
          <div>
            <Label className="text-[#393E46] font-medium block mb-1.5">
              Languages Known (comma-separated)
            </Label>
            <Input
              value={formData.languagesKnown?.join(", ") || ""}
              onChange={(e) =>
                handleInputChange(
                  "languagesKnown",
                  "",
                  e.target.value
                    .split(", ")
                    .filter((lang) => lang.trim() !== "")
                )
              }
              placeholder="e.g. English, Spanish, French"
              className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
            />
          </div>
          <div>
            <Label className="text-[#393E46] font-medium block mb-1.5">
              Interests (comma-separated)
            </Label>
            <Input
              value={formData.interests?.join(", ") || ""}
              onChange={(e) =>
                handleInputChange(
                  "interests",
                  "",
                  e.target.value
                    .split(", ")
                    .filter((interest) => interest.trim() !== "")
                )
              }
              placeholder="e.g. Reading, Traveling, Photography"
              className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* References */}
      <Collapsible
        open={openSections.references}
        onOpenChange={() => toggleSection("references")}
        className="transition-all duration-300"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e0f7fa] to-[#f8fafc] hover:bg-[#e0f7fa]/80 text-[#22223b] rounded-xl border border-[#00ADB5]/10 shadow transition-colors font-semibold text-lg transform hover:translate-y-[-1px]">
          <div className="flex items-center gap-2">
            References
            {isReferencesComplete && (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            )}
          </div>
          {openSections.references ? (
            <ChevronUp className="text-[#00ADB5]" />
          ) : (
            <ChevronDown className="text-[#00ADB5]" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-white rounded-b-xl shadow-inner space-y-4 animate-in slide-in-from-top-5 duration-300">
          {formData.references?.map((ref, index) => (
            <div
              key={index}
              className="space-y-4 p-6 border rounded-lg bg-[#f8fafc] shadow-sm hover:shadow transition-all duration-200"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Name
                  </Label>
                  <Input
                    value={ref.name}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "references",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Position
                  </Label>
                  <Input
                    value={ref.position}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "references",
                        index,
                        "position",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="Engineering Manager"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={ref.email}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "references",
                        index,
                        "email",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <Label className="text-[#393E46] font-medium block mb-1.5">
                    Phone
                  </Label>
                  <Input
                    value={ref.phone}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "references",
                        index,
                        "phone",
                        e.target.value
                      )
                    }
                    className="rounded-lg border-[#00ADB5]/30 focus:border-[#00ADB5] h-11"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
              </div>
              {index > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newReferences = [...(formData.references || [])];
                    newReferences.splice(index, 1);
                    setFormData({ ...formData, references: newReferences });
                  }}
                  className="rounded-lg mt-2 hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove Reference
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                references: [
                  ...(formData.references || []),
                  { name: "", position: "", email: "", phone: "" },
                ],
              });
            }}
            className="rounded-lg bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Save Button */}
      <div className="flex justify-end mt-10">
        <Button
          type="submit"
          className="w-full sm:w-auto bg-gradient-to-r from-[#00ADB5] to-[#089DA6] hover:from-[#089DA6] hover:to-[#00ADB5] text-white font-semibold rounded-xl px-8 py-3 shadow-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
        >
          Save Profile
        </Button>
      </div>
    </form>
  );
}
