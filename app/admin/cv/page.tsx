import { requireAdminPage } from "@/lib/admin";
import { getCvEditorData } from "@/lib/services/cv";
import PageHeading from "@/components/admin/PageHeading";
import CvBuilder from "@/components/admin/CvBuilder";

export const dynamic = "force-dynamic";
export default async function CvPage() {
  await requireAdminPage();
  const data = await getCvEditorData();
  return (
    <>
      <PageHeading
        title="CV"
        description="Kelola data bersama dan buat CV dari portofolio terbaru"
      />
      <CvBuilder initial={data} />
    </>
  );
}
