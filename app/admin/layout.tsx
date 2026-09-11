import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";


export default function AdminLayout({
children
}:{
children:React.ReactNode
}){


return (

<div className="
flex
min-h-screen
bg-black
">


<Sidebar/>


<div className="
flex-1
">


<Header/>


{children}


</div>


</div>

)

}