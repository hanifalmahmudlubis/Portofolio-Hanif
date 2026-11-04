import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import type { Technology } from "@/types/project";
import { buildSkillGroups } from "@/lib/skills";
export default function Skills({
  technologies,
}: {
  technologies: Technology[];
}) {
  const groups = buildSkillGroups(technologies).filter(
    (group) => group.skills.length,
  );
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
