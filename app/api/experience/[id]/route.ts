import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function PUT(

request:Request,

context:{
params:Promise<{
id:string
}>
}

){


try{


const {id}=await context.params;


const body =
await request.json();



const experience =
await prisma.experience.update({

where:{
id
},


data:{


company:body.company,


position:body.position,


location:body.location || null,


startDate:body.startDate,


endDate:body.endDate || null,


description:body.description


}


});



return NextResponse.json(experience);



}

catch(error){


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

request:Request,

context:{
params:Promise<{
id:string
}>
}

){


try{


const {id}=await context.params;



await prisma.experience.delete({

where:{
id
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