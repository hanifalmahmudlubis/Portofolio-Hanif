"use client";


import {useState} from "react";
import {useRouter} from "next/navigation";



type ExperienceProps = {

id:string;

company:string;

position:string;

location:string | null;

startDate:string;

endDate:string | null;

description:string;

};




type FormState = {

company:string;

position:string;

location:string;

startDate:string;

endDate:string;

description:string;

};




export default function ExperienceEditForm({

experience

}:{

experience:ExperienceProps

}){


const router = useRouter();



const [form,setForm]=useState<FormState>({

company:experience.company,

position:experience.position,

location:experience.location ?? "",

startDate:experience.startDate,

endDate:experience.endDate ?? "",

description:experience.description

});





function change(

e:
React.ChangeEvent<
HTMLInputElement |
HTMLTextAreaElement
>

){


setForm({

...form,

[e.target.name]:e.target.value

});


}







async function submit(

e:React.FormEvent

){


e.preventDefault();



const response =
await fetch(

`/api/experience/${experience.id}`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(form)

}

);




if(response.ok){

router.push("/admin/experience");

router.refresh();

}



}




return (

<form

onSubmit={submit}

className="
bg-zinc-900
border
border-white/10
rounded-xl
p-8
space-y-5
"

>



<Input

label="Company"

name="company"

value={form.company}

onChange={change}

/>




<Input

label="Position"

name="position"

value={form.position}

onChange={change}

/>





<Input

label="Location"

name="location"

value={form.location}

onChange={change}

/>





<Input

label="Start Date"

name="startDate"

value={form.startDate}

onChange={change}

/>




<Input

label="End Date"

name="endDate"

value={form.endDate}

onChange={change}

/>





<div>


<label className="
text-zinc-400
text-sm
">

Description

</label>


<textarea

name="description"

value={form.description}

onChange={change}

rows={6}

className="
mt-2
w-full
bg-black
border
border-white/10
rounded-xl
p-4
"

/>


</div>





<button

className="
bg-white
text-black
px-6
py-3
rounded-xl
font-semibold
"

>

Save Changes

</button>




</form>

)


}







type InputProps={

label:string;

name:string;

value:string;

onChange:
(
e:React.ChangeEvent<HTMLInputElement>
)=>void;

};




function Input({

label,
...props

}:InputProps){


return (

<div>


<label className="
text-zinc-400
text-sm
">

{label}

</label>



<input

{...props}

className="
mt-2
w-full
bg-black
border
border-white/10
rounded-xl
px-4
py-3
"

/>


</div>


)

}