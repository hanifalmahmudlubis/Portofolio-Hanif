import Link from "next/link";
import Container from "./ui/Container";
import { initialPublicProfile } from "@/lib/site";
import type { PublicProfile } from "@/types/cv";
import { ArrowUp } from "lucide-react";
export default function Footer({
  profile = initialPublicProfile,
}: {
  profile?: PublicProfile;
}) {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-row">
          <Link href="/" className="brand">
            {profile.fullName.split(" ")[0]}
          </Link>
          <p className="muted text-sm">
            © {new Date().getFullYear()} {profile.fullName}
          </p>
          <div className="footer-links">
            <a
              href={profile.githubUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href={profile.linkedinUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <Link href="/#contact">Contact</Link>
            <a href="#main" className="footer-top" aria-label="Back to top">
              <ArrowUp size={17} />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
