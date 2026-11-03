import Link from "next/link";
import Container from "./ui/Container";
import Reveal from "./ui/Reveal";
import { site } from "@/lib/site";
import { ArrowUp } from "lucide-react";
export default function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <Reveal className="flex flex-wrap items-center justify-between gap-5">
          <p className="text-xs text-[#8996ad]">
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex gap-6 text-xs text-[#9ba6ba]">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              GitHub
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              LinkedIn
            </a>
            <Link href="/#contact" className="hover:text-primary">
              Contact
            </Link>
            <a href="#main" className="footer-top" aria-label="Back to top">
              <ArrowUp size={17} />
            </a>
          </div>
        </Reveal>
      </Container>
    </footer>
  );
}
