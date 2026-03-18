import { getPage } from "@/utils/sales_api";

// ⚠ Next.js 15 : params est une Promise → on doit l’attendre
export default async function PublicSalesPage(props: any) {
  const { id } = await props.params; // important

  const page = await getPage(id);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
        Page introuvable.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-3xl mx-auto prose prose-invert">
        {/* TITRE */}
        <h1 className="text-yellow-400 text-4xl font-bold mb-6">
          {page.title}
        </h1>

        {/* LISTE DES BLOCS */}
        {(page.blocks || []).map((b: any, i: number) => (
          <div
            key={i}
            className="mb-10"
            dangerouslySetInnerHTML={{ __html: b.html }}
          />
        ))}
      </div>
    </div>
  );
}
