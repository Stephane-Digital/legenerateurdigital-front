/** LGD S2.B : sauvegarde explicite d'un brouillon via l'API existante. */
import { toEmailCampaignCreatePayload, validateAlexEmailDraft, type AlexEmailDraft } from "./emailDraftBuilder";

export type AlexEmailDraftCreateOptions = {
  apiBase: string;
  token?: string;
  fetchImpl?: typeof fetch; // Injection réservée aux tests.
};

export async function createAlexEmailDraft(
  draft: AlexEmailDraft,
  options: AlexEmailDraftCreateOptions,
): Promise<number> {
  const invalid = validateAlexEmailDraft(draft);
  if (invalid.length) {
    throw new Error(`Vérifie : ${invalid.join(", ")}.`);
  }
  const base = options.apiBase.replace(/\/+$/, "");
  if (!/^https?:\/\//.test(base)) {
    throw new Error("L'adresse du backend LGD est invalide.");
  }
  const requester = options.fetchImpl ?? fetch;
  const response = await requester(`${base}/email-campaigns/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify(toEmailCampaignCreatePayload(draft)),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Session expirée : reconnecte-toi à LGD.");
    }
    if (response.status === 422) {
      throw new Error("Le formulaire contient un champ non accepté par l'Emailing IA. Vérifie les valeurs.");
    }
    throw new Error(`Impossible d'enregistrer le brouillon (HTTP ${response.status}).`);
  }
  const responseBody: unknown = await response.json();
  const savedId = (responseBody && typeof responseBody === "object" && "id" in responseBody)
    ? (responseBody as { id?: unknown }).id
    : undefined;
  if (typeof savedId !== "number" || !Number.isInteger(savedId) || savedId <= 0) {
    throw new Error("Réponse inattendue après sauvegarde. Vérifie les campagnes existantes avant de réessayer, pour éviter un doublon.");
  }
  return savedId;
}
