// ============================================================
//  TEMPLATES LGD — Sales Pages
//  Auteur : Chef (IA) pour Stéphane Desbuisson
//  Rôle : Liste des templates HTML injectables dans SalesBuilder
// ============================================================

export type SalesTemplate = {
  id: string;
  category: string;
  label: string;
  html: string;
};

// ------------------------------------------------------------
//  LISTE COMPLÈTE DES 15 TEMPLATES PREMIUM
// ------------------------------------------------------------

export const TEMPLATES: SalesTemplate[] = [
  // ---------------- HERO ----------------
  {
    id: "hero-01",
    category: "Hero",
    label: "Hero - Titre + Sous-titre + CTA",
    html: `
<section class="py-20 text-center">
  <h1 class="text-4xl font-bold text-yellow-400 mb-4">
    Transformez Votre Business en Machine à Clients
  </h1>
  <p class="text-lg opacity-80 max-w-2xl mx-auto mb-6">
    Découvrez une méthode simple et puissante pour attirer, convertir et fidéliser vos clients automatiquement.
  </p>
  <a href="#" class="px-8 py-4 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 transition">
    Commencer Maintenant
  </a>
</section>
`
  },
  {
    id: "hero-02",
    category: "Hero",
    label: "Hero - Image + Headline",
    html: `
<section class="py-20 grid md:grid-cols-2 gap-10 items-center">
  <div>
    <h1 class="text-4xl font-bold text-yellow-400 mb-4">
      Votre Solution Tout-en-Un
    </h1>
    <p class="opacity-80">
      Une plateforme complète pour automatiser votre marketing et décupler vos résultats.
    </p>
  </div>
  <img src="/placeholder.jpg" class="rounded-xl shadow-lg opacity-90" />
</section>
`
  },
  {
    id: "hero-03",
    category: "Hero",
    label: "Hero - Split Screen Moderne",
    html: `
<section class="py-20 grid md:grid-cols-2 gap-10 items-center">
  <div>
    <h1 class="text-4xl font-bold text-yellow-400 mb-4">
      Augmentez Votre Chiffre d’Affaires
    </h1>
    <p class="opacity-80 mb-6">
      Une stratégie éprouvée pour générer plus de ventes sans effort supplémentaire.
    </p>
    <a class="px-8 py-4 bg-yellow-500 text-black font-semibold rounded-xl">Voir comment</a>
  </div>
  <div class="bg-[#111] p-8 rounded-xl border border-yellow-700/30">
    <p class="text-yellow-400 font-semibold text-xl">+312% de croissance</p>
    <p class="opacity-80">Après 60 jours d'utilisation</p>
  </div>
</section>
`
  },

  // ---------------- PROBLÈME ----------------
  {
    id: "problem-01",
    category: "Problème",
    label: "Problème - Point douloureux",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-6 text-center">
    Le Problème que Rencontrent 90% des Entrepreneurs
  </h2>
  <p class="max-w-3xl mx-auto opacity-80 text-center leading-relaxed">
    Ils ont un excellent produit… mais ils manquent d’un système clair pour attirer et convertir leurs clients.
    Leurs efforts deviennent épuisants et les résultats irréguliers.
  </p>
</section>
`
  },
  {
    id: "problem-02",
    category: "Problème",
    label: "Problème - Agitation + Transition",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-6">
    Vous Avez Tout Essayé…
  </h2>
  <ul class="space-y-3 opacity-80">
    <li>❌ Faire des posts tous les jours...</li>
    <li>❌ Payer des pubs sans comprendre les résultats...</li>
    <li>❌ Tester des outils complexes et chers...</li>
  </ul>
  <p class="mt-6 text-yellow-400 font-semibold">
    Il existe pourtant une solution plus simple.
  </p>
</section>
`
  },

  // ---------------- SOLUTION ----------------
  {
    id: "solution-01",
    category: "Solution",
    label: "Solution - Présentation simple",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-4">Voici LA Solution</h2>
  <p class="opacity-80 max-w-3xl">
    Une méthode structurée qui automatise votre marketing, votre acquisition et vos ventes.
    Simple à déployer, puissante à utiliser.
  </p>
</section>
`
  },
  {
    id: "solution-02",
    category: "Solution",
    label: "Solution - Liste bénéfices",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-6">Les Bénéfices Immédiats</h2>
  <ul class="grid md:grid-cols-2 gap-6">
    <li class="bg-[#111] p-6 rounded-xl border border-yellow-600/20">
      🚀 Attirez plus de prospects qualifiés
    </li>
    <li class="bg-[#111] p-6 rounded-xl border border-yellow-600/20">
      💰 Convertissez plus rapidement
    </li>
    <li class="bg-[#111] p-6 rounded-xl border border-yellow-600/20">
      ⏱ Gagnez un temps précieux
    </li>
    <li class="bg-[#111] p-6 rounded-xl border border-yellow-600/20">
      📈 Automatisez votre croissance
    </li>
  </ul>
</section>
`
  },
  {
    id: "solution-03",
    category: "Solution",
    label: "Solution - Feature Grid",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-10 text-center">Fonctionnalités Clés</h2>
  <div class="grid md:grid-cols-3 gap-8">
    <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
      <h3 class="text-xl text-yellow-400 mb-3">Automatisation</h3>
      <p class="opacity-80">Votre marketing tourne tout seul, 24/7.</p>
    </div>
    <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
      <h3 class="text-xl text-yellow-400 mb-3">IA Intégrée</h3>
      <p class="opacity-80">Générez emails, pages, contenus en un clic.</p>
    </div>
    <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
      <h3 class="text-xl text-yellow-400 mb-3">Design Premium</h3>
      <p class="opacity-80">Look professionnel sans designer.</p>
    </div>
  </div>
</section>
`
  },

  // ---------------- PREUVE SOCIALE ----------------
  {
    id: "testimonials-01",
    category: "Preuve sociale",
    label: "Témoignages x3",
    html: `
<section class="py-20 text-center">
  <h2 class="text-3xl font-bold text-yellow-400 mb-10">Ils Ont Adoré</h2>
  <div class="grid md:grid-cols-3 gap-8">
    <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
      <p class="opacity-80">“Une transformation radicale pour mon business !”</p>
      <p class="text-yellow-400 mt-4">— Marie</p>
    </div>
    <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
      <p class="opacity-80">“Simple, efficace, et hyper rentable.”</p>
      <p class="text-yellow-400 mt-4">— Antoine</p>
    </div>
    <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
      <p class="opacity-80">“Je recommande à 200%.”</p>
      <p class="text-yellow-400 mt-4">— Sarah</p>
    </div>
  </div>
</section>
`
  },
  {
    id: "logos-01",
    category: "Preuve sociale",
    label: "Logos / Preuves",
    html: `
<section class="py-20 text-center opacity-70">
  <p class="mb-6">Ils nous font confiance :</p>
  <div class="flex justify-center gap-10">
    <span>Logo1</span>
    <span>Logo2</span>
    <span>Logo3</span>
    <span>Logo4</span>
  </div>
</section>
`
  },
  {
    id: "before-after-01",
    category: "Preuve sociale",
    label: "Avant / Après",
    html: `
<section class="py-20 grid md:grid-cols-2 gap-10 items-center">
  <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
    <h3 class="text-yellow-400 text-xl mb-4">Avant</h3>
    <ul class="opacity-80 space-y-2">
      <li>❌ Peu de visibilité</li>
      <li>❌ Pas de système marketing</li>
      <li>❌ Temps perdu</li>
    </ul>
  </div>
  <div class="bg-[#111] p-6 rounded-xl border border-yellow-700/30">
    <h3 class="text-yellow-400 text-xl mb-4">Après</h3>
    <ul class="opacity-80 space-y-2">
      <li>✅ Acquisition automatique</li>
      <li>✅ IA intégrée</li>
      <li>✅ Résultats prévisibles</li>
    </ul>
  </div>
</section>
`
  },

  // ---------------- OFFRE ----------------
  {
    id: "offer-01",
    category: "Offre",
    label: "Offre complète",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-6">L’Offre Complète</h2>
  <div class="bg-[#111] p-8 rounded-xl border border-yellow-700/30 max-w-3xl">
    <ul class="space-y-3 opacity-80 mb-6">
      <li>✔ Accès complet</li>
      <li>✔ Automatisation marketing</li>
      <li>✔ Génération IA illimitée</li>
      <li>✔ Support premium 7j/7</li>
    </ul>
    <p class="text-4xl font-bold text-yellow-400 mb-4">49€/mois</p>
    <a class="px-8 py-4 bg-yellow-500 text-black font-semibold rounded-xl">
      Rejoindre Maintenant
    </a>
  </div>
</section>
`
  },
  {
    id: "bonus-01",
    category: "Offre",
    label: "Bonus x3",
    html: `
<section class="py-20">
  <h2 class="text-3xl font-bold text-yellow-400 mb-8">Les Bonus Exclusifs</h2>
  <div class="grid md:grid-cols-3 gap-6">
    <div class="bg-[#111] rounded-xl p-6 border border-yellow-700/30">
      🎁 Bonus #1 — Templates premium
    </div>
    <div class="bg-[#111] rounded-xl p-6 border border-yellow-700/30">
      🎁 Bonus #2 — Accès VIP
    </div>
    <div class="bg-[#111] rounded-xl p-6 border border-yellow-700/30">
      🎁 Bonus #3 — Masterclass IA
    </div>
  </div>
</section>
`
  },
  {
    id: "guarantee-01",
    category: "Offre",
    label: "Garantie 30 jours",
    html: `
<section class="py-20 text-center">
  <h2 class="text-3xl font-bold text-yellow-400 mb-4">Garantie 30 Jours</h2>
  <p class="opacity-80 max-w-2xl mx-auto">
    Essayez sans risque. Si vous n’êtes pas satisfait, vous êtes remboursé intégralement.
  </p>
</section>
`
  },

  // ---------------- CTA ----------------
  {
    id: "cta-01",
    category: "CTA",
    label: "CTA final",
    html: `
<section class="py-20 text-center">
  <h2 class="text-3xl font-bold text-yellow-400 mb-4">
    Prêt à Transformer Votre Business ?
  </h2>
  <a class="px-12 py-5 bg-yellow-500 text-black font-bold rounded-xl text-xl hover:bg-yellow-400 transition">
    Oui, je veux commencer maintenant
  </a>
</section>
`
  },
];
