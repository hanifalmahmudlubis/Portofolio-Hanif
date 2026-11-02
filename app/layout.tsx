import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ParticleBackground from "@/components/ui/ParticleBackground";
export const metadata: Metadata = {
  title: {
    default: "Hanif Al Mahmud Lubis — Software Engineer",
    template: "%s | Hanif Al Mahmud Lubis",
  },
  description:
    "Software engineering portfolio of Hanif Al Mahmud Lubis. Explore projects in web development, mobile applications, and machine learning.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ParticleBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
