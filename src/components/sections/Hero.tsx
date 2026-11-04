import Image from "next/image";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import { DEFAULT_INTRO_IMAGE, initialPublicProfile } from "@/lib/site";
import type { PublicProfile } from "@/types/cv";
export default function Hero({
  photoUrl = DEFAULT_INTRO_IMAGE,
  profile = initialPublicProfile,
}: {
  photoUrl?: string;
  profile?: PublicProfile;
}) {
  const words = profile.fullName.split(/\s+/);
  return (
    <section id="intro" className="hero-section">
      <Container className="relative">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">
              <Reveal as="span" from="left" delay={0.08} repeat>
                {words.slice(0, 2).join(" ")}
              </Reveal>{" "}
              <Reveal
                as="span"
                from="right"
                delay={0.2}
                repeat
                className="hero-name-accent"
              >
                {words.slice(2).join(" ")}
              </Reveal>
            </h1>
            <Reveal from="up" delay={0.32}>
              <p className="hero-role">{profile.professionalTitle}</p>
            </Reveal>
            <p className="hero-description">
              {profile.shortBio}
              <span className="block mt-3">{profile.educationLine}</span>
            </p>
            <Reveal from="fade" delay={0.4} className="hero-actions">
              <a href="#projects" className="button button-primary">
                Explore projects <ArrowUpRight size={18} />
              </a>
              <a href="#contact" className="button button-secondary">
                Contact me
              </a>
            </Reveal>
            <div className="hero-socials">
              <a
                href={profile.githubUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repositories"
                className="social-link"
              >
                <Github size={17} />
                GitHub
              </a>
              <a
                href={profile.linkedinUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="social-link"
              >
                <Linkedin size={17} />
                LinkedIn
              </a>
            </div>
          </div>
          <Reveal from="fade" delay={0.24} className="hero-photo-wrap">
            <div className="portrait-frame">
              <div className="hero-portrait">
                <Image
                  src={photoUrl}
                  alt={profile.fullName}
                  fill
                  preload
                  sizes="(max-width: 767px) 320px, (max-width: 1023px) 300px, 380px"
                />
              </div>
              <div className="portrait-caption">
                <span>{profile.location}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
