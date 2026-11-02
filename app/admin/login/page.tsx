import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import LoginForm from "@/components/admin/LoginForm";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin/dashboard");
  return <LoginForm />;
}
