import Link from "next/link";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import { initialPublicProfile } from "@/lib/site";
import type { PublicProfile } from "@/types/cv";
import { ArrowUp } from "lucide-react";

const SLOGAN = ["Let's build the web", "Design", "Develop", "Deploy"];

export default function Footer({
  profile = initialPublicProfile,
}: {
  profile?: PublicProfile;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee-track">
          {[...SLOGAN, ...SLOGAN, ...SLOGAN, ...SLOGAN].map((word, i) => (
            <span key={i}>
              {word}
              <b>✦</b>
            </span>
          ))}
        </div>
      </div>
      <Container>
        <Reveal className="flex flex-wrap items-center justify-between gap-5">
          <p className="text-xs text-[#8996ad]">
            © {new Date().getFullYear()} {profile.fullName} ·{" "}
            <span className="font-code">built with Next.js</span>
          </p>
          <div className="flex gap-6 text-xs text-[#9ba6ba]">
            <a
              href={profile.githubUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              GitHub
            </a>
            <a
              href={profile.linkedinUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              LinkedIn
            </a>
            <Link href="/#contact" className="hover:text-primary">
              Contact
            </Link>
            <a
              href="#main"
              className="footer-top magnetic"
              aria-label="Back to top"
            >
              <ArrowUp size={17} />
            </a>
          </div>
        </Reveal>
      </Container>
    </footer>
  );
}
