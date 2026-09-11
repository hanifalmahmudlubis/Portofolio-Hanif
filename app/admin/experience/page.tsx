import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "./DeleteButton";


export default async function ExperiencePage(){


const experiences =
await prisma.experience.findMany({

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
max-w-5xl
mx-auto
">



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

Experience

</h1>


<p className="
text-zinc-400
mt-2
">

Manage your work experience

</p>


</div>



<Link

href="/admin/experience/new"

className="
bg-white
text-black
px-5
py-3
rounded-xl
font-semibold
"

>

+ Add Experience

</Link>


</div>





<div className="
space-y-4
">


{
experiences.map((item)=>(


<div

key={item.id}

className="
bg-zinc-900
border
border-white/10
rounded-xl
p-6
"

>


<div className="
flex
justify-between
items-start
">


<div>


<h2 className="
text-xl
font-semibold
">

{item.position}

</h2>


<p className="
text-zinc-400
">

{item.company}

</p>


<p className="
text-sm
text-zinc-500
mt-2
">

{item.startDate}
{" - "}
{item.endDate ?? "Present"}

</p>


</div>




<Link

href={`/admin/experience/${item.id}`}

className="
px-4
py-2
border
border-white/10
rounded-lg
hover:bg-white
hover:text-black
transition
"

>

Edit

<DeleteButton

id={item.id}

/>
</Link>




</div>





<p className="
text-zinc-300
mt-5
">

{item.description}

</p>



</div>


))

}



</div>



</div>


</div>


)

}