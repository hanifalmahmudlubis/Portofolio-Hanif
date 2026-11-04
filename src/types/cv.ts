export interface PersonalProfile {
  fullName: string;
  professionalTitle: string;
  shortBio: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export type PublicProfile = Pick<
  PersonalProfile,
  | "fullName"
  | "professionalTitle"
  | "shortBio"
  | "location"
  | "email"
  | "linkedinUrl"
  | "githubUrl"
> & { educationLine: string };

export interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  location: string;
  startDate: string;
  endDate: string | null;
  gpa: string;
}
export interface Language {
  name: string;
  proficiency: string;
}
export interface SkillGroup {
  key: string;
  title: string;
  skills: string[];
}
export interface CvPreferences {
  includePhoto: boolean;
  excludedProjectIds: string[];
  excludedExperienceIds: string[];
  excludedCertificateIds: string[];
}
export interface ContentSettings {
  profile: PersonalProfile;
  education: Education[];
  softSkills: string[];
  languages: Language[];
  preferences: CvPreferences;
}
export interface CvEditorData extends ContentSettings {
  revision: string;
  skillGroups: SkillGroup[];
  sources: {
    projects: { id: string; title: string; year: number }[];
    experiences: {
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate: string | null;
    }[];
    certificates: { id: string; title: string; year: string }[];
  };
}
export interface CvDocumentData extends ContentSettings {
  revision?: string;
  skillGroups: SkillGroup[];
  photo?: string;
  projects: {
    id: string;
    title: string;
    projectType: string;
    year: number;
    technologies: string[];
    highlights: string[];
    liveDemoUrl: string | null;
  }[];
  experiences: {
    id: string;
    company: string;
    position: string;
    location: string | null;
    employmentType: string | null;
    startDate: string;
    endDate: string | null;
    responsibilities: string[];
  }[];
  certificates: {
    id: string;
    title: string;
    issuer: string;
    year: string;
    issueDate: string | null;
    credentialUrl: string | null;
  }[];
}
