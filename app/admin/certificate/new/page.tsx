import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";


export default function NewCertificate(){



async function create(formData:FormData){

"use server";


await prisma.certificate.create({

data:{


title:
formData.get("title") as string,


issuer:
formData.get("issuer") as string,


year:
formData.get("year") as string,


credentialUrl:
formData.get("credentialUrl") as string


}

});


redirect("/admin/certificate");


}



return (

<div className="
bg-black
min-h-screen
text-white
p-8
">


<h1 className="
text-3xl
font-bold
mb-8
">

Add Certificate

</h1>



<form

action={create}

className="
space-y-5
max-w-xl
"


>


<input

name="title"

placeholder="Certificate Title"

className="
w-full
bg-zinc-900
border
border-white/10
p-3
rounded-xl
"

/>



<input

name="issuer"

placeholder="Issuer"

className="
w-full
bg-zinc-900
border
border-white/10
p-3
rounded-xl
"

/>



<input

name="year"

placeholder="Year"

className="
w-full
bg-zinc-900
border
border-white/10
p-3
rounded-xl
"

/>



<input

name="credentialUrl"

placeholder="Credential URL"

className="
w-full
bg-zinc-900
border
border-white/10
p-3
rounded-xl
"

/>



<button

className="
bg-white
text-black
px-6
py-3
rounded-xl
font-semibold
"

>

Save

</button>


</form>


</div>

)


}