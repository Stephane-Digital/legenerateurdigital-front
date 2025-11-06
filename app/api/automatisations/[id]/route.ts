import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Supprimer une automatisation
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  await prisma.automatisation.delete({ where: { id } });
  return NextResponse.json({ message: "Automatisation supprimée" });
}

// ✅ Mettre à jour le statut
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await req.json();

  const updated = await prisma.automatisation.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}
