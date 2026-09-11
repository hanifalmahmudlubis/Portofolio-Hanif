import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(){

 const projects = await prisma.project.count();
 const experience = await prisma.experience.count();
 const certificates = await prisma.certificate.count();


 return NextResponse.json({
   projects,
   experience,
   certificates
 });

}