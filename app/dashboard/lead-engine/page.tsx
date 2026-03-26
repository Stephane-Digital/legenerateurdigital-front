"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaArchive,
  FaCheckCircle,
  FaChevronRight,
  FaCogs,
  FaFont,
  FaImage,
  FaImages,
  FaLayerGroup,
  FaMagic,
  FaPalette,
  FaPhotoVideo,
  FaRobot,
  FaStar,
  FaTrash,
  FaVideo,
} from "react-icons/fa";
import Link from "next/link";

type BuilderTab = "medias" | "archive" | "blocs";
type RightTab = "proprietes" | "copilote";

type BlockKey =
  | "hero"
  | "benefits"
  | "faq"
  | "proof"
  | "testimonials"
  | "bonus"
  | "urgency"
  | "story";

type StylePreset = "minimal" | "premium" | "agressif" | "soft";
type BrandTone = "autorite" | "amical" | "luxe" | "direct";
type RenderLevel = "standard" | "premium" | "ultra";
type RenderLength = "court" | "moyen" | "long";
type RenderIntensity = "soft" | "equilibre" | "agressif";

type ArchiveItem = {
  id: string;
  title: string;
  kind: "lead" | "template" | "image";
  thumb?: string;
  summary: string;
};

const BLOCK_LABELS: Record<BlockKey, { title: string; hint: string }> = {
  hero: { title: "Hero", hint: "Titre + sous-titre + CTA" },
  benefits: { title: "Bénéfices", hint: "Valeur immédiate du lead" },
  faq: { title: "FAQ", hint: "Lever les objections" },
  proof: { title: "Preuve sociale", hint: "Rassurer avant inscription" },
  testimonials: { title: "Avis", hint: "Renforcer la confiance" },
  bonus: { title: "Bonus", hint: "Augmenter la valeur perçue" },
  urgency: { title: "Urgence", hint: "Pousser à l’action" },
  story: { title: "Storytelling", hint: "Créer l’identification" },
};

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Lato",
];

const DEFAULT_ARCHIVE: ArchiveItem[] = [
  {
    id: "archive-1",
    title: "Template — Lead Premium",
    kind: "template",
    summary: "Structure premium hero + bénéfices + FAQ + bonus.",
  },
  {
    id: "archive-2",
    title: "Lead — Acquisition Instagram",
    kind: "lead",
    summary: "Version orientée conversion avec preuve sociale.",
  },
  {
    id: "archive-3",
    title: "Template — Landing Autorité",
    kind: "template",
    summary: "Structure plus éditoriale, idéale pour un ton expert.",
  },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LeadEnginePage() {
  const [leftTab, setLeftTab] = useState<BuilderTab>("medias");
  const [rightTab, setRightTab] = useState<RightTab>("proprietes");

  const [heroTitle, setHeroTitle] = useState(
    "Comment générer tes premiers leads qualifiés en 7 jours"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Une landing premium pensée pour transformer ton audience en vrais prospects sans dépendre uniquement des algorithmes."
  );
  const [cta, setCta] = useState("Recevoir la méthode maintenant");

  const [brandPrimary, setBrandPrimary] = useState("#ffb800");
  const [brandSecondary, setBrandSecondary] = useState("#1b1204");
  const [pageBackground, setPageBackground] = useState("#0a0a0a");
  const [surfaceBackground, setSurfaceBackground] = useState("#0b0b0b");
  const [titleFont, setTitleFont] = useState("Inter");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [stylePreset, setStylePreset] = useState<StylePreset>("premium");
  const [brandTone, setBrandTone] = useState<BrandTone>("luxe");
  const [renderLevel, setRenderLevel] = useState<RenderLevel>("premium");
  const [renderLength, setRenderLength] = useState<RenderLength>("moyen");
  const [renderIntensity, setRenderIntensity] = useState<RenderIntensity>("equilibre");

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [logo, setLogo] = useState<string>("");

  const [blocks, setBlocks] = useState<Record<BlockKey, boolean>>({
    hero: true,
    benefits: true,
    faq: true,
    proof: true,
    testimonials: false,
    bonus: false,
    urgency: false,
    story: false,
  });

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const archiveItems = useMemo<ArchiveItem[]>(() => {
    const uploadedImages = images.slice(0, 3).map((thumb, index) => ({
      id: `img-${index}`,
      title: `Visuel importé ${index + 1}`,
      kind: "image" as const,
      thumb,
      summary: "Asset disponible dans ton Archive LGD.",
    }));
    return [...uploadedImages, ...DEFAULT_ARCHIVE];
  }, [images]);

  const enabledBlocks = useMemo(
    () => Object.entries(blocks).filter(([, enabled]) => enabled).map(([key]) => key as BlockKey),
    [blocks]
  );

  const conversionScore = useMemo(() => {
    let score = 62;
    if (heroTitle.trim().length > 25) score += 8;
    if (heroSubtitle.trim().length > 60) score += 8;
    if (cta.trim().length > 12) score += 6;
    if (images.length > 0) score += 6;
    if (logo) score += 3;
    if (enabledBlocks.length >= 4) score += 7;
    if (renderLevel === "ultra") score += 5;
    if (renderIntensity === "agressif") score += 3;
    return Math.min(96, score);
  }, [heroTitle, heroSubtitle, cta, images.length, logo, enabledBlocks.length, renderLevel, renderIntensity]);

  async function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "image" | "video" | "logo"
  ) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (kind === "logo") {
      const first = files[0];
      const url = await fileToDataUrl(first);
      setLogo(url);
      event.target.value = "";
      return;
    }

    const urls = await Promise.all(files.map(fileToDataUrl));

    if (kind === "image") {
      setImages((prev) => [...prev, ...urls]);
    } else {
      setVideos((prev) => [...prev, ...urls]);
    }

    event.target.value = "";
  }

  function removeMedia(kind: "image" | "video", index: number) {
    if (kind === "image") {
      setImages((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setVideos((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleBlock(block: BlockKey) {
    setBlocks((prev) => ({ ...prev, [block]: !prev[block] }));
  }

  function applyArchiveItem(item: ArchiveItem) {
    if (item.kind === "template") {
      setBlocks({
        hero: true,
        benefits: true,
        faq: true,
        proof: true,
        testimonials: true,
        bonus: true,
        urgency: false,
        story: false,
      });
      setRenderLevel("premium");
      setStylePreset("premium");
      return;
    }

    if (item.kind === "lead") {
      setBlocks({
        hero: true,
        benefits: true,
        faq: true,
        proof: true,
        testimonials: false,
        bonus: false,
        urgency: true,
        story: true,
      });
      setBrandTone("autorite");
      setRenderIntensity("agressif");
      return;
    }

    if (item.thumb) {
      setImages((prev) => (prev.includes(item.thumb!) ? prev : [item.thumb!, ...prev]));
    }
  }

  function optimizeAutomatically() {
    setStylePreset("premium");
    setBrandTone("luxe");
    setRenderLevel("ultra");
    setRenderLength("moyen");
    setRenderIntensity("agressif");
    setBlocks({
      hero: true,
      benefits: true,
      faq: true,
      proof: true,
      testimonials: true,
      bonus: true,
      urgency: true,
      story: false,
    });
    if (!cta.toLowerCase().includes("méthode")) {
      setCta("Recevoir la méthode maintenant");
    }
  }

  const previewAccentStyle = {
    color: brandPrimary,
  };

  const pageShellStyle = {
    background: pageBackground,
    fontFamily: bodyFont,
  } as const;

  const surfaceStyle = {
    background: surfaceBackground,
    borderColor: `${brandPrimary}33`,
  } as const;

  return (
    <div className="min-h-screen text-white" style={pageShellStyle}>
      <div className="mx-auto max-w-[1800px] px-6 pt-[110px] pb-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/10 transition-all"
            >
              <FaArrowLeft />
              Retour Dashboard
            </Link>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
              <FaMagic className="text-yellow-300" />
              Lead Builder V1
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#ffb800]">
              Construis ton lead comme un vrai builder premium
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Archive, médias, branding, blocs, propriétés et copilote réunis dans une seule interface cohérente LGD.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-5 py-4 text-right">
            <div className="text-xs uppercase tracking-[0.16em] text-white/45">Score builder</div>
            <div className="mt-1 text-3xl font-extrabold text-[#ffb800]">{conversionScore}/100</div>
            <div className="mt-1 text-sm text-white/60">
              {conversionScore >= 80 ? "Très vendeur" : conversionScore >= 70 ? "Base solide" : "À renforcer"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-[340px_minmax(980px,1fr)_360px] xl:grid-cols-[320px_minmax(760px,1fr)_340px] gap-6 items-start">
          <CardLuxe className="p-4 sticky top-[96px]">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["medias", "Médias"],
                ["archive", "Archive"],
                ["blocs", "Blocs"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLeftTab(value as BuilderTab)}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-semibold transition-all",
                    leftTab === value
                      ? "bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black"
                      : "border border-yellow-600/20 bg-[#0b0b0b] text-white/75 hover:bg-yellow-500/10",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {leftTab === "medias" ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                    <FaPhotoVideo />
                    Images / Vidéos du lead
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    Ajoute tes visuels pour enrichir le hero, les sections et la preuve sociale.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-sm font-semibold text-white/85 hover:bg-yellow-500/10"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FaImage className="text-yellow-300" />
                        Ajouter images
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-sm font-semibold text-white/85 hover:bg-yellow-500/10"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FaVideo className="text-yellow-300" />
                        Ajouter vidéos
                      </span>
                    </button>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e, "image")}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e, "video")}
                  />

                  <div className="mt-4 grid gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                        Images importées — {images.length}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {images.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-yellow-600/20 px-4 py-5 text-sm text-white/40">
                            Aucune image importée
                          </div>
                        ) : (
                          images.map((img, index) => (
                            <div key={index} className="relative">
                              <img
                                src={img}
                                alt={`media-${index}`}
                                className="h-20 w-20 rounded-2xl object-cover border border-yellow-600/20"
                              />
                              <button
                                type="button"
                                onClick={() => removeMedia("image", index)}
                                className="absolute -right-2 -top-2 rounded-full bg-[#111] p-1 text-xs text-red-300 border border-red-500/20"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-[0.14em] text-white/45">
                        Vidéos importées — {videos.length}
                      </div>
                      <div className="mt-2 grid gap-2">
                        {videos.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-yellow-600/20 px-4 py-4 text-sm text-white/40">
                            Aucune vidéo importée
                          </div>
                        ) : (
                          videos.map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3"
                            >
                              <div className="inline-flex items-center gap-2 text-sm text-white/80">
                                <FaVideo className="text-yellow-300" />
                                Vidéo {index + 1}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMedia("video", index)}
                                className="text-red-300"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                    <FaArchive />
                    Archive LGD
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    Réutilise tes assets et templates déjà présents dans LGD.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLeftTab("archive")}
                    className="mt-4 w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-sm font-semibold text-white/85 hover:bg-yellow-500/10"
                  >
                    Ouvrir l’Archive
                  </button>
                </div>
              </div>
            ) : null}

            {leftTab === "archive" ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaArchive />
                    Archive
                  </div>
                  <span className="text-xs text-white/45">{archiveItems.length} éléments</span>
                </div>

                <div className="space-y-3">
                  {archiveItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyArchiveItem(item)}
                      className="w-full rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-3 text-left hover:bg-yellow-500/10 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="h-16 w-16 rounded-2xl border border-yellow-600/20 bg-[#111] overflow-hidden flex items-center justify-center">
                          {item.thumb ? (
                            <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <FaImages className="text-yellow-300" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate font-semibold text-yellow-100">{item.title}</div>
                            <span className="rounded-full border border-yellow-600/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                              {item.kind}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-white/60">{item.summary}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {leftTab === "blocs" ? (
              <div className="mt-5 space-y-3">
                <div className="inline-flex items-center gap-2 text-yellow-200 font-semibold">
                  <FaLayerGroup />
                  Structure du lead
                </div>
                <p className="text-sm text-white/60">
                  Active uniquement les blocs qui servent réellement ta conversion.
                </p>

                {Object.entries(BLOCK_LABELS).map(([key, meta]) => {
                  const typedKey = key as BlockKey;
                  const enabled = blocks[typedKey];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBlock(typedKey)}
                      className={[
                        "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                        enabled
                          ? "border-yellow-500/30 bg-yellow-500/10"
                          : "border-yellow-600/20 bg-[#0b0b0b] hover:bg-yellow-500/10",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-yellow-100">{meta.title}</div>
                          <div className="mt-1 text-sm text-white/55">{meta.hint}</div>
                        </div>
                        <div
                          className={[
                            "mt-0.5 h-6 w-11 rounded-full transition-all border",
                            enabled
                              ? "border-yellow-400 bg-yellow-400/20"
                              : "border-white/20 bg-white/5",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mt-[2px] h-4 w-4 rounded-full bg-white transition-all",
                              enabled ? "ml-5 bg-yellow-300" : "ml-1",
                            ].join(" ")}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={optimizeAutomatically}
                  className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] px-4 py-3 font-semibold text-black hover:-translate-y-0.5 transition-all"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaMagic />
                    Optimiser automatiquement
                  </span>
                </button>
              </div>
            ) : null}
          </CardLuxe>

          <CardLuxe className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/20 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                  <FaLayerGroup className="text-yellow-300" />
                  Canvas landing
                </div>
                <h2 className="mt-3 text-2xl font-bold text-[#ffb800]">Preview live du lead</h2>
              </div>

              <button
                type="button"
                onClick={optimizeAutomatically}
                className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-4 py-3 text-sm font-semibold text-white/80 hover:bg-yellow-500/10"
              >
                <span className="inline-flex items-center gap-2">
                  <FaRobot className="text-yellow-300" />
                  Auto
                </span>
              </button>
            </div>

            <div className="mx-auto max-w-[1120px]">
              <div
                className="overflow-hidden rounded-[32px] border"
                style={{
                  borderColor: `${brandPrimary}33`,
                  background: `linear-gradient(180deg, ${brandSecondary}, ${surfaceBackground})`,
                }}
              >
                {blocks.hero ? (
                  <div
                    className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_420px] gap-0 border-b"
                    style={{ borderColor: `${brandPrimary}22` }}
                  >
                    <div className="px-8 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                      {logo ? (
                        <img
                          src={logo}
                          alt="Logo"
                          className="mb-5 h-14 w-auto object-contain rounded-xl border border-yellow-600/20 bg-[#111] p-2"
                        />
                      ) : (
                        <div
                          className="mb-5 inline-flex rounded-full border border-yellow-600/25 bg-[#111] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                          style={previewAccentStyle}
                        >
                          Aimant à prospects
                        </div>
                      )}

                      <h3
                        className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-[44px]"
                        style={{ color: "#ffffff", fontFamily: titleFont }}
                      >
                        {heroTitle}
                      </h3>

                      <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
                        {heroSubtitle}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="rounded-2xl px-6 py-4 font-semibold text-black shadow-lg"
                          style={{ backgroundColor: brandPrimary }}
                        >
                          {cta}
                        </button>

                        <div
                          className="rounded-2xl border px-5 py-4 text-sm text-white/65"
                          style={{ borderColor: `${brandPrimary}33` }}
                        >
                          {renderLevel === "ultra"
                            ? "Version ultra conversion"
                            : renderLevel === "premium"
                            ? "Version premium"
                            : "Version standard"}
                        </div>
                      </div>
                    </div>

                    <div className="border-l p-5 lg:p-6" style={{ borderColor: `${brandPrimary}22` }}>
                      <div className="grid h-full min-h-[360px] place-items-center rounded-[26px] border bg-[#111]" style={{ borderColor: `${brandPrimary}20` }}>
                        {images[0] ? (
                          <img src={images[0]} alt="Hero visuel" className="h-full w-full rounded-[26px] object-cover" />
                        ) : (
                          <div className="px-6 text-center">
                            <FaImage className="mx-auto text-5xl" style={previewAccentStyle} />
                            <p className="mt-3 text-sm text-white/45">
                              Ajoute un visuel hero depuis Médias ou Archive
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                  {blocks.benefits ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Bénéfices</div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {[
                          "Attire des prospects plus qualifiés sans complexifier ton marketing.",
                          "Transforme tes contenus en machine à leads plus cohérente.",
                          "Crée une structure premium qui donne envie de s’inscrire.",
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border bg-[#111] px-4 py-4 text-sm leading-7 text-white/78"
                            style={{ borderColor: `${brandPrimary}22` }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {blocks.story ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Storytelling</div>
                      <p className="mt-3 text-base leading-8 text-white/72">
                        Tu postes peut-être déjà du contenu, mais sans système de capture solide tu laisses partir une partie de tes futurs clients. Ce lead a été pensé pour créer une vraie passerelle entre ton audience et ton offre.
                      </p>
                    </div>
                  ) : null}

                  {blocks.proof ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Preuve sociale</div>
                      <p className="mt-3 text-base leading-8 text-white/75">
                        Cette structure aide à capter plus facilement des leads réellement intéressés par ton offre.
                      </p>
                    </div>
                  ) : null}

                  {blocks.testimonials ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Avis</div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {[
                          "“Le rendu donne tout de suite un effet premium.”",
                          "“On sent que la page est pensée pour convertir.”",
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border bg-[#111] px-4 py-4 text-sm leading-7 text-white/72"
                            style={{ borderColor: `${brandPrimary}22` }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {blocks.bonus ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Bonus</div>
                      <p className="mt-3 text-base leading-8 text-white/75">
                        Bonus visuel, checklist ou mini framework à ajouter pour augmenter la valeur perçue.
                      </p>
                    </div>
                  ) : null}

                  {blocks.urgency ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Urgence</div>
                      <p className="mt-3 text-base leading-8 text-white/75">
                        Disponible maintenant — ajoute une logique de rareté ou de timing dans ton copywriting pour augmenter le passage à l’action.
                      </p>
                    </div>
                  ) : null}

                  {blocks.faq ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>FAQ</div>
                      <div className="mt-4 grid gap-3">
                        {[
                          {
                            q: "Est-ce adapté aux débutants ?",
                            a: "Oui, la structure a été pensée pour rester simple à mettre en œuvre.",
                          },
                          {
                            q: "Combien de temps faut-il pour l’utiliser ?",
                            a: "Le format est conçu pour être actionnable rapidement, sans lecture interminable.",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border bg-[#111] px-5 py-5"
                            style={{ borderColor: `${brandPrimary}22` }}
                          >
                            <div className="font-semibold text-white">{item.q}</div>
                            <div className="mt-2 text-sm leading-7 text-white/68">{item.a}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {images.length > 1 || videos.length > 0 ? (
                    <div className="rounded-[28px] border p-6" style={surfaceStyle}>
                      <div className="font-semibold text-lg" style={previewAccentStyle}>Galerie médias</div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {images.slice(1).map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`galerie-${index}`}
                            className="h-28 w-28 rounded-2xl object-cover border"
                            style={{ borderColor: `${brandPrimary}22` }}
                          />
                        ))}
                        {videos.map((_, index) => (
                          <div
                            key={index}
                            className="grid h-28 w-28 place-items-center rounded-2xl border bg-[#111]"
                            style={{ borderColor: `${brandPrimary}22` }}
                          >
                            <FaVideo style={previewAccentStyle} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </CardLuxe>

          <CardLuxe className="p-4 sticky top-[96px]">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["proprietes", "Propriétés"],
                ["copilote", "Copilote"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRightTab(value as RightTab)}
                  className={[
                    "rounded-2xl px-3 py-3 text-sm font-semibold transition-all",
                    rightTab === value
                      ? "bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black"
                      : "border border-yellow-600/20 bg-[#0b0b0b] text-white/75 hover:bg-yellow-500/10",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {rightTab === "proprietes" ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="inline-flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaPalette />
                    Branding
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Couleur principale</label>
                      <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} className="h-12 w-full rounded-xl bg-transparent" />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Couleur secondaire</label>
                      <input type="color" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)} className="h-12 w-full rounded-xl bg-transparent" />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Fond page</label>
                      <input type="color" value={pageBackground} onChange={(e) => setPageBackground(e.target.value)} className="h-12 w-full rounded-xl bg-transparent" />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Fond sections</label>
                      <input type="color" value={surfaceBackground} onChange={(e) => setSurfaceBackground(e.target.value)} className="h-12 w-full rounded-xl bg-transparent" />
                    </div>

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-sm font-semibold text-white/85 hover:bg-yellow-500/10"
                    >
                      {logo ? "Changer le logo" : "Ajouter un logo"}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFiles(e, "logo")}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="inline-flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaFont />
                    Typographies
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Police titre</label>
                      <select
                        value={titleFont}
                        onChange={(e) => setTitleFont(e.target.value)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Police texte</label>
                      <select
                        value={bodyFont}
                        onChange={(e) => setBodyFont(e.target.value)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="inline-flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaCogs />
                    Rendu
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Style visuel</label>
                      <select
                        value={stylePreset}
                        onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        <option value="minimal">Minimal</option>
                        <option value="premium">Premium</option>
                        <option value="agressif">Agressif</option>
                        <option value="soft">Soft</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Ton</label>
                      <select
                        value={brandTone}
                        onChange={(e) => setBrandTone(e.target.value as BrandTone)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        <option value="autorite">Autorité</option>
                        <option value="amical">Amical</option>
                        <option value="luxe">Luxe</option>
                        <option value="direct">Direct</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Niveau</label>
                      <select
                        value={renderLevel}
                        onChange={(e) => setRenderLevel(e.target.value as RenderLevel)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="ultra">Ultra conversion</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Longueur</label>
                      <select
                        value={renderLength}
                        onChange={(e) => setRenderLength(e.target.value as RenderLength)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        <option value="court">Court</option>
                        <option value="moyen">Moyen</option>
                        <option value="long">Long</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm text-white/65">Intensité marketing</label>
                      <select
                        value={renderIntensity}
                        onChange={(e) => setRenderIntensity(e.target.value as RenderIntensity)}
                        className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white"
                      >
                        <option value="soft">Soft</option>
                        <option value="equilibre">Équilibré</option>
                        <option value="agressif">Agressif</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {rightTab === "copilote" ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="inline-flex items-center gap-2 text-yellow-200 font-semibold">
                    <FaRobot />
                    Copilote Lead Builder
                  </div>

                  <div className="mt-4 rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
                    <div className="text-sm font-semibold text-white">Analyse rapide</div>
                    <div className="mt-3 grid gap-2 text-sm text-white/65">
                      <p className="inline-flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-300" />
                        {enabledBlocks.length} blocs actifs dans la landing
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-300" />
                        {images.length} visuel(x) importé(s)
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-300" />
                        Score actuel : {conversionScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
                    <div className="text-sm font-semibold text-white">Suggestions</div>
                    <div className="mt-3 grid gap-3 text-sm text-white/65">
                      <div className="flex gap-2">
                        <FaChevronRight className="mt-1 text-yellow-300" />
                        <p>
                          {images.length === 0
                            ? "Ajoute au moins un visuel hero pour renforcer l’impact immédiat."
                            : "Ton hero gagne déjà en impact grâce au visuel importé."}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <FaChevronRight className="mt-1 text-yellow-300" />
                        <p>
                          {blocks.testimonials
                            ? "Les avis renforcent bien la crédibilité de la landing."
                            : "Active les avis ou la preuve sociale pour rassurer davantage."}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <FaChevronRight className="mt-1 text-yellow-300" />
                        <p>
                          {renderLevel === "ultra"
                            ? "Le mode Ultra conversion est adapté à une landing agressive."
                            : "Passe en Ultra conversion si tu veux un rendu plus vendeur."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={optimizeAutomatically}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] px-4 py-3 font-semibold text-black hover:-translate-y-0.5 transition-all"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaMagic />
                      Optimiser automatiquement
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHeroTitle("Comment transformer ton audience en vrais prospects qualifiés");
                      setHeroSubtitle(
                        "Une structure premium qui t’aide à passer d’un simple contenu visible à une vraie machine à leads rentable."
                      );
                      setCta("Je veux mes premiers leads");
                    }}
                    className="mt-3 w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 font-semibold text-white/85 hover:bg-yellow-500/10 transition-all"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      Générer une version plus vendeuse
                    </span>
                  </button>
                </div>

                <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4">
                  <div className="text-sm font-semibold text-yellow-200">Texte live</div>

                  <div className="mt-4 grid gap-3">
                    <textarea
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      rows={3}
                      className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white outline-none"
                    />
                    <textarea
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      rows={5}
                      className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white outline-none"
                    />
                    <input
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      className="rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-3 text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </CardLuxe>
        </div>
      </div>
    </div>
  );
}
