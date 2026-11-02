import Image from "next/image";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import { DEFAULT_INTRO_IMAGE, site } from "@/lib/site";
export default function Hero({
  photoUrl = DEFAULT_INTRO_IMAGE,
}: {
  photoUrl?: string;
}) {
  return (
    <section id="intro" className="hero-section">
      <Container>
        <div className="hero-grid">
          <Reveal>
            <h1 className="hero-title">Hanif Al Mahmud Lubis</h1>
            <p className="hero-role mt-5">Software Engineering Graduate</p>
            <p className="muted mt-7 max-w-xl text-lg leading-relaxed">
              Software Engineering graduate from Politeknik Negeri Medan,
              building web applications, mobile experiences, and machine
              learning solutions
            </p>
            <p className="mt-4 text-sm text-[#9ba6ba]">Medan, Indonesia</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#projects" className="button button-primary">
                View projects <ArrowUpRight size={16} />
              </a>
              <a href="#contact" className="button button-secondary">
                Contact me
              </a>
            </div>
            <div className="mt-9 flex items-center gap-6">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repositories"
                className="social-link"
              >
                <Github size={17} />
                GitHub
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="social-link"
              >
                <Linkedin size={17} />
                LinkedIn
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.12} className="hero-photo-wrap">
            <div className="hero-portrait">
              <Image
                src={photoUrl}
                alt="Hanif Al Mahmud Lubis"
                fill
                priority
                sizes="(max-width: 767px) 320px, 380px"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
