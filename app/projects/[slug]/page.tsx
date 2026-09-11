import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import ProjectSlider from "@/components/projects/ProjectSlider";


export default async function ProjectDetailPage({

params

}:{

params:Promise<{
slug:string
}>

}){


const {slug}=await params;



const project = await prisma.project.findUnique({

where:{
slug
},

include:{

images:{
orderBy:{
displayOrder:"asc"
}
},

technologies:{
include:{
technology:true
}
}

}

});




if(!project){

notFound();

}




return (


<main className="
min-h-screen
bg-[#050505]
text-white
overflow-hidden
">



{/* HERO */}


<section className="
pt-32
pb-20
">

<div className="
max-w-6xl
mx-auto
px-6
">



<div className="
max-w-4xl
">


<p className="
uppercase
tracking-[0.35em]
text-sm
text-indigo-400
font-medium
">

{project.category}

</p>



<h1 className="
mt-6
text-4xl
md:text-6xl
font-bold
leading-tight
">

{project.title}

</h1>



<p className="
mt-6
text-lg
md:text-xl
text-zinc-400
leading-relaxed
">

{project.shortDescription}

</p>



</div>



</div>

</section>







{/* INFO */}


<section>

<div className="
max-w-6xl
mx-auto
px-6
grid
grid-cols-1
sm:grid-cols-3
gap-5
">


<InfoCard

title="Category"

value={project.category}

/>



<InfoCard

title="Type"

value={project.projectType}

/>



<InfoCard

title="Year"

value={String(project.year)}

/>


</div>


</section>








{/* CONTENT */}



<section className="
max-w-6xl
mx-auto
px-6
mt-24
space-y-20
">





<ContentBlock

number="01"

title="About Project"

content={project.fullDescription}

/>






{

project.problem &&

<ContentBlock

number="02"

title="Problem"

content={project.problem}

/>

}







{

project.solution &&

<ContentBlock

number="03"

title="Solution"

content={project.solution}

/>

}





</section>









{/* TECHNOLOGY */}



{

project.technologies.length >0 &&

<section className="
max-w-6xl
mx-auto
px-6
mt-24
">


<h2 className="
text-3xl
font-bold
mb-8
">

Technology

</h2>




<div className="
flex
flex-wrap
gap-3
">


{

project.technologies.map(item=>(


<div

key={item.technology.id}

className="
px-5
py-3
rounded-full
bg-white/5
border
border-white/10
text-sm
"

>

{item.technology.name}


</div>


))

}


</div>


</section>


}








{/* IMAGE */}



{

project.images.length >0 &&


<section className="
max-w-7xl
mx-auto
px-6
mt-28
pb-32
">


<div className="
mb-10
">


<p className="
text-indigo-400
tracking-[0.3em]
uppercase
text-sm
">

Preview

</p>



<h2 className="
text-4xl
font-bold
mt-3
">

Project Screenshots

</h2>


</div>





<ProjectSlider

images={project.images.map(img=>({

id:img.id,

imageUrl:img.imageUrl

}))}

/>






</section>


}




</main>


)

}








function InfoCard({

title,

value

}:{

title:string;

value:string;

}){


return (

<div className="
rounded-3xl
border
border-white/10
bg-white/[0.04]
p-6
backdrop-blur
">


<p className="
text-sm
text-zinc-500
">

{title}

</p>



<p className="
mt-3
font-semibold
text-lg
">

{value}

</p>



</div>

)

}








function ContentBlock({

number,

title,

content

}:{

number:string;

title:string;

content:string;

}){


return (

<div className="
grid
md:grid-cols-[100px_1fr]
gap-6
">


<div className="
text-indigo-400
font-bold
text-xl
">

{number}

</div>




<div>


<h2 className="
text-3xl
font-bold
">

{title}

</h2>



<p className="
mt-5
text-zinc-300
leading-relaxed
whitespace-pre-line
text-lg
">

{content}

</p>



</div>


</div>


)

}