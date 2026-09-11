import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function PUT(
req:Request,
context:{
params:Promise<{
id:string
}>
}
){

try{


const {id}=await context.params;


const body=await req.json();



const updated =
await prisma.certificate.update({

where:{
id:id
},


data:{

title:body.title,

issuer:body.issuer,

year:String(body.year),

credentialUrl:
body.credentialUrl || null

}

});



return NextResponse.json(updated);



}catch(error){


console.log(error);


return NextResponse.json(
{
message:"Update failed"
},
{
status:500
}
);


}

}






export async function DELETE(
req:Request,
context:{
params:Promise<{
id:string
}>
}
){

try{


const {id}=await context.params;



const existing =
await prisma.certificate.findUnique({

where:{
id:id
}

});



if(!existing){

return NextResponse.json(
{
message:"Certificate not found"
},
{
status:404
}
);

}




await prisma.certificate.delete({

where:{
id:id
}

});



return NextResponse.json({

success:true

});



}catch(error){


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