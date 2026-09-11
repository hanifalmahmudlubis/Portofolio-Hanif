"use client";


import {useRouter} from "next/navigation";


export default function DeleteCertificateButton({

id

}:{
id:string
}){


const router=useRouter();



async function remove(){


const ok =
confirm(
"Delete certificate?"
);


if(!ok)return;



const res =
await fetch(

`/api/certificate/${id}`,

{
method:"DELETE"
}

);



if(res.ok){

router.refresh();

}else{

alert("Delete gagal");

}


}



return (

<button

onClick={remove}

className="
bg-red-500
px-4
py-2
rounded-lg
"

>

Delete

</button>

)


}