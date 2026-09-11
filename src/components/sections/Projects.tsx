import Container from "../ui/Container";
import ProjectCard from "../projects/ProjectCard";
import { Project } from "@/types/project";
import { prisma } from "@/lib/prisma";


async function getProjects(){

  const projects = await prisma.project.findMany({

    where:{
      published:true
    },

    include:{
      images:true,
      technologies:{
        include:{
          technology:true
        }
      }

    },

    orderBy:{
      displayOrder:"asc"
    }

  });


  return projects;

}





export default async function Projects(){


const projects = await getProjects() as unknown as Project[];




return (

<section
id="projects"

className="
bg-[#09090B]
py-32
text-white
"
>


<Container>


<div
className="
max-w-3xl
"
>


<p
className="
text-sm
uppercase
tracking-[0.3em]
text-indigo-400
"
>

Projects

</p>




<h2
className="
mt-5
text-4xl
md:text-5xl
font-bold
"
>

Featured Engineering Work

</h2>





<p
className="
mt-5
text-zinc-400
"
>

A collection of projects involving
software engineering, machine learning,
and digital solutions.

</p>


</div>






<div

className="
mt-16
grid
gap-8
md:grid-cols-2
"

>


{
projects.map((project)=>(

<ProjectCard

key={project.id}

project={project}

/>

))
}


</div>


</Container>


</section>

)

}