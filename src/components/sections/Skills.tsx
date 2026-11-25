import {
  Code2,
  Database,
  BrainCircuit,
  Network,
  Smartphone,
  Wrench,
  Boxes,
} from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import type { Technology } from "@/types/project";
import { buildSkillGroups } from "@/lib/skills";

const ICONS = {
  web: Code2,
  mobile: Smartphone,
  databases: Database,
  machine: BrainCircuit,
  network: Network,
  tools: Wrench,
  other: Boxes,
};
const RINGS = 3;

export default function Skills({
  technologies,
}: {
  technologies: Technology[];
}) {
  const groups = buildSkillGroups(technologies).filter(
    (group) => group.skills.length,
  );
  const all = groups.flatMap((group) => group.skills);
  // spread skills over 3 orbit rings (decorative; the cards below are the readable list)
  const rings = Array.from({ length: RINGS }, (_, r) =>
    all.filter((_, i) => i % RINGS === r).slice(0, 7),
  );

  return (
    <section id="skills" className="section">
      <Container>
        <SectionHeading title="Skills" from="up" />
        <div className="skills-layout">
          <div className="skill-orbit" aria-hidden="true">
            <div className="orbit-plane">
              {rings.map((ring, r) => (
                <div
                  key={r}
                  className="orbit-ring"
                  style={{ "--r": r } as React.CSSProperties}
                >
                  {ring.map((skill, i) => (
                    <span
                      key={skill}
                      className="orbit-slot"
                      style={
                        {
                          "--a": `${(360 / ring.length) * i}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <span className="orbit-chip">{skill}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="orbit-core">{"</>"}</div>
          </div>
          <div className="skills-grid">
            {groups.map((group, g) => {
              const Icon = ICONS[group.key as keyof typeof ICONS] ?? Boxes;
              return (
                <Reveal
                  key={group.title}
                  from="up"
                  delay={g * 0.06}
                  className="h-full"
                >
                  <div className="skill-card">
                    <h3 className="skill-title">
                      <span className="skill-icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      {group.title}
                      <span className="skill-count" aria-hidden="true">
                        {group.skills.length}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill, i) => (
                        <span
                          key={skill}
                          className="tag"
                          style={{ "--i": i } as React.CSSProperties}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
