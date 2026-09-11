import Image from "next/image";
import {
Github,
Linkedin,
Mail
} from "lucide-react";

import Container from "../ui/Container";



export default function About(){


return (

<section

id="about"

className="
bg-[#09090B]

py-32

text-white

scroll-mt-24

"

>


<Container>


<div

className="
grid

md:grid-cols-2

gap-16

items-center

"

>



{/* PROFILE IMAGE */}

<div

className="
flex

justify-center

"

>


<div

className="
relative

w-[320px]

h-[420px]

rounded-3xl

overflow-hidden

border

border-white/10

bg-white/5

"

>


<Image

src="/profile.jpg"

alt="Hanif Almah"

fill

priority

className="
object-cover
"

/>


</div>


</div>









{/* CONTENT */}


<div>


<p

className="
text-sm

uppercase

tracking-[0.3em]

text-indigo-400

"

>

About Me

</p>





<h2

className="
mt-5

text-4xl

md:text-5xl

font-bold

"

>

Hello, Im Hanif

</h2>





<h3

className="
mt-4

text-xl

text-indigo-400

"

>

Software Engineer & Technology Enthusiast

</h3>






<p

className="
mt-6

text-zinc-400

leading-relaxed

"

>

I am a Software Engineering student passionate about
web development, machine learning, and building
digital solutions.

I enjoy transforming ideas into reliable,
scalable, and impactful applications through
technology.

</p>







{/* SOCIAL MEDIA */}

<div

className="
mt-8

flex

gap-4

"

>



{/* GITHUB */}

<a

href="https://github.com/hanifalmahmudlubis"

target="_blank"

rel="noopener noreferrer"

className="
w-12

h-12

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


<Github size={22}/>


</a>







{/* LINKEDIN */}

<a

href="https://www.linkedin.com/in/hanifalmahmudlubis/"

target="_blank"

rel="noopener noreferrer"

className="
w-12

h-12

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


<Linkedin size={22}/>


</a>







{/* EMAIL */}

<a

href="mailto:hanifmahmud2905@gmail.com"

className="
w-12

h-12

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


<Mail size={22}/>


</a>






</div>







{/* CONTACT TEXT */}

<div

className="
mt-6

text-sm

text-zinc-500

"

>


</div>





</div>




</div>



</Container>


</section>


)

}