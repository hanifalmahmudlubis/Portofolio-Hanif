"use client";


import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";


export default function DeleteButton({

id

}:{
id:string

}){


const router = useRouter();



async function handleDelete(){


const confirmDelete =
window.confirm(
"Yakin ingin menghapus project ini?"
);



if(!confirmDelete){

return;

}



const response = await fetch(

`/api/projects/${id}`,

{
method:"DELETE"
}

);



const result = await response.json();



console.log(
"DELETE RESULT:",
result
);



if(response.ok){

router.refresh();

}



else{


alert(
result.message || "Gagal menghapus"
);


}


}




return (

<button

onClick={handleDelete}

className="
flex
items-center
gap-2
px-4
py-2
rounded-lg
bg-red-500
hover:bg-red-600
transition
"

>


<Trash2 size={15}/>

Delete


</button>

)


}