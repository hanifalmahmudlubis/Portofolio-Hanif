import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditProjectForm from "./EditProjectForm";



export default async function EditProjectPage({

params,

}: {

params: Promise<{
id:string;
}>;

}) {



const {id} = await params;





const project = await prisma.project.findUnique({

where:{

id:id

},


include:{


images:{


orderBy:{


displayOrder:"asc"


}


}


}


});






if(!project){

notFound();

}







return (


<main

className="
min-h-screen
bg-black
text-white
p-8
"

>


<div

className="
max-w-5xl
mx-auto
"

>


<h1

className="
text-3xl
font-bold
mb-8
"

>

Edit Project

</h1>





<EditProjectForm

project={project}

/>





</div>


</main>


);


}