import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";



type Context = {
  params: Promise<{
    id:string;
  }>
};




// ==================================
// UPLOAD PROJECT IMAGE
// ==================================

export async function POST(
request:Request,
context:Context
){


try{


const {id}=await context.params;



const formData = await request.formData();



const files = formData.getAll(
"images"
) as File[];





if(files.length===0){


return NextResponse.json(

{
message:"No images"
},

{
status:400
}

);


}






const images=[];



for(
let i=0;
i<files.length;
i++
){


const file = files[i];



const bytes =
await file.arrayBuffer();



const buffer =
Buffer.from(bytes);





const fileName =

`${Date.now()}-${file.name.replace(/\s/g,"-")}`;






const uploadPath =

path.join(

process.cwd(),

"public/uploads/projects",

fileName

);





await writeFile(

uploadPath,

buffer

);








const image = await prisma.projectImage.create({

data:{


projectId:id,


imageUrl:

`/uploads/projects/${fileName}`,


displayOrder:i


}

});





images.push(image);



}





return NextResponse.json(

images,

{

status:201

}

);



}



catch(error){


console.log(

"UPLOAD IMAGE ERROR",

error

);



return NextResponse.json(

{

message:"Upload image failed"

},

{

status:500

}

);


}


}









// ==================================
// DELETE SINGLE IMAGE
// ==================================


export async function DELETE(

request:NextRequest,

context:Context

){


try{


const {id}=await context.params;



const imageId =

request.nextUrl.searchParams.get(
"imageId"
);





if(!imageId){


return NextResponse.json(

{
message:"Image id required"
},

{
status:400
}

);


}








const image = await prisma.projectImage.findUnique({

where:{

id:imageId

}

});





if(!image){


return NextResponse.json(

{
message:"Image not found"
},

{
status:404
}

);


}








// hapus file dari folder public

const filePath = path.join(

process.cwd(),

"public",

image.imageUrl

);




try{


await unlink(filePath);


}catch(error){

console.log(
"FILE DELETE SKIPPED"
);

}








// hapus database

await prisma.projectImage.delete({

where:{

id:imageId

}

});








return NextResponse.json({

success:true,

message:"Image deleted successfully"

});




}



catch(error){


console.log(

"DELETE IMAGE ERROR",

error

);



return NextResponse.json(

{

message:"Delete image failed"

},

{

status:500

}

);


}


}