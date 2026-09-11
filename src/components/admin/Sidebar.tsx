"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Award,
  MessageSquare,
  LogOut
} from "lucide-react";


export default function Sidebar(){

return (

<aside className="
w-64
min-h-screen
bg-zinc-950
border-r
border-white/10
text-white
p-6
">


<h1 className="
text-xl
font-bold
mb-10
">
Hanif CMS
</h1>


<nav className="
space-y-3
">


<Link
href="/admin/dashboard"
className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-white/10
"
>
<LayoutDashboard size={18}/>
Dashboard
</Link>



<Link
href="/admin/projects"
className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-white/10
"
>
<FolderKanban size={18}/>
Projects
</Link>



<Link
href="/admin/experience"
className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-white/10
"
>
<Briefcase size={18}/>
Experience
</Link>



<Link
href="/admin/certificate"
className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-white/10
"
>
<Award size={18}/>
Certificate
</Link>



<Link
href="/admin/messages"
className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-white/10
"
>
<MessageSquare size={18}/>
Messages
</Link>


</nav>


<div className="
absolute
bottom-6
">

<button
className="
flex
items-center
gap-3
text-red-400
"
>

<LogOut size={18}/>
Logout

</button>

</div>


</aside>


)

}