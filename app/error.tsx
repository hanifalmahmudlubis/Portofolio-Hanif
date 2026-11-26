"use client";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="status-page min-h-screen">
      <div className="container">
        <Reveal from="up">
          <p className="status-code">Oops</p>
          <h1 className="section-title mt-4">
            <SplitText text="Unable to load this page" />
          </h1>
          <p className="muted mt-4">Please try again.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={reset} className="button button-primary">
              Try again
            </button>
            <Link href="/" className="button button-secondary">
              Home
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
