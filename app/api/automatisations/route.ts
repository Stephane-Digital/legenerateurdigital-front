import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// ✅ Eviter la recréation multiple de PrismaClient en dev
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// ✅ Récupérer toutes les automatisations (plus récentes en haut)
export async function GET() {
  try {
    const data = await prisma.automatisation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur GET /automatisations :", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}

// ✅ Créer une nouvelle automatisation
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newAuto = await prisma.automatisation.create({
      data: {
        name: body.name || "Nouvelle automatisation",
        description: body.description || "Aucune description pour le moment.",
        status: "Active",
        color: "green",
      },
    });

    return NextResponse.json(newAuto);
  } catch (error) {
    console.error("Erreur POST /automatisations :", error);
    return NextResponse.json({ error: "Erreur de création" }, { status: 500 });
  }
}

// ✅ Mettre à jour le statut et la couleur associée
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    let color = "gray";
    if (status === "Active") color = "green";
    else if (status === "En pause") color = "orange";

    const updated = await prisma.automatisation.update({
      where: { id },
      data: { status, color },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur PATCH /automatisations :", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

// ✅ Supprimer une automatisation
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.automatisation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /automatisations :", error);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
