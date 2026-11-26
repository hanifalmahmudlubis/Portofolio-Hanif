import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import Scene3D from "@/components/ui/Scene3D";
import SplitText from "@/components/ui/SplitText";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="status-page">
        <Scene3D variant="light" className="opacity-80" />
        <div className="container">
          <Reveal from="up">
            <p className="status-code">404</p>
            <h1 className="section-title mt-4">
              <SplitText text="Page not found" />
            </h1>
            <p className="muted mt-4">This page is unavailable.</p>
            <Link href="/projects" className="button button-primary mt-8">
              View projects
            </Link>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
