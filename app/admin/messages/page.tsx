import { requireAdminPage } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Messages from "@/components/admin/Messages";
import PageHeading from "@/components/admin/PageHeading";
export default async function Page() {
  await requireAdminPage();
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });
  return (
    <>
      <PageHeading
        title="Pesan masuk"
        description="Percakapan baru dimulai dari sini. Pesan dari formulir kontak portofolio Anda."
      />
      <Messages
        messages={messages.map((message) => ({
          ...message,
          createdAt: message.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
