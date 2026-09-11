"use client";


import Link from "next/link";

import {
Github,
Linkedin,
Mail,
ArrowUp
} from "lucide-react";



export default function Footer(){



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
}

];





return (


<footer

className="
relative
bg-[#09090B]
border-t
border-white/10
text-white
overflow-hidden
"

>


{/* Glow */}

<div

className="
absolute
bottom-0
left-1/2
-translate-x-1/2
w-[400px]
h-[200px]
bg-indigo-500/20
blur-[120px]
"

/>






<div

className="
relative
max-w-7xl
mx-auto
px-6
py-16
"

>



<div

className="
grid
md:grid-cols-3
gap-12
"

>




{/* BRAND */}


<div>


<h2

className="
text-3xl
font-bold
"

>

Hanif Al Mahmud Lubis

</h2>



<p

className="
mt-5
text-zinc-400
leading-relaxed
max-w-sm
"

>

Software Engineering graduate passionate about
web development, machine learning, and building
digital solutions.

</p>





<div

className="
mt-6
flex
gap-4
"

>


<a

href="https://github.com/hanifalmahmudlubis"

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-xl
border
border-white/10
flex
items-center
justify-center
text-zinc-400
hover:text-white
hover:bg-white/10
transition
"

>

<Github size={20}/>

</a>







<a

href="https://www.linkedin.com/in/hanifalmahmudlubis/"

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-xl
border
border-white/10
flex
items-center
justify-center
text-zinc-400
hover:text-white
hover:bg-white/10
transition
"

>

<Linkedin size={20}/>

</a>








<a

href="mailto:hanifmahmud2905@gmail.com"

className="
w-11
h-11
rounded-xl
border
border-white/10
flex
items-center
justify-center
text-zinc-400
hover:text-white
hover:bg-white/10
transition
"

>

<Mail size={20}/>

</a>



</div>


</div>









{/* NAVIGATION */}



<div>


<h3

className="
font-semibold
text-lg
"

>

Navigation

</h3>



<ul

className="
mt-5
space-y-3
"

>


{

menus.map((item)=>(


<li

key={item.name}

>


<a

href={item.href}

className="
text-zinc-400
hover:text-white
transition
"

>

{item.name}

</a>


</li>


))


}


</ul>


</div>









{/* CONTACT */}



<div>


<h3

className="
font-semibold
text-lg
"

>

Lets Connect

</h3>




<p

className="
mt-5
text-zinc-400
"

>

Interested in collaboration?

</p>





<a

href="mailto:hanifmahmud2905@gmail.com"

className="
inline-flex
items-center
gap-2
mt-5
text-indigo-400
hover:text-indigo-300
transition
"

>

<Mail size={18}/>

hanifmahmud2905@gmail.com


</a>





</div>




</div>









{/* BOTTOM */}



<div

className="
mt-16
pt-8
border-t
border-white/10
flex
flex-col
md:flex-row
justify-between
items-center
gap-5
"

>


<p

className="
text-sm
text-zinc-500
"

>

© {new Date().getFullYear()} Hanif Al Mahmud Lubis.
All rights reserved.

</p>







<button

onClick={()=>window.scrollTo({

top:0,

behavior:"smooth"

})}


className="
flex
items-center
gap-2
text-sm
text-zinc-400
hover:text-white
transition
"

>


Back to top

<ArrowUp size={16}/>


</button>




</div>




</div>



</footer>


)

}