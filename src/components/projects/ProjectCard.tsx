"use client";


import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Github
} from "lucide-react";


import { Project } from "@/types/project";


interface ProjectProps {
  project: Project;
}



export default function ProjectCard({
project
}:ProjectProps){


return (

<motion.article

initial={{
opacity:0,
y:30
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:0.5
}}

className="
group
relative

overflow-hidden

rounded-3xl

border

border-white/10

bg-white/[0.04]

p-8

backdrop-blur-xl

transition

hover:-translate-y-2

hover:border-indigo-400/40

"

>


{/* Glow */}

<div
className="
absolute
right-0
top-0
h-40
w-40
rounded-full
bg-indigo-500/10
blur-3xl
"
/>



<div
className="
relative
z-10
"
>


<div
className="
flex
items-center
justify-between
"
>


<span
className="
rounded-full
border
border-indigo-400/20
bg-indigo-400/10

px-3
py-1

text-xs

text-indigo-300
"
>

{project.category}

</span>



<span
className="
text-sm
text-zinc-500
"
>

{project.year}

</span>


</div>





<h3
className="
mt-6

text-2xl

font-semibold

tracking-tight
"
>

{project.title}

</h3>




<p
className="
mt-4

leading-relaxed

text-zinc-400
"
>

{project.shortDescription}

</p>





<div
className="
mt-6

flex

flex-wrap

gap-2
"
>


{
project.technologies.map((item)=>(

<span

key={item.technology.name}

className="
rounded-full

bg-white/5

px-3

py-1

text-xs

text-zinc-300

"

>

{item.technology.name}

</span>


))
}


</div>





<div
className="
mt-8

flex

gap-4
"
>


{
project.githubUrl &&

<a
href={project.githubUrl}

className="
flex
items-center
gap-2

text-sm

text-zinc-300

hover:text-white
"
>

<Github size={16}/>

Code

</a>

}





<a

href={`/projects/${project.slug}`}

className="
flex

items-center

gap-2

text-sm

font-medium

text-white

"

>

View Details

<ArrowUpRight
size={16}
/>


</a>



</div>



</div>



</motion.article>

)

}