import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExperienceEditForm from "./ExperienceEditForm";

export default async function EditExperiencePage({

params

}:{

params:Promise<{
id:string
}>

}){


const {id}=await params;



const experience =
await prisma.experience.findUnique({

where:{
id
}

});



if(!experience){

notFound();

}



return (

<div className="
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

Edit Experience

</h1>



<ExperienceEditForm

experience={experience}

/>



</div>


</div>

)


}