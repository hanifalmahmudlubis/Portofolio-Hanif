"use client";


import Container from "../ui/Container";

import {
  Github,
  Linkedin,
  Mail,
  ArrowDown,
  Sparkles
} from "lucide-react";


import { motion } from "framer-motion";



export default function Hero(){


return (

<section

className="
relative
min-h-screen
flex
items-center
overflow-hidden
bg-[#09090B]
text-white
"


>


{/* ================= BACKGROUND GLOW ================= */}


<motion.div


animate={{

scale:[
1,
1.2,
1
],

opacity:[
0.3,
0.6,
0.3

]


}}


transition={{

duration:8,

repeat:Infinity,

ease:"easeInOut"

}}


className="
absolute
top-20
left-1/2
-translate-x-1/2
h-[450px]
w-[450px]
rounded-full
bg-indigo-500/20
blur-[140px]
"

/>






{/* ================= FLOATING PARTICLES ================= */}



<motion.div


animate={{

y:[
0,
-30,
0
],

x:[
0,
20,
0

]


}}


transition={{

duration:6,

repeat:Infinity

}}


className="
absolute
top-40
left-20
w-2
h-2
rounded-full
bg-indigo-400
"

/>






<motion.div


animate={{

y:[
0,
40,
0
],

x:[
0,
-20,
0

]


}}


transition={{

duration:7,

repeat:Infinity

}}


className="
absolute
right-32
top-60
w-3
h-3
rounded-full
bg-purple-400
"

/>









<Container>


<motion.div


initial={{

opacity:0,

y:40

}}


animate={{

opacity:1,

y:0

}}


transition={{

duration:0.8

}}


className="
relative
max-w-5xl
"

>



{/* ================= STATUS ================= */}



<motion.div


initial={{

opacity:0,

scale:0.8

}}


animate={{

opacity:1,

scale:1

}}


transition={{

delay:0.2

}}


className="
inline-flex
items-center
gap-2
rounded-full
border
border-white/10
bg-white/5
px-4
py-2
text-sm
text-zinc-300
backdrop-blur
"

>


<Sparkles

size={15}

className="text-indigo-400"

/>


Available for Software Engineering Opportunities


</motion.div>







{/* ================= NAME ================= */}



<motion.h1


initial={{

opacity:0,

y:30

}}


animate={{

opacity:1,

y:0

}}


transition={{

duration:0.8,

delay:0.3

}}



className="
mt-8
text-5xl
font-bold
tracking-tight
md:text-7xl
leading-[1.1]
"

>


Hanif Al Mahmud Lubis


</motion.h1>








{/* ================= ROLE ================= */}



<motion.h2


initial={{

opacity:0,

y:20

}}


animate={{

opacity:1,

y:0

}}


transition={{

duration:0.8,

delay:0.5

}}


className="
mt-5
text-2xl
md:text-4xl
font-semibold

bg-gradient-to-r
from-indigo-400
via-purple-400
to-pink-400

bg-clip-text
text-transparent
"


>


Software Engineering Graduate


</motion.h2>









{/* ================= DESCRIPTION ================= */}



<motion.p


initial={{

opacity:0

}}


animate={{

opacity:1

}}


transition={{

delay:0.7

}}



className="
mt-7
max-w-3xl
text-lg
leading-relaxed
text-zinc-400
"


>


Software Engineering graduate from Politeknik Negeri Medan
with experience in web development, mobile applications,
database systems, machine learning, and network technology.


<br/><br/>


Passionate about building practical digital solutions
and continuously improving technical skills.


</motion.p>









{/* ================= BUTTON ================= */}



<motion.div


initial={{

opacity:0,

y:20

}}


animate={{

opacity:1,

y:0

}}


transition={{

delay:0.9

}}


className="
mt-10
flex
flex-wrap
gap-4
"


>



<a

href="#projects"

className="
group
flex
items-center
gap-2
rounded-full
bg-white
px-7
py-3.5
font-medium
text-black
transition
hover:scale-105
"


>


Explore Projects


<ArrowDown

size={18}

className="
transition
group-hover:translate-y-1
"

/>


</a>








<a


href="#about"


className="
border
border-white/20
px-7
py-3
rounded-full
hover:bg-white
hover:text-black
transition
"


>


Lets Be Friends


</a>





</motion.div>









{/* ================= SOCIAL ================= */}



<motion.div


initial={{

opacity:0

}}


animate={{

opacity:1

}}


transition={{

delay:1

}}


className="
mt-10
flex
gap-5
"


>




<motion.a


whileHover={{

y:-5,

scale:1.1

}}


href="https://github.com/hanifalmahmudlubis"

target="_blank"

rel="noopener noreferrer"


className="
rounded-full
border
border-white/10
p-3
text-zinc-400
transition
hover:border-white/30
hover:text-white
"


>


<Github size={20}/>


</motion.a>







<motion.a


whileHover={{

y:-5,

scale:1.1

}}


href="https://www.linkedin.com/in/hanifalmahmudlubis/"


target="_blank"

rel="noopener noreferrer"


className="
rounded-full
border
border-white/10
p-3
text-zinc-400
transition
hover:border-white/30
hover:text-white
"


>


<Linkedin size={20}/>


</motion.a>







<motion.a


whileHover={{

y:-5,

scale:1.1

}}


href="mailto:hanifmahmud2905@gmail.com"


className="
rounded-full
border
border-white/10
p-3
text-zinc-400
transition
hover:border-white/30
hover:text-white
"


>


<Mail size={20}/>


</motion.a>





</motion.div>







</motion.div>



</Container>









{/* ================= SCROLL ICON ================= */}



<motion.div


animate={{

y:[
0,
10,
0

]

}}


transition={{

duration:2,

repeat:Infinity

}}


className="
absolute
bottom-10
left-1/2
-translate-x-1/2
text-zinc-500
"


>


<ArrowDown size={22}/>


</motion.div>







</section>


)


}