import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Splash from "@/components/sections/Splash";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Certificate from "@/components/sections/Certificate";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import { getPortfolio } from "@/lib/services/portfolio";
import { getContentSettings } from "@/lib/services/content";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [data, content] = await Promise.all([
    getPortfolio(),
    getContentSettings(),
  ]);
  const gpa = content.education[0]?.gpa.split("/")[0]?.trim();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stats = [
    { label: "Projects", value: pad(data.projects.length) },
    { label: "Experience", value: pad(data.experiences.length) },
    { label: "Certificates", value: pad(data.certificates.length) },
    ...(gpa ? [{ label: "GPA", value: gpa }] : []),
  ];
  return (
    <>
      <Header profile={data.profile} />
      <main id="main">
        <Splash photoUrl={data.introImageUrl} name={data.profile.fullName} />
        <Hero profile={data.profile} stats={stats} />
        <Projects projects={data.projects} />
        <Experience
          experiences={data.experiences}
          education={content.education}
        />
        <Skills technologies={data.technologies} projects={data.projects} />
        <Certificate
          certificates={data.certificates}
          name={data.profile.fullName}
        />
        <Contact profile={data.profile} />
      </main>
      <Footer profile={data.profile} />
    </>
  );
}
