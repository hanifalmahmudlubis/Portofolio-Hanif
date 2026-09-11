"use client";


import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function LoginPage(){


const router = useRouter();


const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [error,setError] = useState("");



async function handleSubmit(e:React.FormEvent){

e.preventDefault();


const result = await signIn(
"credentials",
{
email,
password,
redirect:false
}
);



if(result?.error){

setError("Email atau password salah");

return;

}


router.push("/admin/dashboard");


}



return (

<div

className="
min-h-screen
flex
items-center
justify-center
bg-[#09090B]
text-white
"

>


<form

onSubmit={handleSubmit}

className="
w-full
max-w-md
rounded-3xl
border
border-white/10
bg-white/[0.04]
p-8
backdrop-blur-xl
"


>


<h1

className="
text-3xl
font-bold
"

>

Hanif CMS

</h1>


<p

className="
mt-2
text-zinc-400
"

>

Admin Dashboard Login

</p>



<div className="mt-8">


<label
className="
text-sm
text-zinc-400
"
>
Email
</label>


<input

type="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="
mt-2
w-full
rounded-xl
border
border-white/10
bg-black/30
px-4
py-3
outline-none
"

placeholder="admin@email.com"

/>


</div>




<div className="mt-5">


<label
className="
text-sm
text-zinc-400
"
>

Password

</label>


<input

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

className="
mt-2
w-full
rounded-xl
border
border-white/10
bg-black/30
px-4
py-3
outline-none
"

placeholder="••••••••"

/>


</div>




{
error && (

<p

className="
mt-4
text-sm
text-red-400
"

>

{error}

</p>

)

}





<button

className="
mt-8
w-full
rounded-xl
bg-white
py-3
font-semibold
text-black
hover:bg-zinc-200
transition
"

>

Login

</button>



</form>


</div>

)

}