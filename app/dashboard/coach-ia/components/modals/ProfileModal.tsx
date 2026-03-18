"use client";

import React, { useMemo, useState } from "react";
import ModalBase from "./ModalBase";

export type ProfileAnswers = {
  why?: string;
  offer?: string;
  first_sale_timing?: string;
  level?: string;
  comfortable?: string[]; // multi
  daily_time?: string;
  blockers?: string[]; // multi
};

type ChipOption = { key: string; label: string };

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full text-sm font-medium transition border",
        active
          ? "bg-[#f5c542]/15 text-[#f5c542] border-[#f5c542]/40 shadow-[0_0_0_1px_rgba(245,197,66,0.08)]"
          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-semibold">{title}</div>
          {hint ? <div className="text-xs text-white/50 mt-1">{hint}</div> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function ProfileModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (answers: ProfileAnswers) => void;
}) {
  const whyOptions: ChipOption[] = useMemo(
    () => [
      { key: "revenu", label: "Revenu complémentaire" },
      { key: "quitter", label: "Quitter mon travail" },
      { key: "liberte_geo", label: "Liberté géographique" },
      { key: "vrai_business", label: "Construire un vrai business" },
      { key: "autre", label: "Autre" },
    ],
    []
  );

  const offerOptions: ChipOption[] = useMemo(
    () => [
      { key: "formation", label: "Formation" },
      { key: "affiliation", label: "Affiliation" },
      { key: "mrr", label: "MRR" },
      { key: "service", label: "Service / Freelance" },
      { key: "jsp", label: "Je ne sais pas" },
    ],
    []
  );

  const timingOptions: ChipOption[] = useMemo(
    () => [
      { key: "7j", label: "7 jours" },
      { key: "30j", label: "30 jours" },
      { key: "3m", label: "3 mois" },
      { key: "aucune", label: "Aucune idée" },
    ],
    []
  );

  const levelOptions: ChipOption[] = useMemo(
    () => [
      { key: "debutant", label: "Débutant" },
      { key: "inter", label: "Intermédiaire" },
      { key: "avance", label: "Avancé" },
      { key: "confirme", label: "Confirmé" },
    ],
    []
  );

  const comfortOptions: ChipOption[] = useMemo(
    () => [
      { key: "rs", label: "Réseaux sociaux" },
      { key: "tech", label: "Technique" },
      { key: "vente", label: "Vente" },
      { key: "aucun", label: "Aucun des trois" },
    ],
    []
  );

  const timeOptions: ChipOption[] = useMemo(
    () => [
      { key: "30m", label: "< 30 min" },
      { key: "1h", label: "1h" },
      { key: "2h", label: "2h" },
      { key: "4h", label: "4h+" },
    ],
    []
  );

  const blockersOptions: ChipOption[] = useMemo(
    () => [
      { key: "peur_vendre", label: "Peur de vendre" },
      { key: "jsp", label: "Je ne sais pas quoi faire" },
      { key: "discipline", label: "Manque de discipline" },
      { key: "regard", label: "Regard des autres" },
      { key: "trop_tech", label: "Trop technique" },
      { key: "autre", label: "Autre" },
    ],
    []
  );

  const [answers, setAnswers] = useState<ProfileAnswers>({
    comfortable: [],
    blockers: [],
  });

  const progress = useMemo(() => {
    let ok = 0;
    if (answers.why) ok += 1;
    if (answers.offer) ok += 1;
    if (answers.first_sale_timing) ok += 1;
    if (answers.level) ok += 1;
    if ((answers.comfortable || []).length > 0) ok += 1;
    if (answers.daily_time) ok += 1;
    if ((answers.blockers || []).length > 0) ok += 1;
    return Math.round((ok / 7) * 100);
  }, [answers]);

  const toggleMulti = (field: "comfortable" | "blockers", key: string) => {
    setAnswers((prev) => {
      const arr = new Set(prev[field] || []);
      if (arr.has(key)) arr.delete(key);
      else arr.add(key);
      return { ...prev, [field]: Array.from(arr) };
    });
  };

  const submit = () => {
    onSubmit({
      ...answers,
      comfortable: answers.comfortable || [],
      blockers: answers.blockers || [],
    });
    onClose();
  };

  return (
    <ModalBase open={open} onClose={onClose} title="B — Analyse utilisateur" maxWidthClassName="max-w-6xl">
      <div className="rounded-2xl border border-[#f5c542]/25 bg-[#f5c542]/10 p-4 text-sm text-white/85">
        <div className="font-semibold text-white">Objectif : te coacher jusqu’à ta première vente.</div>
        <div className="text-white/70 mt-1">
          Réponds vite. Alex crée un plan actionnable (7j Essentiel / 30j Pro / 90j Ultime) et peut l’ajuster à tout moment.
        </div>
        <div className="mt-3">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#f5c542]/80" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-white/60 mt-2">Progression : {progress}% (objectif : ≥ 70%)</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Pourquoi tu veux gagner de l'argent en ligne ?" hint="Choisis l'intention principale.">
          <div className="flex flex-wrap gap-2">
            {whyOptions.map((o) => (
              <Chip
                key={o.key}
                active={answers.why === o.key}
                label={o.label}
                onClick={() => setAnswers((p) => ({ ...p, why: o.key }))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tu veux vendre quoi idéalement ?" hint="On adapte le plan selon ton modèle.">
          <div className="flex flex-wrap gap-2">
            {offerOptions.map((o) => (
              <Chip
                key={o.key}
                active={answers.offer === o.key}
                label={o.label}
                onClick={() => setAnswers((p) => ({ ...p, offer: o.key }))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Dans combien de temps ta première vente ?" hint="Définit le niveau d'intensité.">
          <div className="flex flex-wrap gap-2">
            {timingOptions.map((o) => (
              <Chip
                key={o.key}
                active={answers.first_sale_timing === o.key}
                label={o.label}
                onClick={() => setAnswers((p) => ({ ...p, first_sale_timing: o.key }))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Ton niveau actuel ?" hint="Pour éviter un plan trop facile ou trop dur.">
          <div className="flex flex-wrap gap-2">
            {levelOptions.map((o) => (
              <Chip
                key={o.key}
                active={answers.level === o.key}
                label={o.label}
                onClick={() => setAnswers((p) => ({ ...p, level: o.key }))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tu es à l'aise avec quoi aujourd'hui ? (multi)" hint="Ça influence les actions.">
          <div className="flex flex-wrap gap-2">
            {comfortOptions.map((o) => (
              <Chip
                key={o.key}
                active={(answers.comfortable || []).includes(o.key)}
                label={o.label}
                onClick={() => toggleMulti("comfortable", o.key)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Temps dispo par jour ?" hint="Pour proposer des actions réalistes.">
          <div className="flex flex-wrap gap-2">
            {timeOptions.map((o) => (
              <Chip
                key={o.key}
                active={answers.daily_time === o.key}
                label={o.label}
                onClick={() => setAnswers((p) => ({ ...p, daily_time: o.key }))}
              />
            ))}
          </div>
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Qu'est-ce qui te bloque le plus ? (multi)" hint="Le plan commence par lever ces freins.">
            <div className="flex flex-wrap gap-2">
              {blockersOptions.map((o) => (
                <Chip
                  key={o.key}
                  active={(answers.blockers || []).includes(o.key)}
                  label={o.label}
                  onClick={() => toggleMulti("blockers", o.key)}
                />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white transition"
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-[#f5c542] px-5 py-3 text-sm font-semibold text-black hover:brightness-110 transition"
        >
          Valider & envoyer à Alex
        </button>
      </div>
    </ModalBase>
  );
}
