import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


type Context = {
  params: Promise<{
    id:string;
  }>;
};



// =================================
// UPDATE PROJECT
// =================================

export async function PUT(
request:Request,
context:Context
){


try{


const {id}=await context.params;


const body=await request.json();



const project = await prisma.project.update({

where:{
id
},


data:{


title:
body.title,


slug:
body.slug,


shortDescription:
body.shortDescription,


fullDescription:
body.fullDescription,


category:
body.category,


projectType:
body.projectType,


year:
Number(body.year),


problem:
body.problem || null,


solution:
body.solution || null,


githubUrl:
body.githubUrl || null,


liveDemoUrl:
body.liveDemoUrl || null,


}


});




return NextResponse.json(
project
);



}

catch(error){


console.error(
"UPDATE PROJECT ERROR:",
error
);



return NextResponse.json(

{
message:"Failed update project"
},

{
status:500
}

);


}


}







// =================================
// DELETE PROJECT
// =================================


export async function DELETE(

request:Request,

context:Context

){


try{


const {id}=await context.params;





const project = await prisma.project.findUnique({

where:{
id
}

});





if(!project){


return NextResponse.json(

{
message:"Project not found"
},

{
status:404
}

);


}







// hapus relasi teknologi

await prisma.projectTechnology.deleteMany({

where:{
projectId:id
}

});








// hapus semua gambar project

await prisma.projectImage.deleteMany({

where:{
projectId:id
}

});








// hapus project

await prisma.project.delete({

where:{
id
}

});






return NextResponse.json({

success:true,

message:"Project deleted successfully"

});





}

catch(error){


console.error(

"DELETE PROJECT ERROR:",

error

);



return NextResponse.json(

{

message:"Failed delete project"

},

{
status:500
}

);


}


}