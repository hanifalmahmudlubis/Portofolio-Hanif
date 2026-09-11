import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pencil, Plus } from "lucide-react";
import DeleteCertificateButton from "./DeleteCertificateButton";

export default async function CertificatePage(){


const certificates =
await prisma.certificate.findMany({

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

Certificate

</h1>

<p className="
text-zinc-400
mt-2
">

Manage certificates

</p>

</div>


<Link

href="/admin/certificate/new"

className="
flex
gap-2
items-center
bg-white
text-black
px-5
py-3
rounded-xl
font-semibold
"

>

<Plus size={18}/>

Add Certificate

</Link>


</div>





<div className="
space-y-5
">


{
certificates.map((item)=>(


<div

key={item.id}

className="
bg-zinc-900
border
border-white/10
rounded-2xl
p-6
flex
justify-between
items-center
"

>


<div>

<h2 className="
text-xl
font-semibold
">

{item.title}

</h2>


<p className="
text-indigo-400
">

{item.issuer}

</p>


<p className="
text-zinc-500
text-sm
">

{item.year}

</p>


</div>





<div className="
flex
gap-3
">


<Link

href={`/admin/certificate/${item.id}`}

className="
px-4
py-2
border
border-white/10
rounded-lg
flex
gap-2
items-center
"

>

<Pencil size={15}/>

Edit

</Link>






<DeleteCertificateButton

id={item.id}

/>


</div>


</div>


))

}


</div>



</div>


</div>


)

}