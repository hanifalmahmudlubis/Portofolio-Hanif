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
          <p className="mb-4 text-sm text-primary">404</p>
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
