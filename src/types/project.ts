export interface ProjectImage {
  id: string;
  imageUrl: string;
  caption?: string | null;
  isThumbnail: boolean;
  displayOrder: number;
}
export interface Technology {
  id: string;
  name: string;
  category: string;
  skillGroup?: string | null;
  skillOrder?: number;
  showInSkills?: boolean;
}
export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  projectType: string;
  year: number;
  problem: string | null;
  solution: string | null;
  cvHighlights?: string[];
  githubUrl: string | null;
  liveDemoUrl: string | null;
  published: boolean;
  featured: boolean;
  displayOrder: number;
  images: ProjectImage[];
  technologies: { technology: Technology }[];
}
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  employmentType?: string | null;
  responsibilities?: string[];
  images: { id: string; url: string }[];
}
export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: string;
  issueDate?: string | null;
  credentialUrl: string | null;
}
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
