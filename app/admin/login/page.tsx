import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import LoginForm from "@/components/admin/LoginForm";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  if (await getAdmin()) redirect("/admin/dashboard");
  const { reason } = await searchParams;
  return (
    <LoginForm expired={reason === "expired"} reset={reason === "reset"} />
  );
}
