"use client";


import Link from "next/link";
import { Github, Linkedin, Menu, X } from "lucide-react";
import { useState } from "react";



export default function Header(){


const [open,setOpen] = useState(false);



const menus = [

{
name:"About",
href:"#about"
},

{
name:"Projects",
href:"#projects"
},

{
name:"Experience",
href:"#experience"
},

{
name:"Certificates",
href:"#certificates"
},

{
name:"Skills",
href:"#skills"
},


];



return (


<header
className="
fixed
top-0
left-0
right-0
z-50
bg-black/70
backdrop-blur-xl
border-b
border-white/10
"
>


<div
className="
max-w-7xl
mx-auto
px-8
h-20
flex
items-center
justify-between
"
>



{/* LOGO */}

<Link

href="/"

className="
text-2xl
font-bold
text-white
"

>

Hanif Al Mahmud Lubis

</Link>





{/* DESKTOP MENU */}


<nav

className="
hidden
md:flex
items-center
gap-8
"

>


{

menus.map((item)=>(


<a

key={item.name}

href={item.href}

className="
text-sm
text-zinc-400
hover:text-white
transition
"

>

{item.name}

</a>


))

}


</nav>






{/* SOCIAL */}


<div

className="
hidden
md:flex
items-center
gap-4
"

>


<a

href="https://github.com/hanifalmahmudlubis"

target="_blank"

className="
text-zinc-400
hover:text-white
transition
"

>

<Github size={20}/>

</a>



<a

href="https://www.linkedin.com/in/hanifalmahmudlubis/"

target="_blank"

className="
text-zinc-400
hover:text-white
transition
"

>

<Linkedin size={20}/>

</a>



</div>







{/* MOBILE BUTTON */}


<button

onClick={()=>setOpen(!open)}

className="
md:hidden
text-white
"

>

{

open

?

<X/>

:

<Menu/>

}

</button>





</div>







{/* MOBILE MENU */}


{

open && (


<div

className="
md:hidden
border-t
border-white/10
bg-black
px-8
py-6
"

>


<nav

className="
flex
flex-col
gap-5
"

>


{

menus.map((item)=>(


<a

key={item.name}

href={item.href}

onClick={()=>setOpen(false)}

className="
text-zinc-300
hover:text-white
"

>

{item.name}

</a>


))

}



</nav>



</div>


)

}




</header>


)

}