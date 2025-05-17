export interface Profile {
    userId: string;  // Reference to the User
    profilePhoto?: string;  // Base64 encoded image or URL
    name?: string;
    gender?: string;
    dob?: string;
    contact?: {
      email?: string;
      phone?: string;
      address?: {
        city?: string;
        state?: string;
        country?: string;
      };
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    careerObjective?: string;
    education?: Array<{
      degree?: string;
      university?: string;
      location?: string;
      startYear?: number;
      endYear?: number;
    }>;
    workExperience?: Array<{
      jobTitle?: string;
      companyName?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      responsibilities?: string[];
    }>;
    projects?: Array<{
      projectTitle?: string;
      projectLink?: string;
      shortDescription?: string;
      technologiesUsed?: string[];
    }>;
    technicalSkills?: {
      programmingLanguages?: string[];
      frameworksLibraries?: string[];
      toolsSoftwares?: string[];
      cloudPlatforms?: string[];
      databases?: string[];
    };
    certificationsCourses?: Array<{
      courseName?: string;
      issuingOrganization?: string;
      completionDate?: string;
    }>;
    languagesKnown?: string[];
    interests?: string[];
    references?: Array<{
      name?: string;
      position?: string;
      email?: string;
      phone?: string;
    }>;
    skills?: Array<{
      name: string;
      level: string;
      category: string;
    }>;
  }