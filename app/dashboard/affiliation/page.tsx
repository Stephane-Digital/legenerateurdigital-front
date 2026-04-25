"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "./components/AffiliationSubnav";
import CopyBlock from "./components/CopyBlock";
import CopyField from "./components/CopyField";

const AFFILIATE_LINK =
  "https://legenerateurdigital.systeme.io/proxy/request/56789eceba9c8bb2735359ffed9beadd2f7c8";

const LINKS = {
  canvaKit: "https://canva.link/2mzufsnxs1dl2so",
};

const quickStartSteps = [
  {
    title: "1) Copie ton lien affilié",
    text: "Utilise toujours ton lien officiel dans tous tes messages, posts, emails et stories.",
  },
  {
    title: "2) Choisis un angle simple",
    text: "Gain de temps, business digital, automatisation, création de contenu ou outil tout-en-un.",
  },
  {
    title: "3) Copie un script prêt",
    text: "Prends un DM, un email, un hook ou un post déjà prêt à l’emploi.",
  },
  {
    title: "4) Publie ou envoie",
    text: "Poste, envoie un DM, une relance WhatsApp ou un message LinkedIn avec CTA vers ton lien.",
  },
];

const scriptBlocks = [
  {
    title: "DM Instagram / Messenger — découverte",
    hint: "Usage : premier contact simple et naturel",
    text:
      "Salut 👋\nJe viens de découvrir une plateforme IA ultra complète qui aide à créer du contenu, des emails, des pages de vente et des automatisations beaucoup plus vite.\n\nFranchement, si tu développes un business en ligne, ça peut te faire gagner un temps énorme.\n\nJe peux t’envoyer le lien si tu veux 👌\n\n" +
      AFFILIATE_LINK,
  },
  {
    title: "WhatsApp — version directe",
    hint: "Usage : contact déjà tiède ou relation existante",
    text:
      "Hello 👋\nJe te partage un outil que je trouve vraiment puissant pour le business digital.\nIl aide à créer du contenu, structurer ses offres, générer des emails et avancer plus vite sans multiplier les outils.\n\nJe pense que ça peut clairement t’intéresser :\n" +
      AFFILIATE_LINK,
  },
  {
    title: "LinkedIn — version premium",
    hint: "Usage : audience pro / freelance / coach / consultant",
    text:
      "Bonjour,\nJe partage rarement ce type d’outil, mais celui-ci mérite le détour.\nLe Générateur Digital centralise plusieurs besoins clés : création de contenu, emails, pages marketing et automatisations, avec une logique orientée conversion.\n\nSi vous cherchez à gagner du temps tout en structurant mieux votre marketing, voici le lien :\n" +
      AFFILIATE_LINK,
  },
  {
    title: "Réponse Story / relance douce",
    hint: "Usage : suite à une story, un post ou une discussion",
    text:
      "Oui clairement, c’est le genre d’outil qui peut faire gagner un temps fou quand on veut créer, vendre et automatiser plus vite.\n\nJe te mets le lien ici si tu veux regarder tranquillement :\n" +
      AFFILIATE_LINK,
  },
];

const emailBlocks = [
  {
    title: "Email 1 — découverte",
    hint: "Usage : premier email de recommandation",
    text:
      "Objet : L’outil IA qui peut accélérer ton business digital\n\nHello,\n\nJe voulais te partager une plateforme que j’ai découverte récemment : Le Générateur Digital.\n\nL’idée est simple : t’aider à créer plus vite ton contenu, tes emails, tes pages marketing et tes automatisations sans t’éparpiller sur plusieurs outils.\n\nSi tu développes une activité en ligne, ça peut clairement te faire gagner un temps précieux.\n\nTu peux découvrir la plateforme ici :\n" +
      AFFILIATE_LINK +
      "\n\nÀ bientôt,",
  },
  {
    title: "Email 2 — objection / surcharge",
    hint: "Usage : pour les prospects qui manquent de temps",
    text:
      "Objet : Tu n’as pas besoin de tout faire seul\n\nHello,\n\nBeaucoup d’entrepreneurs perdent des heures à créer leurs contenus, écrire leurs emails ou structurer leurs pages.\n\nLe Générateur Digital a justement été pensé pour simplifier tout ça et aller plus vite sans sacrifier la qualité.\n\nSi tu veux voir comment ça fonctionne :\n" +
      AFFILIATE_LINK +
      "\n\nÀ bientôt,",
  },
  {
    title: "Email 3 — bénéfices",
    hint: "Usage : mise en avant des résultats concrets",
    text:
      "Objet : Créer, vendre et automatiser depuis un seul endroit\n\nHello,\n\nCe que j’aime avec Le Générateur Digital, c’est qu’il regroupe plusieurs besoins business au même endroit :\n- création de contenu\n- génération d’emails\n- pages marketing\n- automatisations\n\nRésultat : moins de dispersion, plus de clarté et plus de vitesse d’exécution.\n\nTu peux voir la plateforme ici :\n" +
      AFFILIATE_LINK +
      "\n\nÀ bientôt,",
  },
  {
    title: "Email 4 — urgence douce",
    hint: "Usage : relance sans pression agressive",
    text:
      "Objet : Tu as vu cette plateforme ?\n\nHello,\n\nJe te refais un petit message au cas où tu aurais manqué mon précédent email.\n\nLe Générateur Digital peut vraiment être intéressant si tu veux structurer ton marketing plus vite et gagner du temps au quotidien.\n\nVoici le lien pour regarder :\n" +
      AFFILIATE_LINK +
      "\n\nÀ bientôt,",
  },
];

const postBlocks = [
  {
    title: "Post Instagram / Facebook — court",
    hint: "Usage : post simple, rapide et direct",
    text:
      "Tu perds du temps à créer ton contenu, tes emails ou tes pages marketing ?\n\nJ’ai découvert une plateforme qui centralise tout ça pour aller beaucoup plus vite : Le Générateur Digital.\n\nSi tu développes un business en ligne, ça vaut clairement le détour.\n\n👉 Découvrir : " + AFFILIATE_LINK,
  },
  {
    title: "Post LinkedIn — premium",
    hint: "Usage : audience business / B2B / consultants",
    text:
      "Les entrepreneurs digitaux perdent souvent un temps énorme à jongler entre trop d’outils.\n\nLe Générateur Digital propose une approche plus centralisée : contenu, emails, pages marketing, automatisations.\n\nL’intérêt n’est pas seulement de produire plus, mais de mieux structurer son marketing et d’accélérer l’exécution.\n\nPour ceux que ça intéresse : " +
      AFFILIATE_LINK,
  },
  {
    title: "Post storytelling — avant / après",
    hint: "Usage : post plus personnel et engageant",
    text:
      "Avant, je voyais beaucoup d’entrepreneurs perdre un temps fou à tout gérer séparément : contenu, emails, pages, automatisations.\n\nAujourd’hui, il existe des plateformes beaucoup plus intelligentes pour avancer plus vite.\n\nLe Générateur Digital en fait partie, et c’est clairement le genre d’outil qui peut simplifier énormément le quotidien.\n\n👉 Lien ici : " +
      AFFILIATE_LINK,
  },
];

const hookBlocks = [
  {
    title: "Hooks courts",
    hint: "À utiliser dans tes posts, stories, emails et vidéos",
    text:
      "- Tu perds des heures à créer ton marketing ?\n- L’outil qui peut remplacer plusieurs outils business\n- Crée, vends et automatise plus vite\n- Le raccourci IA pour les entrepreneurs digitaux\n- Tu veux enfin gagner du temps sans sacrifier la qualité ?",
  },
  {
    title: "CTA affiliés",
    hint: "Appels à l’action prêts à copier",
    text:
      "- Découvrir LGD\n- Voir la plateforme\n- Tester l’outil\n- Créer mon business plus vite\n- Voir les plans\n- Accéder à LGD",
  },
  {
    title: "Promesses / angles de vente",
    hint: "À alterner selon la cible",
    text:
      "- Gagner du temps au quotidien\n- Centraliser plusieurs besoins marketing\n- Créer plus vite du contenu et des emails\n- Structurer son business digital\n- Automatiser sans complexifier",
  },
];

const reelBlocks = [
  {
    title: "Script Reel 15 sec",
    hint: "Format ultra court",
    text:
      "HOOK : Tu perds du temps à tout faire toi-même ?\nPROBLÈME : contenu, emails, pages, automatisations…\nSOLUTION : Le Générateur Digital centralise tout ça.\nCTA : Lien ici 👉 " +
      AFFILIATE_LINK,
  },
  {
    title: "Script Reel 30 sec",
    hint: "Format explication rapide",
    text:
      "HOOK : Si tu développes un business en ligne, regarde ça.\nPROBLÈME : trop d’outils, trop de temps perdu, trop de friction.\nSOLUTION : Le Générateur Digital aide à créer du contenu, des emails, des pages marketing et des automatisations plus vite.\nCTA : Je te mets le lien ici 👉 " +
      AFFILIATE_LINK,
  },
  {
    title: "Story face cam",
    hint: "Format simple pour Instagram / Facebook",
    text:
      "Je te partage un outil qui peut vraiment simplifier le marketing digital si tu es entrepreneur.\nLe Générateur Digital aide à créer, vendre et automatiser plus vite.\nSi tu veux voir, je te mets le lien ici 👉 " +
      AFFILIATE_LINK,
  },
];

const buttonPrimary =
  "inline-flex items-center justify-center text-center whitespace-nowrap w-full sm:w-auto min-w-[220px] py-3 px-6 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold rounded-2xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300";

const chipClass =
  "rounded-full border border-yellow-600/20 bg-[#0b0b0b] px-4 py-2 text-xs sm:text-sm text-yellow-100";

const sectionCardClass = "w-full px-5 sm:px-6 pt-6 pb-7 text-left";
const twoColumnSectionClass = "grid grid-cols-1 2xl:grid-cols-2 gap-8";

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl sm:text-2xl font-semibold text-[#ffb800]">{title}</h2>
      <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

export default function AffiliationKitPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[120px] pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl mx-auto text-center mb-6"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 mb-3">
            Kit Marketing Affiliation LGD
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
            Tout pour promouvoir LGD et convertir vite : lien affilié officiel, scripts prêts,
            emails, posts réseaux sociaux, hooks, CTA, visuels Canva et scripts Reels.
          </p>
        </motion.div>

        <AffiliationSubnav />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="space-y-8"
        >
          <CardLuxe className="w-full px-5 sm:px-8 pt-8 pb-8 text-center">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs uppercase tracking-[0.28em] text-yellow-300/80 mb-3">
                Affiliate Conversion Hub
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ffb800] leading-tight">
                Prends un angle, copie un script, envoie ton lien, convertis.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Ce kit a été pensé pour permettre à un affilié de promouvoir LGD en moins de
                5 minutes, même sans expérience marketing avancée.
              </p>
            </div>

            <div className="mt-8 flex flex-col lg:flex-row items-center justify-center gap-4">
              <a href="#lien-affilie" className={buttonPrimary}>
                Copier mon lien affilié
              </a>
              <a
                href={LINKS.canvaKit}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonPrimary}
              >
                Ouvrir visuels Canva
              </a>
            </div>
          </CardLuxe>

          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-8 items-start">
            <div id="lien-affilie">
              <CardLuxe className={sectionCardClass}>
                <SectionHeader
                  title="Ton lien affilié officiel"
                  description="Utilise ce lien dans tous tes emails, posts, DMs, stories, messages WhatsApp, publications LinkedIn et ressources externes."
                />

                <CopyField
                  label="Lien affilié officiel"
                  value={AFFILIATE_LINK}
                  helper="Conseil : garde toujours ce lien comme CTA final unique pour suivre correctement tes conversions."
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  {["Email", "DM Instagram", "Story", "WhatsApp", "LinkedIn", "Bio"].map(
                    (item) => (
                      <span key={item} className={chipClass}>
                        {item}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <a
                    href={AFFILIATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonPrimary}
                  >
                    Tester le lien
                  </a>
                </div>
              </CardLuxe>
            </div>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Quick Start — 5 minutes"
                description="Le chemin le plus simple pour commencer à promouvoir LGD tout de suite."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickStartSteps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-5"
                  >
                    <p className="text-yellow-200 font-semibold text-sm">{step.title}</p>
                    <p className="mt-2 text-sm text-gray-300 leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </CardLuxe>
          </div>

          <div className={twoColumnSectionClass}>
            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Scripts rapides"
                description="DM Instagram, Messenger, WhatsApp, LinkedIn et relance douce prêts à copier."
              />
              <div className="space-y-4">
                {scriptBlocks.map((block) => (
                  <CopyBlock
                    key={block.title}
                    title={block.title}
                    hint={block.hint}
                    text={block.text}
                  />
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Emails prêts à envoyer"
                description="Emails de découverte, objection, bénéfices et relance pour recommander LGD."
              />
              <div className="space-y-4">
                {emailBlocks.map((block) => (
                  <CopyBlock
                    key={block.title}
                    title={block.title}
                    hint={block.hint}
                    text={block.text}
                  />
                ))}
              </div>
            </CardLuxe>
          </div>

          <div className={twoColumnSectionClass}>
            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Posts réseaux sociaux"
                description="Publications prêtes pour Instagram, Facebook et LinkedIn."
              />
              <div className="space-y-4">
                {postBlocks.map((block) => (
                  <CopyBlock
                    key={block.title}
                    title={block.title}
                    hint={block.hint}
                    text={block.text}
                  />
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Hooks, CTA & angles"
                description="Des accroches courtes, des appels à l’action et des promesses à réutiliser partout."
              />
              <div className="space-y-4">
                {hookBlocks.map((block) => (
                  <CopyBlock
                    key={block.title}
                    title={block.title}
                    hint={block.hint}
                    text={block.text}
                  />
                ))}
              </div>
            </CardLuxe>
          </div>

          <div className={twoColumnSectionClass}>
            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Assets premium"
                description="Zone visuels officiels : stories, posts, carrousels, covers Reels et bannières."
              />

              <CopyField
                label="Lien Canva officiel"
                value={LINKS.canvaKit}
                helper="Canva view-only pour garder une cohérence premium et stable de la marque LGD."
                className="mb-5"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    title: "Stories Instagram",
                    text: "Visuels courts pour trafic chaud, DM et CTA rapide.",
                  },
                  {
                    title: "Posts carrés",
                    text: "Posts branding et découverte de la plateforme.",
                  },
                  {
                    title: "Carrousels promo",
                    text: "Formats pédagogiques orientés douleur, solution et CTA.",
                  },
                  {
                    title: "Bannières & covers",
                    text: "Supports pour emails, pages et vidéos courtes.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4"
                  >
                    <p className="text-yellow-200 font-semibold text-sm">{item.title}</p>
                    <p className="mt-2 text-sm text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={LINKS.canvaKit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonPrimary}
                >
                  Ouvrir Canva (view-only)
                </a>
              </div>
            </CardLuxe>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Scripts Reels / Stories"
                description="Scripts courts pour vidéo face cam, démonstration écran ou story rapide."
              />
              <div className="space-y-4">
                {reelBlocks.map((block) => (
                  <CopyBlock
                    key={block.title}
                    title={block.title}
                    hint={block.hint}
                    text={block.text}
                  />
                ))}
              </div>
            </CardLuxe>
          </div>

          <CardLuxe className={sectionCardClass}>
            <SectionHeader
              title="Tunnel recommandé"
              description="Un tunnel simple, clair et rentable pour transformer ton trafic en commissions récurrentes."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {[
                "Post / Reel",
                "DM / message",
                "Clic sur ton lien affilié",
                "Achat LGD",
                "Commission récurrente",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-5 text-center"
                >
                  <p className="text-yellow-200 font-semibold text-sm">Étape {index + 1}</p>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Tunnel simple conseillé : 1 post ou 1 Reel → 1 DM ou relance → clic sur ton lien
                affilié → inscription LGD → commission récurrente tant que l’abonné reste actif.
              </p>
            </div>
          </CardLuxe>
        </motion.div>

        <p className="mt-12 text-center text-xs text-gray-500">
          © 2026 Le Générateur Digital — Kit Marketing Affiliation
        </p>
      </div>
    </div>
  );
}
