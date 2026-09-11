"use client";

import { motion } from "framer-motion";

import {
  Code2,
  Smartphone,
  Database,
  BrainCircuit,
  Network,
  Wrench
} from "lucide-react";

import Container from "../ui/Container";


const skillGroups = [

{
title:"Programming & Web Development",
icon:Code2,
skills:[
"HTML",
"CSS",
"JavaScript",
"PHP",
"Java",
"Laravel",
"CodeIgniter 3 & 4"
]
},


{
title:"Mobile Development",
icon:Smartphone,
skills:[
"Flutter",
"Dart"
]
},


{
title:"Database Management",
icon:Database,
skills:[
"SQL",
"MySQL"
]
},


{
title:"Machine Learning",
icon:BrainCircuit,
skills:[
"Python",
"CatBoost",
"Scikit-learn",
"Pandas",
"SHAP"
]
},


{
title:"Networking & Automation",
icon:Network,
skills:[
"Network Troubleshooting",
"Network Testing",
"Cisco",
"n8n"
]
},


{
title:"Tools",
icon:Wrench,
skills:[
"Git",
"GitHub",
"QGIS",
"Figma",
"CapCut",
"Microsoft Office"
]
}


];



export default function Skills(){


return (

<section

id="skills"

className="
relative
py-32
bg-[#09090B]
text-white
overflow-hidden
"

>


<div

className="
absolute
left-0
top-40
h-[300px]
w-[300px]
rounded-full
bg-indigo-500/10
blur-[120px]
"

/>



<Container>



<motion.div

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

Technical Skills

</p>



<h2

className="
mt-5
text-4xl
md:text-5xl
font-bold
"

>

Technologies & Tools

</h2>



<p

className="
mt-5
text-zinc-400
leading-relaxed
"

>

A collection of technologies and tools
used throughout my academic projects,
internships, and software development journey.

</p>


</motion.div>





<div

className="
mt-16
grid
gap-6
md:grid-cols-2
"

>


{
skillGroups.map((group,index)=>{


const Icon = group.icon;


return (

<motion.div

key={group.title}

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
delay:index*0.08
}}

className="
rounded-3xl
border
border-white/10
bg-white/[0.04]
p-7
backdrop-blur-xl

hover:border-indigo-400/40
transition
"

>


<div

className="
flex
items-center
gap-4
"

>


<div

className="
rounded-2xl
bg-indigo-500/10
p-3
"

>

<Icon

size={24}

className="
text-indigo-400
"

/>

</div>



<h3

className="
text-xl
font-semibold
"

>

{group.title}

</h3>



</div>




<div

className="
mt-6
flex
flex-wrap
gap-3
"

>


{
group.skills.map(skill=>(

<span

key={skill}

className="
rounded-full
border
border-white/10
bg-white/5
px-4
py-2
text-sm
text-zinc-300

hover:bg-white/10
hover:text-white

transition
"

>

{skill}

</span>

))
}


</div>



</motion.div>

)

})

}


</div>



</Container>


</section>

)

}