import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(request: NextRequest) {


  const token = request.cookies.get(
    "next-auth.session-token"
  );


  const pathname = request.nextUrl.pathname;



  // halaman admin
  const isAdminRoute =
    pathname.startsWith("/admin");


  // halaman login
  const isLoginPage =
    pathname.startsWith("/admin/login");



  // kalau masuk admin tapi belum login
  // kecuali halaman login

  if(
    isAdminRoute &&
    !isLoginPage &&
    !token
  ){

    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      )
    );

  }



  return NextResponse.next();

}



export const config = {

 matcher:[
   "/admin/:path*"
 ]

};