import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function GET() {

  try {

      const projects = await prisma.project.findMany({

      include:{
        images:true,

        technologies:{
          include:{
            technology:true
          }
        }

      },

      orderBy:{
        createdAt:"desc"
      }

    });



    return NextResponse.json(projects);



  } catch(error){

    return NextResponse.json(
      {
        message:"Failed to fetch projects"
      },
      {
        status:500
      }
    );

  }

}







export async function POST(

request:Request

){


try{


const body =
await request.json();



const project = await prisma.project.create({

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



featured:
false,



published:
false,


}


});



return NextResponse.json(

project,

{
status:201
}

);



}

catch(error){


console.log(error);



return NextResponse.json(

{
message:"Failed create project",
error
},

{
status:500
}

);


}


}