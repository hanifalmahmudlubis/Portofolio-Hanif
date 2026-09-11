"use client";


import React,{useState} from "react";
import {useRouter} from "next/navigation";

import {
ArrowLeft,
Save,
ImagePlus,
Trash2
} from "lucide-react";





type ImageType = {

id:string;

imageUrl:string;

displayOrder:number;

createdAt:Date;

projectId:string;

};



type ProjectProps={


id:string;

title:string;

slug:string;

shortDescription:string;

fullDescription:string;

category:string;

projectType:string;

year:number;

problem:string|null;

solution:string|null;

githubUrl:string|null;

liveDemoUrl:string|null;

images:ImageType[];

};







export default function EditProjectForm({

project

}:{

project:ProjectProps

}){


const router = useRouter();



const [loading,setLoading]=useState(false);



const [newImages,setNewImages]=useState<FileList|null>(null);





const [form,setForm]=useState({


title:project.title,

slug:project.slug,

shortDescription:project.shortDescription,

fullDescription:project.fullDescription,

category:project.category,

projectType:project.projectType,

year:String(project.year),

problem:project.problem ?? "",

solution:project.solution ?? "",

githubUrl:project.githubUrl ?? "",

liveDemoUrl:project.liveDemoUrl ?? ""


});








function handleChange(

e:
React.ChangeEvent<
HTMLInputElement|HTMLTextAreaElement
>

){


setForm(prev=>({

...prev,

[e.target.name]:e.target.value

}));


}









async function handleSubmit(

e:React.FormEvent

){


e.preventDefault();



try{


setLoading(true);




// UPDATE PROJECT DATA


const response = await fetch(

`/api/projects/${project.id}`,

{

method:"PUT",

headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({

...form,

year:Number(form.year)


})


}

);






if(!response.ok){

throw new Error(
"Failed update project"
);

}









// UPLOAD NEW IMAGE


if(newImages){



const imageForm = new FormData();




Array.from(newImages).forEach(

(file)=>{


imageForm.append(

"images",

file

);


}

);







await fetch(

`/api/projects/${project.id}/images`,

{

method:"POST",

body:imageForm

}

);



}







router.push(

"/admin/projects"

);


router.refresh();





}

catch(error){

console.log(error);

}

finally{


setLoading(false);


}



}









async function deleteImage(id:string){


const confirmDelete =
confirm(
"Delete this image?"
);



if(!confirmDelete)
return;




const response = await fetch(

`/api/projects/${project.id}/images?imageId=${id}`,

{

method:"DELETE"

}

);





if(response.ok){

router.refresh();

}



}



return (

<form

onSubmit={handleSubmit}

className="

space-y-8

bg-zinc-900

border

border-white/10

rounded-3xl

p-8

"


>







<div>


<button

type="button"

onClick={()=>router.back()}

className="

flex

items-center

gap-2

text-zinc-400

hover:text-white

mb-5

"


>


<ArrowLeft size={18}/>


Back


</button>




<h1

className="

text-3xl

font-bold

"

>

Edit Project

</h1>



</div>









<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Basic Information

</h2>





<div className="grid md:grid-cols-2 gap-5">


<Input
label="Project Title"
name="title"
value={form.title}
onChange={handleChange}
/>



<Input
label="Slug"
name="slug"
value={form.slug}
onChange={handleChange}
/>



<Input
label="Category"
name="category"
value={form.category}
onChange={handleChange}
/>




<Input
label="Project Type"
name="projectType"
value={form.projectType}
onChange={handleChange}
/>



<Input
label="Year"
name="year"
value={form.year}
onChange={handleChange}
/>



</div>


</section>









<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Description

</h2>





<Textarea

label="Short Description"

name="shortDescription"

value={form.shortDescription}

onChange={handleChange}

/>





<Textarea

label="Full Description"

name="fullDescription"

value={form.fullDescription}

onChange={handleChange}

/>




</section>









<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Project Analysis

</h2>





<Textarea

label="Problem"

name="problem"

value={form.problem}

onChange={handleChange}

/>





<Textarea

label="Solution"

name="solution"

value={form.solution}

onChange={handleChange}

/>




</section>









<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Links

</h2>





<Input

label="Github URL"

name="githubUrl"

value={form.githubUrl}

onChange={handleChange}

/>





<Input

label="Live Demo URL"

name="liveDemoUrl"

value={form.liveDemoUrl}

onChange={handleChange}

/>




</section>









<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Current Screenshots

</h2>





<div className="grid md:grid-cols-3 gap-5">


{

project.images.map((img)=>(


<div

key={img.id}

className="
relative
rounded-xl
overflow-hidden
border
border-white/10
"


>


<img

src={img.imageUrl}

className="
w-full
h-40
object-cover
"

/>



<button

type="button"

onClick={()=>deleteImage(img.id)}

className="
absolute
top-2
right-2
bg-red-500
p-2
rounded-lg
"


>


<Trash2 size={16}/>


</button>




</div>


))

}


</div>




</section>









<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Add New Screenshots

</h2>





<label

className="
flex
items-center
gap-3
cursor-pointer
border
border-white/10
rounded-xl
p-5
bg-black
"


>


<ImagePlus/>

Choose Images



<input

type="file"

multiple

accept="image/*"

className="hidden"

onChange={(e)=>
setNewImages(e.target.files)
}

/>


</label>




{

newImages &&

<p className="text-indigo-400 mt-3">

{newImages.length} new images selected

</p>

}



</section>









<button

disabled={loading}

className="
flex
items-center
gap-2
bg-white
text-black
px-8
py-3
rounded-xl
font-semibold
"


>


<Save size={18}/>


{

loading

?

"Saving..."

:

"Save Changes"

}



</button>







</form>


)

}









type InputProps={

label:string;

name:string;

value:string;

onChange:
(e:React.ChangeEvent<HTMLInputElement>)=>void;

}




function Input({

label,

...props

}:InputProps){


return (

<div>


<label className="text-sm text-zinc-400">

{label}

</label>


<input

{...props}

className="
mt-2
w-full
rounded-xl
bg-black
border
border-white/10
px-4
py-3
focus:border-indigo-500
outline-none
"

/>


</div>


)

}








type TextProps={

label:string;

name:string;

value:string;

onChange:
(e:React.ChangeEvent<HTMLTextAreaElement>)=>void;

}





function Textarea({

label,

...props

}:TextProps){


return (

<div>


<label className="text-sm text-zinc-400">

{label}

</label>



<textarea

{...props}

rows={5}

className="
mt-2
w-full
rounded-xl
bg-black
border
border-white/10
px-4
py-3
resize-none
outline-none
focus:border-indigo-500
"

/>



</div>

)

}