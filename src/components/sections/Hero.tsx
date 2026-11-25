import Image from "next/image";
import { ArrowDown, ArrowUpRight, Github, Linkedin } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import CodeWindow from "../ui/CodeWindow";
import BrowserBar from "../ui/BrowserBar";
import CountUp from "../ui/CountUp";
import RotatingWords from "../ui/RotatingWords";
import { DEFAULT_INTRO_IMAGE, initialPublicProfile } from "@/lib/site";
import type { PublicProfile } from "@/types/cv";

const BUILDS = [
  "websites",
  "web apps",
  "REST APIs",
  "dashboards",
  "mobile apps",
  "ML models",
];

export default function Hero({
  photoUrl = DEFAULT_INTRO_IMAGE,
  profile = initialPublicProfile,
  techNames = [],
  stats = [],
}: {
  photoUrl?: string;
  profile?: PublicProfile;
  techNames?: string[];
  stats?: { label: string; value: number }[];
}) {
  const words = profile.fullName.split(/\s+/);
  return (
    <section id="intro" className="hero-section">
      <Container className="relative">
        <div className="hero-grid">
          <div className="hero-copy">
            <Reveal from="fade" className="hero-status">
              <span className="status-dot" aria-hidden="true" />
              Open to opportunities · {profile.location}
            </Reveal>
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
            <p className="hero-build">
              I build <RotatingWords words={BUILDS} />
            </p>
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
                className="social-link magnetic"
              >
                <Github size={17} />
                GitHub
              </a>
              <a
                href={profile.linkedinUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="social-link magnetic"
              >
                <Linkedin size={17} />
                LinkedIn
              </a>
            </div>
          </div>

          {/* 3D "exploded" web page: html wireframe → css → finished browser → code */}
          <div className="hero-stage">
            <div className="stack3d">
              <div className="layer layer-html" aria-hidden="true">
                <span className="layer-label">index.html</span>
                <div className="wf-nav">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="wf-block" />
                <div className="wf-cards">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="layer layer-css" aria-hidden="true">
                <span className="layer-label">styles.css</span>
                <div className="css-swatches">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <p className="css-type">Aa</p>
              </div>
              <div className="layer layer-app">
                <span className="layer-label" aria-hidden="true">
                  localhost:3000
                </span>
                <div className="hero-browser">
                  <BrowserBar url="hanif.dev" />
                  <div className="hero-portrait">
                    <Image
                      src={photoUrl}
                      alt={profile.fullName}
                      fill
                      preload
                      sizes="(max-width: 767px) 300px, 380px"
                    />
                  </div>
                </div>
              </div>
              <div className="layer layer-code">
                <CodeWindow profile={profile} />
              </div>
            </div>
          </div>
        </div>

        {!!stats.length && (
          <dl className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <dt>{stat.label}</dt>
                <dd>
                  <CountUp value={stat.value} />
                  <span aria-hidden="true">+</span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Container>

      {!!techNames.length && (
        <div className="tech-marquee" aria-hidden="true">
          {[techNames, [...techNames].reverse()].map((row, r) => (
            <div key={r} className={`marquee-row ${r ? "is-reverse" : ""}`}>
              {[...row, ...row].map((name, i) => (
                <span key={i}>
                  {name}
                  <b>✦</b>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      <a
        href="#projects"
        className="scroll-hint"
        aria-label="Scroll to projects"
      >
        <ArrowDown size={16} />
      </a>
    </section>
  );
}
