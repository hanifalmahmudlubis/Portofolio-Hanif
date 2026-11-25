import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Certificate from "@/components/sections/Certificate";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import { getPortfolio } from "@/lib/services/portfolio";
export const dynamic = "force-dynamic";
export default async function Home() {
  const data = await getPortfolio();
  return (
    <>
      <Header profile={data.profile} />
      <main id="main">
        <Hero photoUrl={data.introImageUrl} profile={data.profile} />
        <Projects projects={data.projects} />
        <Experience experiences={data.experiences} />
        <Skills technologies={data.technologies} />
        <Certificate certificates={data.certificates} />
        <Contact profile={data.profile} />
      </main>
      <Footer profile={data.profile} />
    </>
  );
}
