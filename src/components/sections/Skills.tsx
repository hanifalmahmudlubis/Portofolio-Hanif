import {
  BrainCircuit,
  Code,
  Database,
  Layers,
  Network,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import BarChart from "../charts/BarChart";
import type { Project, Technology } from "@/types/project";
import { buildSkillGroups } from "@/lib/skills";
import { technologyUsage } from "@/lib/insights";

const icons: Record<string, LucideIcon> = {
  web: Code,
  mobile: Smartphone,
  databases: Database,
  machine: BrainCircuit,
  network: Network,
  tools: Wrench,
  other: Layers,
};

const words = (title: string) =>
  title.toLowerCase().match(/[a-z0-9]+/g) ?? ["skills"];
const fileName = (title: string) => `${words(title).join("-")}.ts`;
const variable = (title: string) =>
  words(title)
    .map((word, i) => (i ? word[0].toUpperCase() + word.slice(1) : word))
    .join("");

/** Skill groups drawn as small code-editor windows: a typed array per group. */
export default function Skills({
  technologies,
  projects = [],
}: {
  technologies: Technology[];
  projects?: Project[];
}) {
  const groups = buildSkillGroups(technologies).filter(
    (group) => group.skills.length,
  );
  const usage = technologyUsage(projects);
  return (
    <section id="skills" className="section">
      <Container>
        <SectionHeading index="03" title="Skills" />
        <div className="skills-layout">
          {!!usage.length && (
            <Reveal from="up" className="panel">
              <BarChart
                title="Most used in projects"
                data={usage}
                unit={["project", "projects"]}
              />
            </Reveal>
          )}
          <div className="skills-grid">
            {groups.map((group, index) => {
              const Icon = icons[group.key] ?? Layers;
              return (
                <Reveal
                  key={group.title}
                  from="up"
                  delay={(index % 2) * 0.06}
                  className="skill-editor"
                >
                  <div className="skill-editor-bar">
                    <span className="browser-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="skill-editor-file" aria-hidden="true">
                      <Icon size={13} strokeWidth={2} />
                      {fileName(group.title)}
                    </span>
                  </div>
                  <div className="skill-editor-body">
                    <h3 className="skill-editor-title">
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      {group.title}
                      <span>
                        {String(group.skills.length).padStart(2, "0")}
                      </span>
                    </h3>
                    <div className="skill-code">
                      <p className="skill-line" aria-hidden="true">
                        <span className="code-keyword">const</span>{" "}
                        <span className="code-name">
                          {variable(group.title)}
                        </span>{" "}
                        = [
                      </p>
                      <ul className="skill-line skill-tokens">
                        {group.skills.map((skill) => (
                          <li key={skill} className="code-string">
                            {skill}
                          </li>
                        ))}
                      </ul>
                      <p className="skill-line" aria-hidden="true">
                        ];
                      </p>
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
