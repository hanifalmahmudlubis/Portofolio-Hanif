import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";

import { prisma } from "./prisma";

import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";


export const authOptions: NextAuthOptions = {


  adapter: PrismaAdapter(prisma),


  session: {
    strategy: "jwt",
  },


  providers: [

    CredentialsProvider({

      name: "Credentials",


      credentials: {

        email: {
          label: "Email",
          type: "email",
        },


        password: {
          label: "Password",
          type: "password",
        },


      },


      async authorize(credentials) {


        if (!credentials?.email || !credentials.password) {

          return null;

        }


        const user = await prisma.user.findUnique({

          where:{
            email: credentials.email
          }

        });



        if(!user){

          return null;

        }



        const passwordMatch = await bcrypt.compare(

          credentials.password,

          user.password

        );



        if(!passwordMatch){

          return null;

        }



        return {

          id:user.id,

          email:user.email,

          role:user.role,

        };


      },


    }),


  ],




  callbacks:{


    async jwt({token,user}){


      if(user){

        token.id=user.id;

        token.role=user.role;

      }


      return token;


    },



    async session({session,token}){


      if(session.user){


        session.user.id = token.id as string;

        session.user.role = token.role as string;


      }


      return session;


    },


  },



  pages:{


    signIn:"/admin/login"


  },



  secret: process.env.NEXTAUTH_SECRET,


};