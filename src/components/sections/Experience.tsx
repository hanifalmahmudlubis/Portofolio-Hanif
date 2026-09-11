import { prisma } from "@/lib/prisma";
import Container from "../ui/Container";
import { Briefcase } from "lucide-react";


export default async function Experience(){


const experiences =
await prisma.experience.findMany({

orderBy:{
createdAt:"desc"
}

});



return (

<section

id="experience"

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

Experience

</p>



<h2
className="
mt-5

text-4xl

md:text-5xl

font-bold
"
>

Professional Journey

</h2>



<p
className="
mt-5

text-zinc-400
"
>

A collection of my professional experiences,
internships, and technical journey.

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

experiences.map((item)=>(


<div

key={item.id}

className="
rounded-3xl

border

border-white/10

bg-white/[0.03]

p-8

transition

hover:-translate-y-2

hover:border-indigo-500/40

"

>



<div

className="
flex

items-start

justify-between

"

>


<div>


<h3
className="
text-xl

font-semibold

"

>

{item.position}

</h3>



<p
className="
mt-2

text-indigo-400

font-medium
"
>

{item.company}

</p>


</div>



<div

className="
w-12

h-12

rounded-2xl

bg-indigo-500/10

flex

items-center

justify-center

text-indigo-400

"

>

<Briefcase size={22}/>

</div>



</div>






<div

className="
mt-6

inline-flex

rounded-full

border

border-white/10

bg-white/5

px-4

py-2

text-sm

text-zinc-400

"

>

{item.startDate}
{" - "}
{item.endDate ?? "Present"}

</div>






{

item.location && (

<p

className="
mt-5

text-sm

text-zinc-500

"

>

📍 {item.location}

</p>

)

}






<p

className="
mt-6

text-zinc-300

leading-relaxed

"

>

{item.description}

</p>





</div>



))


}




</div>





</Container>


</section>


)

}