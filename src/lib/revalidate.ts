import { revalidatePath } from "next/cache";
export function refreshPortfolio() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/admin", "layout");
}
