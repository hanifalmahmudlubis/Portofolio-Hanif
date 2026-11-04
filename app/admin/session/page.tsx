import type { Metadata } from "next";
import SessionReset from "@/components/admin/SessionReset";

export const metadata: Metadata = { title: "Sesi browser" };

export default function SessionPage() {
  return <SessionReset />;
}
