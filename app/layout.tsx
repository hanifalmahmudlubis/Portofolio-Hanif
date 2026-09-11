import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import AuthProvider from "@/components/providers/AuthProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Hanif Almahmud Lubis | Software Engineer",
  description:
    "Portfolio website of Hanif Almahmud Lubis - Software Engineer specializing in web development, mobile applications, database systems, and machine learning.",
  keywords:[
    "Software Engineer",
    "Full Stack Developer",
    "Web Development",
    "Machine Learning",
    "Portfolio"
  ],
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (

    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >

      <body
        className="
        min-h-screen
        bg-[#09090B]
        text-white
        antialiased
        "
      >

        <AuthProvider>

          {children}

        </AuthProvider>


      </body>


    </html>

  );

}