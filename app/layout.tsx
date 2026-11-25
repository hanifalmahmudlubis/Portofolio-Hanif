import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import ParticleBackground from "@/components/ui/ParticleBackground";
const geist = Geist({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${display.variable}`}
    >
      <body>
        <ParticleBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
