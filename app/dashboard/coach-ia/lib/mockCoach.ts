// LGD — Coach connector (REAL + FALLBACK)
// Connecté au backend quotas

import { api } from "@/lib/api";

/**
 * Réponse locale de secours (UX jamais bloquée)
 */
function localFallback(): string {
  return (
    "OK, je te guide.\n\n" +
    "1) Écris ton objectif en 1 phrase\n" +
    "2) Indique ta cible\n" +
    "3) Dis-moi ton offre actuelle\n\n" +
    "Ensuite je te donne un plan d’action simple."
  );
}

/**
 * Appel réel backend
 */
async function callBackend(message: string): Promise<string> {
  const { data } = await api.post("/coach/chat", {
    message,
  });

  return data?.reply ?? localFallback();
}

/**
 * Fonction principale utilisée par tout le Coach
 * -> maintenant connectée aux quotas
 */
export async function sendMessageToCoach(message: string): Promise<string> {
  try {
    return await callBackend(message);
  } catch (err) {
    console.warn("Coach fallback mode:", err);
    return localFallback();
  }
}
