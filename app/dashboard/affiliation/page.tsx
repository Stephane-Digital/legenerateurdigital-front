"use client";

import { useMemo, useState } from "react";
import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "./components/AffiliationSubnav";
import CopyBlock from "./components/CopyBlock";
import CopyField from "./components/CopyField";

const BASE_LGD_URL = "https://legenerateurdigital.systeme.io";
const AFFILIATE_LINK_TEMPLATE = "https://legenerateurdigital.systeme.io?sa=TON_IDENTIFIANT";
const AFFILIATE_LINK_EXAMPLE =
  "https://legenerateurdigital.systeme.io?sa=sa02698613581505ce9959d1609a94205a3a64efb9";

const LINKS = {
  googleDocs:
    "https://docs.google.com/document/d/17VMKD7tfE1lLoMI9GGFF2NzgLy1MQxi00Rs2wPBRyxY/edit?tab=t.0",
  canvaKit:
    "https://www.canva.com/design/DAHH2J0asfQ/zPebjpAzUXWM7dO2b8E9Dw/view?utm_content=DAHH2J0asfQ&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h1044b0fdc1",
};

const quickStartSteps = [
  {
    title: "1) Crée ton compte Systeme.io gratuit",
    text: "Un compte gratuit suffit pour accéder à ton espace affilié Systeme.io et récupérer ton identifiant.",
  },
  {
    title: "2) Récupère ton identifiant affilié",
    text: "Dans Systeme.io, copie ton identifiant affilié personnel. Il commence généralement par sa…",
  },
  {
    title: "3) Génère ton lien LGD",
    text: "Ajoute simplement ?sa=TON_IDENTIFIANT à l’URL officielle LGD.",
  },
  {
    title: "4) Partage et touche jusqu’à 60%",
    text: "Utilise ton lien dans tes contenus, emails, DMs, stories, vidéos et ressources de promotion.",
  },
];

const scriptBlocks = [
  {
    title: "DM Instagram / Messenger — découverte",
    hint: "Usage : premier contact simple et naturel",
    text:
      "Salut 👋\nJe te partage une plateforme IA que tu peux recommander à ton audience si elle s’intéresse au business en ligne, au marketing digital ou à la création de contenu.\n\nLe Générateur Digital aide à créer des contenus, emails, pages et automatisations depuis un seul endroit.\n\nTu peux créer ton lien affilié LGD en ajoutant ton identifiant Systeme.io à cette URL :\n" +
      AFFILIATE_LINK_TEMPLATE,
  },
  {
    title: "WhatsApp — version directe",
    hint: "Usage : contact déjà tiède ou relation existante",
    text:
      "Hello 👋\nSi tu veux recommander un outil utile aux entrepreneurs digitaux, LGD peut vraiment intéresser ton audience.\n\nTu crées ton compte Systeme.io gratuit, tu récupères ton identifiant affilié, puis tu partages ton lien sous cette forme :\n" +
      AFFILIATE_LINK_TEMPLATE,
  },
  {
    title: "LinkedIn — version premium",
    hint: "Usage : audience pro / freelance / coach / consultant",
    text:
      "Bonjour,\nLe Générateur Digital est une plateforme IA orientée marketing digital, création de contenu, emails, pages de vente et automatisations.\n\nPour recommander LGD, il suffit de créer un compte Systeme.io gratuit puis d’ajouter son identifiant affilié à l’URL officielle :\n" +
      AFFILIATE_LINK_TEMPLATE,
  },
  {
    title: "Réponse Story / relance douce",
    hint: "Usage : suite à une story, un post ou une discussion",
    text:
      "Oui, tu peux promouvoir LGD très simplement. Tu récupères ton ID affilié Systeme.io, puis tu le colles après ?sa= dans le lien LGD.\n\nFormat à utiliser :\n" +
      AFFILIATE_LINK_TEMPLATE,
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

function normalizeAffiliateId(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/legenerateurdigital\.systeme\.io\??/i, "")
    .replace(/^\?sa=/i, "")
    .replace(/^sa=/i, "")
    .replace(/\s+/g, "");
}

export default function AffiliationKitPage() {
  const [affiliateId, setAffiliateId] = useState("TON_IDENTIFIANT");

  const generatedLink = useMemo(() => {
    const cleanId = normalizeAffiliateId(affiliateId) || "TON_IDENTIFIANT";
    return `${BASE_LGD_URL}?sa=${cleanId}`;
  }, [affiliateId]);

  const emailBlocks = [
    {
      title: "Email 1 — découverte",
      hint: "Usage : premier email de recommandation",
      text:
        "Objet : Tu peux recommander LGD et toucher jusqu’à 60%\n\nHello,\n\nSi tu as une audience intéressée par le business en ligne, le marketing digital ou les outils IA, tu peux recommander Le Générateur Digital.\n\nLe principe est simple : tu crées un compte Systeme.io gratuit, tu récupères ton identifiant affilié, puis tu ajoutes ?sa=TON_IDENTIFIANT à l’URL LGD.\n\nTon lien ressemble à ça :\n" +
        AFFILIATE_LINK_TEMPLATE +
        "\n\nÀ bientôt,",
    },
    {
      title: "Email 2 — objection / technique",
      hint: "Usage : pour rassurer ceux qui pensent que c’est compliqué",
      text:
        "Objet : Pas besoin d’intégration compliquée\n\nHello,\n\nPour promouvoir LGD, tu n’as pas besoin de tunnel compliqué.\n\nTu crées ton compte Systeme.io gratuit, tu récupères ton identifiant affilié, puis tu génères ton lien LGD avec ce format :\n" +
        AFFILIATE_LINK_TEMPLATE +
        "\n\nEnsuite, tu peux le partager dans tes emails, DMs, posts, stories ou contenus.\n\nÀ bientôt,",
    },
    {
      title: "Email 3 — bénéfices",
      hint: "Usage : mise en avant de la simplicité affilié",
      text:
        "Objet : Une recommandation simple à partager\n\nHello,\n\nLGD est intéressant à recommander parce que la plateforme parle à beaucoup d’entrepreneurs digitaux : création de contenu, emails, pages, automatisations et IA marketing.\n\nTu peux partager ton lien affilié sous ce format :\n" +
        AFFILIATE_LINK_TEMPLATE +
        "\n\nChaque abonné actif peut te générer jusqu’à 60% de commission récurrente.\n\nÀ bientôt,",
    },
  ];

  const postBlocks = [
    {
      title: "Post Instagram / Facebook — court",
      hint: "Usage : post simple, rapide et direct",
      text:
        "Tu as une audience intéressée par le business en ligne ou le marketing digital ?\n\nTu peux recommander Le Générateur Digital et toucher jusqu’à 60% de commission récurrente.\n\nCrée ton compte Systeme.io gratuit, récupère ton identifiant affilié, puis génère ton lien LGD ici :\n" +
        AFFILIATE_LINK_TEMPLATE,
    },
    {
      title: "Post LinkedIn — premium",
      hint: "Usage : audience business / B2B / consultants",
      text:
        "Le Générateur Digital est une plateforme IA pensée pour aider les entrepreneurs à créer, vendre et automatiser plus vite.\n\nPour la recommander, il suffit d’utiliser son identifiant affilié Systeme.io dans l’URL officielle LGD :\n" +
        AFFILIATE_LINK_TEMPLATE +
        "\n\nSimple, traçable et orienté commissions récurrentes.",
    },
    {
      title: "Post storytelling — avant / après",
      hint: "Usage : post plus personnel et engageant",
      text:
        "Avant, recommander un outil demandait souvent un tunnel compliqué.\n\nAvec LGD + Systeme.io, le principe est beaucoup plus simple : un identifiant affilié, une URL, puis un lien à partager.\n\nFormat du lien :\n" +
        AFFILIATE_LINK_TEMPLATE,
    },
  ];

  const hookBlocks = [
    {
      title: "Hooks courts",
      hint: "À utiliser dans tes posts, stories, emails et vidéos",
      text:
        "- Tu veux recommander un outil IA utile aux entrepreneurs digitaux ?\n- Ton lien affilié LGD se crée en 30 secondes\n- Un ID Systeme.io + une URL LGD = ton lien affilié\n- Jusqu’à 60% de commission récurrente sur LGD\n- Tu peux promouvoir LGD sans tunnel compliqué",
    },
    {
      title: "CTA affiliés",
      hint: "Appels à l’action prêts à copier",
      text:
        "- Créer mon lien affilié LGD\n- Récupérer mon identifiant Systeme.io\n- Générer mon lien LGD\n- Accéder au kit marketing\n- Promouvoir LGD maintenant",
    },
    {
      title: "Format officiel du lien",
      hint: "À rappeler aux affiliés",
      text:
        "Format officiel à utiliser :\n" +
        AFFILIATE_LINK_TEMPLATE +
        "\n\nExemple réel :\n" +
        AFFILIATE_LINK_EXAMPLE,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-[120px] pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl mx-auto text-center mb-6"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-yellow-300/80">
            Affiliation LGD x Systeme.io
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 mb-3">
            Crée ton lien affilié LGD en 30 secondes
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base">
            Crée gratuitement un compte Systeme.io, récupère ton identifiant affilié, puis ajoute
            simplement <span className="text-yellow-200 font-semibold">?sa=ton_identifiant</span> à
            l’URL officielle LGD.
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
                Premium Affiliate Flow
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#ffb800] leading-tight">
                Un identifiant Systeme.io, une URL LGD, un lien prêt à partager.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Le programme affiliation LGD fonctionne avec le tracking Systeme.io. Tu ne cliques
                pas sur un bouton magique : tu construis ton lien avec ton identifiant affilié.
              </p>
            </div>

            <div className="mt-8 flex flex-col lg:flex-row items-center justify-center gap-4">
              <a href="#generateur-lien" className={buttonPrimary}>
                Générer mon lien LGD
              </a>
              <a href={LINKS.googleDocs} target="_blank" rel="noopener noreferrer" className={buttonPrimary}>
                Ouvrir les ressources affiliés
              </a>
            </div>
          </CardLuxe>

          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr] gap-8 items-start">
            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Comment ça marche"
                description="Le vrai fonctionnement affiliation Systeme.io, sans promesse confuse ni faux bouton d’inscription automatique."
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

            <div id="generateur-lien">
              <CardLuxe className={sectionCardClass}>
                <SectionHeader
                  title="Générateur automatique de lien affilié"
                  description="Colle ton identifiant affilié Systeme.io ci-dessous. Ton lien LGD est généré automatiquement au bon format."
                />

                <label className="block text-xs text-gray-400 sm:text-sm" htmlFor="affiliate-id">
                  Ton identifiant affilié Systeme.io
                </label>
                <input
                  id="affiliate-id"
                  value={affiliateId}
                  onChange={(event) => setAffiliateId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-4 py-3 text-sm text-yellow-100 outline-none transition-all duration-300 placeholder:text-gray-600 focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-500/10 sm:text-base"
                  placeholder="Exemple : sa02698613581505ce9959d1609a94205a3a64efb9"
                />

                <div className="mt-5">
                  <CopyField
                    label="Ton lien affilié LGD généré"
                    value={generatedLink}
                    helper="Format officiel : https://legenerateurdigital.systeme.io?sa=ton_identifiant"
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Exemple réel validé : <span className="break-all text-yellow-200">{AFFILIATE_LINK_EXAMPLE}</span>
                  </p>
                </div>
              </CardLuxe>
            </div>
          </div>

          <div className={twoColumnSectionClass}>
            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Quick Start — 5 minutes"
                description="Le chemin le plus court pour passer de zéro à un lien affilié LGD prêt à partager."
              />
              <div className="space-y-4">
                {[
                  "Créer un compte Systeme.io gratuit.",
                  "Ouvrir son espace affiliation Systeme.io.",
                  "Copier son identifiant affilié personnel.",
                  "Coller l’identifiant dans le générateur LGD ci-dessus.",
                  "Partager son lien dans les contenus, DMs, emails ou stories.",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4"
                  >
                    <p className="text-yellow-200 font-semibold text-sm">Étape {index + 1}</p>
                    <p className="mt-2 text-sm text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Kit marketing affilié"
                description="Tu n’as rien à créer : textes, angles, scripts et visuels sont déjà centralisés."
              />

              <div className="grid grid-cols-1 gap-4">
                <a
                  href={LINKS.googleDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-5 py-5 transition-all duration-300 hover:border-yellow-400/50 hover:bg-yellow-500/10"
                >
                  <p className="text-yellow-200 font-semibold">Google Docs — ressources affiliés</p>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                    Scripts de vente, messages DM, emails, angles marketing, objections/réponses et textes prêts à copier.
                  </p>
                </a>

                <a
                  href={LINKS.canvaKit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-5 py-5 transition-all duration-300 hover:border-yellow-400/50 hover:bg-yellow-500/10"
                >
                  <p className="text-yellow-200 font-semibold">Canva — créatifs prêts à publier</p>
                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                    Visuels premium LGD, posts réseaux sociaux, stories et créas modifiables en quelques clics.
                  </p>
                </a>
              </div>
            </CardLuxe>
          </div>

          <div className={twoColumnSectionClass}>
            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Scripts rapides"
                description="Messages prêts à copier pour expliquer le vrai flow affiliation LGD + Systeme.io."
              />
              <div className="space-y-4">
                {scriptBlocks.map((block) => (
                  <CopyBlock key={block.title} title={block.title} hint={block.hint} text={block.text} />
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Emails prêts à envoyer"
                description="Emails de recommandation orientés création du lien affilié LGD."
              />
              <div className="space-y-4">
                {emailBlocks.map((block) => (
                  <CopyBlock key={block.title} title={block.title} hint={block.hint} text={block.text} />
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
                  <CopyBlock key={block.title} title={block.title} hint={block.hint} text={block.text} />
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className={sectionCardClass}>
              <SectionHeader
                title="Hooks, CTA & lien officiel"
                description="Accroches, appels à l’action et rappel du format officiel."
              />
              <div className="space-y-4">
                {hookBlocks.map((block) => (
                  <CopyBlock key={block.title} title={block.title} hint={block.hint} text={block.text} />
                ))}
              </div>
            </CardLuxe>
          </div>

          <CardLuxe className={sectionCardClass}>
            <SectionHeader
              title="FAQ anti-friction"
              description="Les réponses simples aux questions qui bloquent le passage à l’action."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "Est-ce que LGD crée automatiquement mon lien affilié ?",
                  a: "Non. Le tracking passe par Systeme.io. Tu dois créer ton compte Systeme.io gratuit, récupérer ton identifiant affilié et l’ajouter à l’URL LGD.",
                },
                {
                  q: "Quel est le bon format de lien ?",
                  a: AFFILIATE_LINK_TEMPLATE,
                },
                {
                  q: "Est-ce que je peux utiliser les ressources marketing ?",
                  a: "Oui. Le Google Docs et le Canva contiennent les textes, angles et visuels utiles pour promouvoir LGD plus vite.",
                },
                {
                  q: "Combien puis-je toucher ?",
                  a: "Jusqu’à 60% de commission récurrente tant que l’abonné référé reste actif, selon les règles commerciales en vigueur.",
                },
              ].map((item) => (
                <div key={item.q} className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
                  <p className="text-sm font-semibold text-yellow-200 sm:text-base">{item.q}</p>
                  <p className="mt-2 break-words text-sm leading-relaxed text-gray-300">{item.a}</p>
                </div>
              ))}
            </div>
          </CardLuxe>

          <CardLuxe className="w-full px-5 sm:px-8 pt-8 pb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#ffb800]">
              Ton lien officiel à retenir
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
              Tous les supports doivent renvoyer vers ce format, avec ton propre identifiant Systeme.io.
            </p>
            <div className="mt-5 flex justify-center">
              <span className="break-all rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-5 py-4 text-sm text-yellow-200 sm:text-base">
                {AFFILIATE_LINK_TEMPLATE}
              </span>
            </div>
          </CardLuxe>
        </motion.div>

        <p className="mt-12 text-center text-xs text-gray-500">
          © 2026 Le Générateur Digital — Affiliation LGD
        </p>
      </div>
    </div>
  );
}
