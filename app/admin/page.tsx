import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
export default async function AdminPage() {
  await requireAdminPage();
  redirect("/admin/dashboard");
}
