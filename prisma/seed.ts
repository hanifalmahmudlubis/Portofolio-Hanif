import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();


async function main() {


  console.log("Cleaning database...");


  // ==========================
  // CLEAR DATABASE
  // ==========================

  await prisma.projectTechnology.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.technology.deleteMany();

  await prisma.experience.deleteMany();
  await prisma.certificate.deleteMany();

  await prisma.user.deleteMany();



  // ==========================
  // ADMIN USER
  // ==========================

  await prisma.user.create({

    data:{
      email:"admin@hanifportfolio.com",
      password:"admin123",
      role:"ADMIN"
    }

  });



  // ==========================
  // TECHNOLOGIES
  // ==========================


  const techList = [

    {
      name:"Python",
      category:"Machine Learning"
    },

    {
      name:"CatBoost",
      category:"Machine Learning"
    },

    {
      name:"Scikit-learn",
      category:"Machine Learning"
    },

    {
      name:"Pandas",
      category:"Machine Learning"
    },

    {
      name:"SHAP",
      category:"Machine Learning"
    },


    {
      name:"PHP",
      category:"Programming"
    },

    {
      name:"JavaScript",
      category:"Programming"
    },

    {
      name:"HTML",
      category:"Frontend"
    },

    {
      name:"CSS",
      category:"Frontend"
    },


    {
      name:"Laravel",
      category:"Framework"
    },


    {
      name:"MySQL",
      category:"Database"
    },


    {
      name:"QGIS",
      category:"Tools"
    },


    {
      name:"Flutter",
      category:"Mobile"
    },


    {
      name:"Dart",
      category:"Mobile"
    },


    {
      name:"n8n",
      category:"Automation"
    }

  ];



  const technologies = await Promise.all(

    techList.map((tech)=>


      prisma.technology.create({

        data:tech

      })

    )

  );



  const tech = Object.fromEntries(

    technologies.map((item)=>[
      item.name,
      item.id
    ])

  );




  // ==========================
  // PROJECTS
  // ==========================


  const projects = await prisma.project.createMany({

    data:[


      {

        title:
        "SKTM Eligibility Recommendation System",

        slug:
        "sktm-eligibility-recommendation-system",

        shortDescription:
        "Machine learning-based recommendation system for SKTM eligibility classification.",

        fullDescription:
        "Developed a machine learning model to classify SKTM eligibility using applicant data with preprocessing, feature engineering, model training, evaluation, and SHAP interpretation.",

        category:
        "Machine Learning",

        projectType:
        "Academic Project",

        year:2026,

        problem:
        "Manual SKTM eligibility verification requires significant time and may produce inconsistent decisions.",

        solution:
        "Built a machine learning classification system using CatBoost with SHAP interpretation to provide transparent prediction results.",

        featured:true,

        published:true

      },


      {


        title:
        "Geographic Information System for Government Offices in Medan",

        slug:
        "gis-government-offices-medan",

        shortDescription:
        "Web-based Geographic Information System for government office spatial information.",


        fullDescription:
        "Developed GIS application integrating spatial data processed using QGIS into a web application.",


        category:
        "Web Development",

        projectType:
        "Academic Project",

        year:2025,

        problem:
        "Government office location information requires better spatial visualization.",

        solution:
        "Created web-based GIS system to display government office information using spatial data.",


        featured:true,

        published:true

      },



      {


        title:
        "Clinic Management Mobile Application",


        slug:
        "clinic-management-mobile-application",


        shortDescription:
        "Mobile application for basic clinic management activities.",


        fullDescription:
        "Developed mobile clinic management application using Flutter and Dart.",


        category:
        "Mobile Development",


        projectType:
        "Academic Project",


        year:2025,


        problem:
        "Clinic activities require simple digital management solutions.",


        solution:
        "Built mobile application to support basic clinic management processes.",


        featured:true,

        published:true

      },



      {


        title:
        "Course Management Website",


        slug:
        "course-management-website",


        shortDescription:
        "Database-driven web application for course information management.",


        fullDescription:
        "Developed CRUD-based course management website using PHP and MySQL.",


        category:
        "Web Development",


        projectType:
        "Academic Project",


        year:2024,


        problem:
        "Course information management requires structured digital storage.",


        solution:
        "Created CRUD web application connected with MySQL database.",


        featured:false,

        published:true

      }


    ]

  });



  const projectData = await prisma.project.findMany();



  // ==========================
  // PROJECT TECHNOLOGY RELATION
  // ==========================


  const relationData = [


    {
      slug:
      "sktm-eligibility-recommendation-system",

      technologies:[
        "Python",
        "CatBoost",
        "Scikit-learn",
        "Pandas",
        "SHAP"
      ]
    },


    {

      slug:
      "gis-government-offices-medan",

      technologies:[
        "PHP",
        "JavaScript",
        "MySQL",
        "QGIS"
      ]

    },


    {

      slug:
      "clinic-management-mobile-application",

      technologies:[
        "Flutter",
        "Dart"
      ]

    },


    {

      slug:
      "course-management-website",

      technologies:[
        "PHP",
        "HTML",
        "CSS",
        "JavaScript",
        "MySQL"
      ]

    }


  ];




  for(const item of relationData){


    const project =
    projectData.find(
      p=>p.slug===item.slug
    );


    if(!project) continue;



    for(const techName of item.technologies){


      await prisma.projectTechnology.create({

        data:{


          projectId:
          project.id,


          technologyId:
          tech[techName]

        }

      });


    }

  }





  // ==========================
  // EXPERIENCE
  // ==========================


  await prisma.experience.createMany({

    data:[


      {

        company:
        "Dinas Komunikasi dan Informatika Provinsi Sumatera Utara",

        position:
        "Network Division Intern",

        location:
        "Medan, Indonesia",

        startDate:
        "Jan 2026",

        endDate:
        "Feb 2026",

        description:
        "Assisted network troubleshooting, performed network speed testing, supported network monitoring activities, and participated in an n8n automation project."

      },


      {

        company:
        "Dinas Sosial Kota Medan",

        position:
        "Web Development Intern",

        location:
        "Medan, Indonesia",

        startDate:
        "Sep 2024",

        endDate:
        "Dec 2024",

        description:
        "Developed internal website features using HTML, CSS, JavaScript, and Laravel. Performed debugging and optimization."

      },


      {

        company:
        "Merdeka Belajar Kampus Merdeka",

        position:
        "Independent Student Exchange Program",

        location:
        "Indonesia",

        startDate:
        "Sep 2023",

        endDate:
        "Jan 2024",

        description:
        "Participated in cross-cultural collaboration activities and improved communication, teamwork, and adaptability skills."

      }


    ]

  });





  // ==========================
  // CERTIFICATE
  // ==========================


  await prisma.certificate.createMany({

    data:[


      {

        title:
        "Cloud Practitioner Essentials",

        issuer:
        "Dicoding Indonesia",

        year:
        "2024"

      },


      {

        title:
        "Belajar Dasar Pemrograman Web",

        issuer:
        "Dicoding Indonesia",

        year:
        "2024"

      },


      {

        title:
        "Belajar Dasar Pemrograman JavaScript",

        issuer:
        "Dicoding Indonesia",

        year:
        "2024"

      },


      {

        title:
        "Belajar Membuat Front-End Web Bagi Pemula",

        issuer:
        "Dicoding Indonesia",

        year:
        "2024"

      }


    ]

  });



  console.log("Seed completed successfully");


}



main()


.then(()=>{

  console.log("Done");

})

.catch((error)=>{

  console.error(error);

  process.exit(1);

})

.finally(async()=>{

  await prisma.$disconnect();

  const passwordHash = await bcrypt.hash(
  "admin123",
  10
);


await prisma.user.create({
  data:{
    email:"admin@admin.com",
    password:passwordHash,
    role:"ADMIN"
  }
});

});