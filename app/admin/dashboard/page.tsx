import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { prisma } from "@/lib/prisma";


export default async function Dashboard(){


const projectCount =
await prisma.project.count();



const experienceCount =
await prisma.experience.count();



const certificateCount =
await prisma.certificate.count();



const messageCount =
await prisma.contactMessage.count();



return (

<div className="
flex
min-h-screen
bg-black
">


<div className="
flex-1
">

<main className="
p-8
text-white
">


<h1 className="
text-3xl
font-bold
mb-2
">
Welcome back, Hanif 👋
</h1>


<p className="
text-zinc-400
mb-8
">
Manage your portfolio content here.
</p>



<div className="
grid
grid-cols-1
md:grid-cols-4
gap-5
">


<Card
title="Projects"
value={projectCount}
/>


<Card
title="Experience"
value={experienceCount}
/>


<Card
title="Certificates"
value={certificateCount}
/>


<Card
title="Messages"
value={messageCount}
/>


</div>


</main>


</div>


</div>

)

}




function Card({
title,
value
}:{
title:string;
value:number;
}){


return(

<div className="
bg-zinc-900
border
border-white/10
rounded-xl
p-6
">


<p className="
text-zinc-400
text-sm
">
{title}
</p>


<h2 className="
text-4xl
font-bold
mt-3
">
{value}
</h2>


</div>

)

}