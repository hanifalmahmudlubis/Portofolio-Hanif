import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCertificateForm from "./EditCertificateForm";



export default async function Page({

params

}:{

params: Promise<{
id:string
}>

}){


const {id} = await params;



const certificate = await prisma.certificate.findUnique({

where:{

id:id

}

});



if(!certificate){

notFound();

}



return (

<main className="
min-h-screen
bg-black
text-white
p-8
">


<div className="
max-w-4xl
mx-auto
">


<h1 className="
text-3xl
font-bold
mb-8
">

Edit Certificate

</h1>




<EditCertificateForm

certificate={certificate}

/>



</div>


</main>


)


}