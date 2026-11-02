import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import type { Technology } from "@/types/project";
const coreSkills = [
  {
    title: "Web development",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "Java",
      "Laravel",
      "CodeIgniter",
    ],
  },
  { title: "Mobile development", skills: ["Flutter", "Dart"] },
  { title: "Databases", skills: ["SQL", "MySQL"] },
  {
    title: "Machine learning",
    skills: ["Python", "CatBoost", "Scikit-learn", "Pandas", "SHAP"],
  },
  {
    title: "Networking & automation",
    skills: ["Network Troubleshooting", "Cisco", "n8n"],
  },
  { title: "Tools", skills: ["Git", "GitHub", "QGIS", "Figma"] },
];
export default function Skills({
  technologies,
}: {
  technologies: Technology[];
}) {
  const known = new Set(
    coreSkills.flatMap((group) =>
      group.skills.map((skill) => skill.toLowerCase()),
    ),
  );
  const additional = technologies.filter(
    (item) => !known.has(item.name.toLowerCase()),
  );
  const groups = [
    ...coreSkills,
    ...(additional.length
      ? [
          {
            title: "Other technologies",
            skills: additional.map((item) => item.name),
          },
        ]
      : []),
  ];
  return (
    <section id="skills" className="section">
      <Container>
        <SectionHeading title="Technical skills" />
        <div className="grid gap-x-14 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, index) => (
            <Reveal key={group.title} delay={(index % 3) * 0.04}>
              <h3 className="mb-4 text-sm font-medium text-[#c6cfde]">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
