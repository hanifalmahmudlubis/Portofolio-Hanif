import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import Scene3D from "../ui/Scene3D";
import SplitText from "../ui/SplitText";
import { initialPublicProfile } from "@/lib/site";
import type { PublicProfile } from "@/types/cv";

/** Intro below the opening screen: role, bio, actions and CV numbers. */
export default function Hero({
  profile = initialPublicProfile,
  stats = [],
}: {
  profile?: PublicProfile;
  stats?: { label: string; value: string }[];
}) {
  return (
    <section id="intro" className="hero-section">
      <Scene3D variant="light" />
      <div className="hero-veil" aria-hidden="true" />
      <Container className="relative">
        <div className="hero-grid">
          <div className="hero-copy">
            <Reveal from="fade">
              <span className="eyebrow">Intro</span>
            </Reveal>
            <Reveal from="up" delay={0.06}>
              <h2 className="intro-title">
                <SplitText text="Web" />{" "}
                <em>
                  <SplitText
                    text="Developer"
                    delay={0.12}
                    gradient={["#8b6544", "#1a1310"]}
                  />
                </em>
              </h2>
              <p className="hero-role">
                <span>{profile.professionalTitle}</span>
                <span>{profile.location}</span>
              </p>
              <p className="hero-description">{profile.shortBio}</p>
            </Reveal>
            <Reveal from="up" delay={0.14} className="hero-actions">
              <a href="#projects" className="button button-primary">
                Explore projects <ArrowUpRight size={18} />
              </a>
              <a href="#contact" className="button button-secondary">
                Contact me
              </a>
            </Reveal>
            <Reveal from="fade" delay={0.2} className="hero-socials">
              <a
                href={profile.githubUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repositories"
                className="social-link"
              >
                <Github size={18} />
                GitHub
              </a>
              <a
                href={profile.linkedinUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="social-link"
              >
                <Linkedin size={18} />
                LinkedIn
              </a>
            </Reveal>
          </div>
          {!!stats.length && (
            <Reveal from="up" delay={0.12}>
              <dl className="intro-stats">
                {stats.map((item) => (
                  <div key={item.label} className="intro-stat">
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
