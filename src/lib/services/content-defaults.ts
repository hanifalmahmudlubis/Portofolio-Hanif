import "server-only";
import type { ContentSettings } from "../../types/cv";
import { site } from "../site";

// Existing website values take precedence. Only missing CV details come from the supplied resume.
export const defaultContent: ContentSettings = {
  profile: {
    fullName: site.name,
    professionalTitle: "Software Engineering Graduate",
    shortBio:
      "Building practical solutions through web, mobile, and machine learning",
    summary:
      "Graduate of Politeknik Negeri Medan with a Diploma IV degree in Software Engineering Technology, with practical understanding and hands on experience in web application development, mobile application development, database management, machine learning and network. Experienced in working on various technology related projects and familiar with learning and applying new technologies. Possesses good problem solving, communication, teamwork, and adaptability skills, with a strong willingness to continuously develop technical skills in the field of information technology.",
    location: "Medan, Indonesia",
    email: site.email,
    phone: "6281328581353",
    linkedinUrl: site.linkedin,
    githubUrl: site.github,
    portfolioUrl: "https://portofolio-hanif-gilt.vercel.app/",
  },
  education: [
    {
      id: "polmed",
      institution: "Politeknik Negeri Medan",
      degree: "Bachelor of Software Engineering Technology",
      major: "Software Engineering Technology",
      location: "Medan, Indonesia",
      startDate: "2022-08",
      endDate: "2026-09",
      gpa: "3.71/4.00",
    },
  ],
  softSkills: [
    "Problem Solving",
    "Communication",
    "Teamwork",
    "Leadership",
    "Adaptability",
  ],
  languages: [
    { name: "Indonesian", proficiency: "Native" },
    { name: "English", proficiency: "Intermediate" },
  ],
  preferences: {
    includePhoto: false,
    excludedProjectIds: [],
    excludedExperienceIds: [],
    excludedCertificateIds: [],
  },
};
