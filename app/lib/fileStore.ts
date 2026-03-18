// ============================================================
// 🗂️ FILE STORE — LGD v2025 (Final Stable Version)
// ============================================================
//
// Sert à :
// - stocker temporairement des fichiers uploadés
// - générer des URLs locales (preview)
// - convertir File => base64
// - éviter les memory leaks
//
// Compatible avec :
// - BackgroundUploader
// - CarrouselEditor
// - IA Background
// - Library (futur)
// - Next.js App Router
//
// ============================================================

export type LocalFile = {
  file: File;
  url: string;        // Preview locale
  base64?: string;    // Optionnel : pour IA
};

// ============================
// 🖼️ Convertir File → base64
// ============================

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject("Erreur conversion base64");

    reader.readAsDataURL(file);
  });
}

// ============================
// 🖼️ Générer une preview locale
// ============================

export function generateLocalPreview(file: File): LocalFile {
  const url = URL.createObjectURL(file);

  return {
    file,
    url,
  };
}

// ============================
// 🧹 Libérer proprement une URL
// ============================

export function revokePreview(url: string) {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Pas grave si déjà libéré
  }
}

// ============================
// 🧾 Nettoyer une liste de previews
// ============================

export function cleanupFiles(files: LocalFile[]) {
  files.forEach((f) => revokePreview(f.url));
}

// ============================================================
// 🗃️ SERVER JSON STORE (Next.js API Routes)
// ============================================================
// Ces helpers sont utilisés par les routes /app/api/* (server only).
// Ils sont volontairement "lazy" via import dynamique pour ne pas casser
// le bundle client (ce fichier est aussi importé côté UI).

export async function readJSON<T = any>(absoluteOrRelativePath: string, fallback: T): Promise<T> {
  if (typeof window !== "undefined") {
    throw new Error("readJSON() is server-only");
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  const p = path.isAbsolute(absoluteOrRelativePath)
    ? absoluteOrRelativePath
    : path.join(process.cwd(), absoluteOrRelativePath);

  try {
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON(absoluteOrRelativePath: string, data: any): Promise<void> {
  if (typeof window !== "undefined") {
    throw new Error("writeJSON() is server-only");
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  const p = path.isAbsolute(absoluteOrRelativePath)
    ? absoluteOrRelativePath
    : path.join(process.cwd(), absoluteOrRelativePath);

  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}
