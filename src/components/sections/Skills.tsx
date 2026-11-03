import Container from "../ui/Container";
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
  const groups = coreSkills.map((group) => ({
    ...group,
    skills: [...group.skills],
  }));
  const other: string[] = [];
  for (const technology of additional) {
    const category = technology.category.toLowerCase();
    const group = /machine|\bai\b|data science/.test(category)
      ? 3
      : /mobile/.test(category)
        ? 1
        : /database/.test(category)
          ? 2
          : /network|automation/.test(category)
            ? 4
            : /web|framework|programming|language/.test(category)
              ? 0
              : /tool|design|version control/.test(category)
                ? 5
                : -1;
    if (group >= 0) groups[group].skills.push(technology.name);
    else other.push(technology.name);
  }
  if (other.length) groups.push({ title: "Other technologies", skills: other });
  return (
    <section id="skills" className="section">
      <Container>
        <SectionHeading title="Skills" from="up" />
        <div className="skills-grid">
          {groups.map((group) => (
            <div key={group.title} className="skill-card">
              <h3 className="skill-title">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
