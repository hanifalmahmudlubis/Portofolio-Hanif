import { prisma } from "@/lib/prisma";
import Container from "../ui/Container";
import { Award, ExternalLink } from "lucide-react";



export default async function Certificate(){


const certificates =
await prisma.certificate.findMany({

orderBy:{
createdAt:"desc"
}

});




return (

<section

id="certificates"

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

Certificates

</p>




<h2

className="
mt-5

text-4xl

md:text-5xl

font-bold

"

>

Professional Achievements

</h2>




<p

className="
mt-5

text-zinc-400

"

>

A collection of certificates and achievements
that support my professional growth.

</p>




</div>







<div

className="
mt-16

grid

gap-8

md:grid-cols-3

"

>


{

certificates.map((item)=>(


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


<Award size={24}/>


</div>






<h3

className="
mt-6

text-xl

font-semibold

"

>

{item.title}

</h3>





<p

className="
mt-3

text-indigo-400

font-medium

"

>

{item.issuer}

</p>






<div

className="
mt-4

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

{item.year}

</div>







{

item.credentialUrl && (

<a

href={item.credentialUrl}

target="_blank"

className="
mt-6

flex

items-center

gap-2

text-sm

text-zinc-300

hover:text-white

"

>

View Credential

<ExternalLink size={15}/>

</a>


)

}



</div>



))


}



</div>





</Container>


</section>

)

}