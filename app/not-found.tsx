import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="container flex min-h-[65vh] items-center justify-center py-20 text-center"
      >
        <Reveal>
          <p className="glitch-404" data-text="404" aria-hidden="true">
            404
          </p>
          <p className="section-cmd justify-center" aria-hidden="true">
            <span>$</span> cd ./this-page — no such file or directory
          </p>
          <h1 className="section-title">Page not found</h1>
          <p className="muted mt-4 text-sm">This page is unavailable.</p>
          <Link href="/projects" className="button button-primary mt-7">
            View projects
          </Link>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
