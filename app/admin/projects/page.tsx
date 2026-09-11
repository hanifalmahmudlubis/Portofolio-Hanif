import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Trash2, Pencil, Plus } from "lucide-react";
import DeleteButton from "./DeleteButton";


export default async function ProjectsPage(){


const projects = await prisma.project.findMany({

orderBy:{
  createdAt:"desc"
}

});



return (

<div className="
min-h-screen
bg-black
text-white
p-8
">


<div className="
max-w-6xl
mx-auto
">



{/* HEADER */}

<div className="
flex
justify-between
items-center
mb-10
">


<div>

<h1 className="
text-3xl
font-bold
">

Projects

</h1>


<p className="
text-zinc-400
mt-2
">

Manage your portfolio projects

</p>


</div>





<Link

href="/admin/projects/new"

className="
flex
items-center
gap-2
bg-white
text-black
px-5
py-3
rounded-xl
font-semibold
hover:scale-105
transition
"

>

<Plus size={18}/>

Add Project

</Link>



</div>





{/* TABLE */}


<div className="
rounded-2xl
border
border-white/10
overflow-hidden
bg-zinc-950
">


<table className="
w-full
">


<thead className="
bg-zinc-900
border-b
border-white/10
">


<tr>


<th className="
p-5
text-left
text-zinc-400
font-medium
">

Project

</th>


<th className="
p-5
text-left
text-zinc-400
font-medium
">

Category

</th>


<th className="
p-5
text-left
text-zinc-400
font-medium
">

Year

</th>


<th className="
p-5
text-left
text-zinc-400
font-medium
">

Status

</th>


<th className="
p-5
text-left
text-zinc-400
font-medium
">

Action

</th>


</tr>


</thead>




<tbody>



{
projects.map((project)=>(


<tr

key={project.id}

className="
border-b
border-white/10
hover:bg-white/5
transition
"

>



<td className="
p-5
">


<div>

<h2 className="
font-semibold
">

{project.title}

</h2>


<p className="
text-sm
text-zinc-500
mt-1
">

{project.projectType}

</p>


</div>


</td>






<td className="
p-5
text-zinc-300
">

{project.category}

</td>





<td className="
p-5
">

{project.year}

</td>





<td className="
p-5
">


{
project.published

?

<span className="
px-3
py-1
rounded-full
text-xs
bg-green-500/20
text-green-400
">

Published

</span>


:

<span className="
px-3
py-1
rounded-full
text-xs
bg-yellow-500/20
text-yellow-400
">

Draft

</span>

}



</td>







<td className="
p-5
">


<div className="
flex
gap-3
">



<Link

href={`/admin/projects/${project.id}`}

className="
flex
items-center
gap-2
px-4
py-2
rounded-lg
border
border-white/10
hover:bg-white
hover:text-black
transition
"

>


<Pencil size={15}/>

Edit


</Link>






<DeleteButton

id={project.id}

/>



</div>


</td>




</tr>


))

}



</tbody>



</table>



</div>




</div>


</div>


)


}