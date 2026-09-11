export interface Project {
  id:string;
  title:string;
  slug:string;
  shortDescription:string;
  category:string;
  year:number;

  githubUrl:string | null;
  liveDemoUrl:string | null;

  technologies:{
    technology:{
      name:string;
    }
  }[];
}