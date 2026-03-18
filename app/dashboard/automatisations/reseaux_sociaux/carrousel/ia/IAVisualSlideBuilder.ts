// LGD IA — Visual Slide Builder (Structure)
export interface IAVisualSlide {
  title: string;
  content: string;
}

export function buildVisualSlides(slides: string[]): IAVisualSlide[] {
  return slides.map((s, i) => ({
    title: `Slide ${i + 1}`,
    content: s,
  }));
}
