import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



// GET ALL EXPERIENCE

export async function GET(){


try{


const experience = await prisma.experience.findMany({


include:{


images:true


},


orderBy:{


createdAt:"desc"


}


});



return NextResponse.json(
experience
);



}

catch(error){


console.log(error);


return NextResponse.json(

{

message:"Failed fetch experience"

},

{

status:500

}

);


}


}









// CREATE EXPERIENCE

export async function POST(

request:Request

){



try{


const body = await request.json();





const experience = await prisma.experience.create({


data:{



company:
body.company,



position:
body.position,



location:
body.location || null,



startDate:
body.startDate,



endDate:
body.endDate || null,



description:
body.description,





images: body.images && body.images.length > 0

?

{

create:

body.images.map(
(url:string)=>({

url:url

})

)

}

:

undefined




},



include:{


images:true


}


});





return NextResponse.json(

experience,

{

status:201

}

);



}



catch(error){


console.log(error);



return NextResponse.json(

{

message:"Failed create experience"

},

{

status:500

}

);


}



}