export interface User {
  _id?: string;
  name: string;
  gender: string;
  dob: string;
  profilePhotoUrl?: string;
  contact: {
    address: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
  };
  workExperience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects: {
    title: string;
    description: string;
    link?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    startYear: number;
    endYear: number;
    grade: string;
  }[];
  certifications: string[];
  achievements?: string[];
  languagesKnown: string[];
  interests: string[];
  references?: {
    name: string;
    position: string;
    email: string;
    phone: string;
  }[];
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
