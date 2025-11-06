"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout } from "@/lib/api";
import { useAuthGuard } from "@/lib/authGuard";
import CardLuxe from "@/app/components/ui/CardLuxe";
import Header from "@/app/components/dashboard/Header";
import Link from "next/link";
import {
  LogOut,
  Zap,
  Layers,
  Users,
  Wrench,
  Rocket,
} from "lucide-react";

export default function DashboardPage() {
  useAuthGuard();

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Largeur pour affichage responsive
  const [isWide, setIsWide] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1200;
  });

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 1200);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await me();
        setUser(data);
      } catch (err) {
        console.error("Erreur récupération utilisateur :", err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Chargement…
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "utilisateur";

  return (
    <div className="w-full flex flex-col items-center mt-[80px] px-4">
      {/* === HEADER GLOBAL === */}
      <Header />

      {/* === CONTENU DASHBOARD === */}
      <div className="w-full max-w-[1200px] flex flex-col items-center text-center space-y-8 mt-[80px]">

        {/* === TITRE PRINCIPAL === */}
        <h1 className="text-4xl font-bold text-[#ffb800]">
          ⚡ Tableau de bord LGD
        </h1>
        <p className="text-[#ffb800] text-lg mt-1">
          Heureux de te revoir, <span className="font-bold">{firstName}</span> 👋
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Bienvenue dans ton espace automatisé ✨
        </p>

        {/* === BOUTON DECONNEXION === */}
        <button
          onClick={logout}
          className="btn-luxe-blue flex justify-center items-center text-center mx-auto mt-6 mb-[30px] px-6 py-3 font-semibold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="mx-auto">Déconnexion</span>
        </button>

        {/* === GRILLE DE CARTES PRINCIPALES === */}
        <div
          className="w-full"
          style={
            isWide
              ? {
                  display: "grid",
                  gridTemplateColumns: "50px 550px 550px 50px",
                  columnGap: "32px",
                  rowGap: "32px",
                  justifyContent: "center",
                  alignItems: "start",
                }
              : {
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  rowGap: "32px",
                  justifyItems: "center",
                }
          }
        >
          {/* Gouttière gauche */}
          {isWide && <div />}

          {/* Colonne gauche */}
          <div className="flex flex-col items-center space-y-8">
            <CardItem
              icon={<Zap className="text-[#ffb800] w-8 h-8 mb-3 mx-auto" />}
              title="Automatisations"
              description="Gère et crée des automatisations intelligentes."
              href="/dashboard/automatisations"
              button="Gérer"
            />

            <CardItem
              icon={<Users className="text-[#ffb800] w-8 h-8 mb-3 mx-auto" />}
              title="Clients"
              description="Analyse et fidélise ta clientèle."
              href="/dashboard/clients"
              button="Voir"
            />
          </div>

          {/* Colonne droite */}
          <div className="flex flex-col items-center space-y-8">
            <CardItem
              icon={<Layers className="text-[#ffb800] w-8 h-8 mb-3 mx-auto" />}
              title="Campagnes"
              description="Lance et suis tes campagnes marketing."
              href="/dashboard/campagnes"
              button="Ouvrir"
            />

            <CardItem
              icon={<Wrench className="text-[#ffb800] w-8 h-8 mb-3 mx-auto" />}
              title="Outils LGD"
              description="Accède à l’ensemble de tes outils connectés."
              href="/dashboard/automatisations/tools"
              button="Explorer"
            />
          </div>

          {/* Gouttière droite */}
          {isWide && <div />}
        </div>

        {/* === BLOC ESPACE RAPIDE === */}
        <div className="dashboard-quick mt-[50px]">
          <h2>Espace rapide</h2>
          <div className="grid">
            <QuickCard
  icon={<Rocket className="text-[#ffb800]" />}
  title="Déclarer son activité"
  text="Un guide complet pas à pas pour choisir ton statut et t’enregistrer à l’URSSAF."
  href="/dashboard/formations/activite"
/>
            <QuickCard
              icon={<Zap className="text-[#ffb800]" />}
              title="Automatisations rapides"
              text="Crée une automatisation en un clic."
              href="/dashboard/automatisations"
            />

            <QuickCard
              icon={<Layers className="text-[#ffb800]" />}
              title="Campagne express"
              text="Lance une campagne marketing instantanément."
              href="/dashboard/campagnes"
            />

            <QuickCard
              icon={<Users className="text-[#ffb800]" />}
              title="Nouveau client"
              text="Ajoute rapidement un client à ta base."
              href="/dashboard/clients"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* === COMPOSANT DE CARTE PRINCIPALE === */
function CardItem({
  icon,
  title,
  description,
  href,
  button,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  button: string;
}) {
  return (
    <CardLuxe>
      <div className="w-full max-w-[400px] text-center flex flex-col items-center justify-between mx-auto">
        {icon}
        <h3 className="font-semibold text-lg text-[#ffb800] mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <Link href={href} className="btn-luxe">
          {button}
        </Link>
      </div>
    </CardLuxe>
  );
}

/* === COMPOSANT MINI-CARTE (ESPACE RAPIDE) === */
function QuickCard({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
}) {
  const content = (
    <div className="mini-card hover:scale-[1.02] transition-transform duration-300">
      <div className="flex flex-col items-center">
        {icon}
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
