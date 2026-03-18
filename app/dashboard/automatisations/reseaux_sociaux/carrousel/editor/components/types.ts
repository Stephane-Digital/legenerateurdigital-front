import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";

export type Slide = {
  id: string;
  layers: LayerData[];
};

export type CarrouselDraft = {
  slides: Slide[];
  activeSlideId: string;
};
