"use client";


import {useState} from "react";
import {useRouter} from "next/navigation";


type Certificate={

id:string;

title:string;

issuer:string;

year:string;

credentialUrl:string|null;

}



export default function EditCertificateForm({

certificate

}:{
certificate:Certificate
}){


const router=useRouter();


const [loading,setLoading]=useState(false);



const [form,setForm]=useState({

title:certificate.title,

issuer:certificate.issuer,

year:certificate.year,

credentialUrl:
certificate.credentialUrl ?? ""

});





function change(
e:React.ChangeEvent<HTMLInputElement>
){


setForm({

...form,

[e.target.name]:
e.target.value

});


}






async function submit(
e:React.FormEvent
){

e.preventDefault();


setLoading(true);



const res =
await fetch(

`/api/certificate/${certificate.id}`,

{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(form)

}

);



setLoading(false);



if(res.ok){

alert("Certificate updated");

router.push("/admin/certificate");

router.refresh();

}else{

alert("Update gagal");

}



}




return (

<form

onSubmit={submit}

className="
max-w-xl
space-y-5
bg-zinc-900
p-8
rounded-2xl
border
border-white/10
"


>


<input

name="title"

value={form.title}

onChange={change}

placeholder="Title"

className="
w-full
bg-black
p-3
rounded-xl
"

/>



<input

name="issuer"

value={form.issuer}

onChange={change}

placeholder="Issuer"

className="
w-full
bg-black
p-3
rounded-xl
"

/>



<input

name="year"

value={form.year}

onChange={change}

placeholder="Year"

className="
w-full
bg-black
p-3
rounded-xl
"

/>



<input

name="credentialUrl"

value={form.credentialUrl}

onChange={change}

placeholder="Credential URL"

className="
w-full
bg-black
p-3
rounded-xl
"

/>




<button

disabled={loading}

className="
bg-white
text-black
px-6
py-3
rounded-xl
font-semibold
"

>

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