import { requireAdminPage } from "@/lib/admin";
import { getIntroImage } from "@/lib/services/profile";
import PageHeading from "@/components/admin/PageHeading";
import IntroPhotoForm from "@/components/admin/IntroPhotoForm";

export default async function ProfilePage() {
  await requireAdminPage();
  const introImageUrl = await getIntroImage();
  return (
    <>
      <PageHeading
        title="Foto intro"
        description="Ubah foto yang tampil di bagian intro"
      />
      <IntroPhotoForm initialUrl={introImageUrl} />
    </>
  );
}
