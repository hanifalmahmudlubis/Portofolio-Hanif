import type { CvDocumentData } from "../src/types/cv";

export function cvFixture(): CvDocumentData {
  return {
    profile: {
      fullName: "CV Test Engineer",
      professionalTitle: "Software Engineer",
      shortBio: "Building useful software",
      summary:
        "Software engineer with experience building web applications, designing reliable APIs, and collaborating with product teams.",
      location: "Medan, Indonesia",
      email: "cv@example.test",
      phone: "+6281200000000",
      linkedinUrl: "https://www.linkedin.com/in/cv-test",
      githubUrl: "https://github.com/cv-test",
      portfolioUrl: "https://example.test/",
    },
    education: [
      {
        id: "education",
        institution: "Example Institute",
        degree: "Bachelor of Engineering",
        major: "Software Engineering",
        location: "Medan",
        startDate: "2020-08",
        endDate: "2024-09",
        gpa: "3.71/4.00",
      },
    ],
    softSkills: ["Communication", "Teamwork"],
    languages: [{ name: "Indonesian", proficiency: "Native" }],
    preferences: {
      includePhoto: false,
      excludedProjectIds: [],
      excludedExperienceIds: [],
      excludedCertificateIds: [],
    },
    skillGroups: [
      { key: "web", title: "Web development", skills: ["TypeScript", "React"] },
    ],
    experiences: [
      {
        id: "experience",
        company: "Example Company",
        position: "Software Engineer",
        location: "Medan",
        employmentType: "Full-time",
        startDate: "2024-10",
        endDate: null,
        responsibilities: [
          "Built reliable APIs and improved the publishing workflow.",
        ],
      },
    ],
    projects: [
      {
        id: "project",
        title: "Example Project",
        projectType: "Personal Project",
        year: 2026,
        technologies: ["TypeScript"],
        highlights: [
          "Developed a searchable catalog with reusable interfaces.",
        ],
        liveDemoUrl: "https://example.test/project",
      },
    ],
    certificates: [
      {
        id: "certificate",
        title: "Example Certificate",
        issuer: "Example Institute",
        year: "2025",
        issueDate: "2025-04",
        credentialUrl: "https://example.test/certificate",
      },
    ],
  };
}
