import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function DELETE(
req:Request,
{
params
}:{
params:{
id:string
}
}
){

try{


const project =
await prisma.project.findUnique({

where:{
id:params.id
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


// hapus relasi dulu

await prisma.projectTechnology.deleteMany({

where:{
projectId:params.id
}

});


await prisma.projectImage.deleteMany({

where:{
projectId:params.id
}

});


// hapus project

await prisma.project.delete({

where:{
id:params.id
}

});


return NextResponse.json({

success:true

});


}
catch(error){

console.log(error);


return NextResponse.json(
{
message:"Delete failed"
},
{
status:500
}
);


}


}