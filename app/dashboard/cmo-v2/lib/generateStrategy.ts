import type { CMOStrategy } from "../types";

const REQUIRED_KEYS: Array<keyof CMOStrategy> = [
  "target",
  "pain",
  "desire",
  "promise",
  "angle",
  "mechanism",
  "cta",
];

function clean(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isStrategy(value: unknown): value is CMOStrategy {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return REQUIRED_KEYS.every((key) => typeof record[key] === "string" && clean(record[key]).length > 0);
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeStrategy(data: unknown): CMOStrategy | null {
  if (isStrategy(data)) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (isStrategy(record.strategy)) return record.strategy;
    if (isStrategy(record.data)) return record.data;
    if (isStrategy(record.result)) return record.result;

    const textResult = record.text || record.content || record.message || record.answer || record.response;
    if (typeof textResult === "string") {
      const parsed = tryParseJson(textResult);
      if (isStrategy(parsed)) return parsed;
      if (parsed && typeof parsed === "object" && isStrategy((parsed as Record<string, unknown>).strategy)) {
        return (parsed as Record<string, CMOStrategy>).strategy;
      }
    }
  }

  if (typeof data === "string") {
    const parsed = tryParseJson(data);
    if (isStrategy(parsed)) return parsed;
  }

  return null;
}

function buildStrategyPrompt(objective: string, blocker: string) {
  return `Tu es le CMO IA de LGD, expert en marketing digital, copywriting, conversion et stratégie business.

Objectif utilisateur : ${objective}
Blocage utilisateur : ${blocker}

Génère une stratégie marketing contextualisée, non générique, exploitable par un module LGD.

Réponds uniquement en JSON valide, sans markdown, avec exactement ces clés :
{
  "target": "cible précise liée à l'offre et au blocage",
  "pain": "problème réel à résoudre",
  "desire": "désir profond ou résultat recherché",
  "promise": "promesse crédible, spécifique et non générique",
  "angle": "angle marketing concret",
  "mechanism": "mécanisme stratégique d'exécution",
  "cta": "appel à l'action naturel"
}

Contraintes :
- ne pas inventer de preuves, chiffres ou témoignages ;
- ne pas faire de contenu générique ;
- si le blocage parle de ne pas être agressif, utiliser une vente douce, pédagogique et rassurante ;
- rester orienté action et conversion.`;
}

async function postStrategy(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return normalizeStrategy(await response.json());
  }

  return normalizeStrategy(await response.text());
}

export async function generateStrategyWithAI(
  objective: string,
  blocker: string
): Promise<CMOStrategy | null> {
  const baseUrl = String(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!baseUrl) return null;

  const url = `${baseUrl}/cmo-ai/strategy`;
  const prompt = buildStrategyPrompt(objective, blocker);

  try {
    const directPayload = await postStrategy(url, { objective, blocker });
    if (directPayload) return directPayload;

    const messagePayload = await postStrategy(url, { message: prompt });
    if (messagePayload) return messagePayload;

    const promptPayload = await postStrategy(url, { prompt });
    if (promptPayload) return promptPayload;

    return null;
  } catch (error) {
    console.warn("CMO IA live indisponible, fallback local utilisé.", error);
    return null;
  }
}
