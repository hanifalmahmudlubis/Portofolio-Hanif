"use client";
import { useState } from "react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import { api, errorMessage } from "@/lib/api-client";
import { site } from "@/lib/site";
import { Github, Linkedin } from "lucide-react";
export default function Contact() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      form.reset();
      setSent(true);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="contact" className="section">
      <Container>
        <div className="contact-layout">
          <Reveal from="left" repeat className="contact-copy">
            <h2 className="section-title">Contact</h2>
            <p className="contact-description">
              For projects and work opportunities
            </p>
            <a href={`mailto:${site.email}`} className="contact-email">
              <span>{site.email}</span>
            </a>
            <div className="contact-socials">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Github size={17} /> GitHub
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Linkedin size={17} /> LinkedIn
              </a>
            </div>
          </Reveal>
          <Reveal from="up" delay={0.12}>
            {sent ? (
              <div role="status" className="contact-form contact-success">
                <h3 className="text-xl">Message received</h3>
                <p className="muted mt-3 text-sm">
                  Thank you, I’ll reply by email
                </p>
                <button
                  className="button button-secondary mt-6"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="contact-form space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="field">
                    Your name
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={100}
                      placeholder="Name"
                    />
                  </label>
                  <label className="field">
                    Email address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <label className="field">
                  Subject
                  <input
                    name="subject"
                    required
                    maxLength={200}
                    placeholder="Subject"
                  />
                </label>
                <label className="field">
                  Your message
                  <textarea
                    name="message"
                    rows={4}
                    required
                    maxLength={5000}
                    placeholder="Message"
                  />
                </label>
                <div className="hidden" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                {error && (
                  <p className="notice notice-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  disabled={busy}
                  className="button button-primary w-full"
                >
                  {busy ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
