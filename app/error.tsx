"use client";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container flex min-h-screen items-center justify-center text-center">
      <Reveal>
        <h1 className="section-title">Unable to load this page</h1>
        <p className="muted mt-4 text-sm">Please try again.</p>
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={reset} className="button button-primary">
            Try again
          </button>
          <Link href="/" className="button button-secondary">
            Home
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
