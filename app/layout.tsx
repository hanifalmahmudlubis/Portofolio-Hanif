import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import TextMotion from "@/components/ui/TextMotion";

const display = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hanif Al Mahmud Lubis — Web Developer",
    template: "%s | Hanif Al Mahmud Lubis",
  },
  authors: [{ name: "Hanif Al Mahmud Lubis" }],
  creator: "Hanif Al Mahmud Lubis",
  publisher: "Hanif Al Mahmud Lubis",
  description:
    "Web developer and software engineering graduate from Politeknik Negeri Medan. Projects in Laravel, PHP, JavaScript, Flutter, and machine learning.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
        <TextMotion />
      </body>
    </html>
  );
}
