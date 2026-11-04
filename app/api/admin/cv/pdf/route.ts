import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api/errors";
import { getCvDocumentData } from "@/lib/services/cv";
import { generateCvPdf } from "@/lib/cv-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const data = await getCvDocumentData();
    const { buffer, pageCount } = await generateCvPdf(data);
    const disposition =
      new URL(request.url).searchParams.get("download") === "1"
        ? "attachment"
        : "inline";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="Hanif_Almahmud_Lubis_CV.pdf"`,
        "Cache-Control": "private, no-store, max-age=0",
        Vary: "Cookie",
        "X-Content-Type-Options": "nosniff",
        "X-CV-Revision": data.revision || "",
        "X-CV-Page-Count": String(pageCount),
      },
    });
  } catch (error) {
    const response = await apiHandler(() => {
      throw error;
    });
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Vary", "Cookie");
    return response;
  }
}
