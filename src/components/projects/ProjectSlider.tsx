"use client";


import Image from "next/image";

import {
Swiper,
SwiperSlide
} from "swiper/react";


import {
Autoplay,
Pagination,
Navigation
} from "swiper/modules";


import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";




type ImageType={

id:string;

imageUrl:string;

};




export default function ProjectSlider({

images

}:{

images:ImageType[];

}){


return (


<div className="

relative

w-full

">


<Swiper


modules={[

Autoplay,

Pagination,

Navigation

]}




spaceBetween={30}



slidesPerView={1}



navigation



pagination={{

clickable:true

}}



autoplay={{

delay:4000,

disableOnInteraction:false

}}




loop={images.length > 1}




breakpoints={{



640:{

slidesPerView:1

},



1024:{

slidesPerView:1

}



}}




className="
rounded-3xl
overflow-hidden
"

>



{

images.map((image)=>(



<SwiperSlide

key={image.id}

>



<div className="


relative

w-full

aspect-video

rounded-3xl

overflow-hidden

bg-black

border

border-white/10


">





<Image


src={image.imageUrl}



alt="Project screenshot"



fill



sizes="100vw"



className="

object-contain

p-4

"



/>





</div>



</SwiperSlide>



))


}





</Swiper>



</div>


)

}