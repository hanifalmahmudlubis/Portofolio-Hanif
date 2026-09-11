"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
  ImagePlus
} from "lucide-react";



export default function NewProjectPage(){


const router = useRouter();


const [loading,setLoading] = useState(false);


const [images,setImages] = useState<FileList | null>(null);



const [form,setForm] = useState({

title:"",
slug:"",
shortDescription:"",
fullDescription:"",
category:"",
projectType:"",
year:"",
problem:"",
solution:"",
githubUrl:"",
liveDemoUrl:""

});






function handleChange(
e:React.ChangeEvent<
HTMLInputElement | HTMLTextAreaElement
>
){


setForm({

...form,

[e.target.name]:e.target.value

});


}







async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();


try{


setLoading(true);




// CREATE PROJECT


const res = await fetch(

"/api/projects",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

...form,


year:Number(form.year),


featured:false,


published:false


})


}

);






if(!res.ok){

throw new Error(
"Failed create project"
);

}



const project = await res.json();







// UPLOAD IMAGE


if(images){



const formData = new FormData();



Array.from(images).forEach(
(file)=>{


formData.append(
"images",
file
);


}

);





await fetch(

`/api/projects/${project.id}/images`,

{

method:"POST",

body:formData

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








return (


<div

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





{/* HEADER */}


<div

className="
mb-10
"

>


<button


onClick={()=>router.back()}


className="
flex
items-center
gap-2
text-zinc-400
hover:text-white
transition
mb-5
"


>


<ArrowLeft size={18}/>


Back


</button>





<h1

className="
text-4xl
font-bold
tracking-tight
"

>

Create Project

</h1>



<p

className="
text-zinc-400
mt-2
"

>

Add a new project case study to your portfolio.

</p>



</div>










<form


onSubmit={handleSubmit}


className="
space-y-8
bg-zinc-900/60
border
border-white/10
rounded-3xl
p-8
backdrop-blur-xl
"


>









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




<div

className="
grid
md:grid-cols-2
gap-5
"

>



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









{/* IMAGE UPLOAD */}


<section>


<h2

className="
text-xl
font-semibold
mb-5
"

>

Project Screenshots

</h2>





<div

className="
border
border-white/10
rounded-xl
bg-black
p-5
"

>


<label


className="
flex
items-center
gap-3
cursor-pointer
text-zinc-300
"

>


<ImagePlus size={20}/>



Choose Images



<input


type="file"


multiple


accept="image/*"


className="
hidden
"


onChange={(e)=>
setImages(e.target.files)
}


/>



</label>






{

images &&

(

<p

className="
mt-3
text-sm
text-indigo-400
"

>

{images.length} image selected

</p>

)

}





<p

className="
text-xs
text-zinc-500
mt-2
"

>

Upload multiple screenshots. Recommended 3-7 images.

</p>





</div>




</section>









<button


disabled={loading}


className="
flex
items-center
gap-2
bg-gradient-to-r
from-indigo-500
to-purple-600
px-8
py-3
rounded-xl
font-semibold
hover:scale-105
transition
disabled:opacity-50
"


>



<Save size={18}/>




{

loading

?

"Saving..."

:

"Save Project"

}





</button>








</form>






</div>


</div>


)

}









type FieldProps={


label:string;


name:string;


value:string;


onChange:

(
e:React.ChangeEvent<HTMLInputElement>
)=>void;


}






function Input({

label,

...props

}:FieldProps){


return (


<div>



<label

className="
text-sm
text-zinc-400
"

>


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
outline-none
focus:border-indigo-500
transition
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

(
e:React.ChangeEvent<HTMLTextAreaElement>
)=>void;


}








function Textarea({

label,

...props

}:TextProps){


return (



<div>



<label

className="
text-sm
text-zinc-400
"

>


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
outline-none
focus:border-indigo-500
transition
resize-none
"



/>





</div>


)


}