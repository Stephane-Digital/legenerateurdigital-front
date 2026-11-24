"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  getAlexChatError,
  MAX_USER_MESSAGE,
  normalizeStoredConversation,
  type AlexChatTurn,
} from "../lib/alexConversation";

const SUGGESTIONS = [
  "Je débute : comment choisir une idée de business adaptée à mes compétences ?",
  "Analyse mon offre et aide-moi à identifier le principal blocage.",
  "Quelle est l'action la plus utile pour trouver mes premiers clients ?",
  "Aide-moi à clarifier ma cible et ma promesse commerciale.",
] as const;

function renderInlineMarkdown(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index} className="font-semibold text-yellow-100">{part.slice(2, -2)}</strong>
      : part
  );
}

function AlexFormattedMessage({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      {content.split("\n").map((line, index) => {
        const value = line.trim();
        if (!value) return <div key={index} className="h-1" aria-hidden="true" />;
        const heading = value.match(/^#{1,3}\s+(.+)$/);
        if (heading) return <p key={index} className="font-bold text-yellow-200">{renderInlineMarkdown(heading[1])}</p>;
        const bullet = value.match(/^[-*]\s+(.+)$/);
        if (bullet) return <p key={index} className="pl-3 before:mr-2 before:content-['•']">{renderInlineMarkdown(bullet[1])}</p>;
        return <p key={index}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  for (const key of ["access_token", "lgd_token", "token", "jwt"]) {
    const value = window.localStorage.getItem(key)?.trim();
    if (value) return { Authorization: `Bearer ${value}` };
  }
  return {};
}

function newMessageId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AlexConversation() {
  const [messages, setMessages] = useState<AlexChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [memoryReady, setMemoryReady] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  // La mémoire est chargée depuis le serveur, jamais depuis localStorage.
  // Le chargement est bloquant : une réponse ne doit pas sembler sauvegardée
  // lorsque la nouvelle API mémoire n'est pas disponible.
  async function loadHistory() {
    if (sendingRef.current) return;
    const base = apiBase();
    if (!/^https?:\/\//.test(base)) {
      setError("Le backend Coach Alex n'est pas configuré. Vérifie NEXT_PUBLIC_API_URL.");
      setLoadingHistory(false);
      return;
    }
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setMemoryReady(false);
    setLoadingHistory(true);
    setError("");
    try {
      const response = await fetch(`${base}/coach/conversation`, {
        headers: authHeaders(),
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(getAlexChatError(response.status));
      const data = await response.json();
      if (!data || !Array.isArray(data.messages)) throw new Error("Historique Coach Alex indisponible.");
      if (controller.signal.aborted) return;
      setMessages(normalizeStoredConversation(data.messages));
      setMemoryReady(true);
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Impossible de charger la mémoire Coach Alex.");
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      if (!controller.signal.aborted) setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
    return () => requestRef.current?.abort();
    // Chargement initial uniquement. Les rechargements manuels passent par le bouton.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send() {
    if (sendingRef.current || !memoryReady || loadingHistory) return;
    const actual = draft.trim();
    if (!actual) {
      inputRef.current?.focus();
      return;
    }
    const base = apiBase();
    if (!/^https?:\/\//.test(base)) {
      setError("Le backend Coach Alex n'est pas configuré. Vérifie NEXT_PUBLIC_API_URL.");
      return;
    }
    if (actual.length > MAX_USER_MESSAGE) {
      setError("Message trop long. Raccourcis ta demande.");
      return;
    }

    sendingRef.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch(`${base}/coach/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ message: actual, conversation_mode: true }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(getAlexChatError(response.status));
      const data: unknown = await response.json();
      const text = data && typeof data === "object" && "reply" in data
        ? (data as { reply?: unknown }).reply
        : null;
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("Alex n'a pas renvoyé de réponse. Aucun message n'a été ajouté.");
      }
      if (controller.signal.aborted) return;
      // Le backend confirme explicitement si la mémoire durable a été écrite.
      const saved = (data as { conversation_saved?: unknown }).conversation_saved === true;
      const fromServer = (data as { conversation_messages?: unknown }).conversation_messages;
      if (saved && Array.isArray(fromServer)) {
        setMessages(normalizeStoredConversation(fromServer));
      } else {
        setMessages((previous) => [...previous,
          { id: newMessageId(), role: "user" as const, content: actual },
          { id: newMessageId(), role: "assistant" as const, content: text.trim() },
        ].slice(-20));
        setError("Alex a répondu, mais cet échange n'a pas été enregistré. Copie les informations importantes avant de quitter cette page.");
      }
      setDraft("");
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Impossible de contacter Alex.");
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      sendingRef.current = false;
      setBusy(false);
    }
  }

  async function clearConversation() {
    if (busy || loadingHistory || !memoryReady || sendingRef.current) return;
    const controller = new AbortController();
    sendingRef.current = true;
    requestRef.current = controller;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${apiBase()}/coach/conversation`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(getAlexChatError(response.status));
      const data = await response.json();
      if (!data || data.deleted !== true) throw new Error("La suppression n'a pas été confirmée par le serveur.");
      if (controller.signal.aborted) return;
      setMessages([]);
      setDraft("");
      setShowReset(false);
      inputRef.current?.focus();
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Impossible d'effacer l'historique.");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      sendingRef.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 sm:px-6" aria-label="Conversation libre avec Coach Alex">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/coach-ia/v2" className="text-sm font-semibold text-yellow-200 underline underline-offset-4 hover:text-yellow-100">
          ← Retour au parcours Alex
        </Link>
        <span className="rounded-full border border-yellow-500/25 px-3 py-1 text-xs text-yellow-200">S3.B · Mémoire active</span>
      </div>

      <section className="overflow-hidden rounded-3xl border border-yellow-500/25 bg-[#0b0f16] shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        <header className="border-b border-yellow-500/20 bg-gradient-to-r from-[#111827] to-[#0b0f16] px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-yellow-300/80">Ton copilote Business LGD</p>
              <h1 className="mt-2 text-2xl font-bold text-yellow-300 sm:text-3xl">Parle librement avec Coach Alex</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Présente ton idée, pose une question ou décris ton blocage. Alex exploite le profil Business associé à ton compte lorsqu'il est disponible.
              </p>
            </div>
            {messages.length > 0 && !showReset ? (
              <button type="button" disabled={busy || loadingHistory || !memoryReady} onClick={() => setShowReset(true)} className="rounded-xl border border-white/20 px-3 py-2 text-xs text-white/75 hover:bg-white/5 disabled:opacity-50">
                Effacer cet échange
              </button>
            ) : null}
          </div>
          {showReset ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-yellow-500/20 bg-black/30 p-3">
              <p className="text-sm text-white/80">Supprimer définitivement les messages enregistrés de cette conversation ? Ton profil Business et tes missions resteront intacts.</p>
              <button type="button" onClick={() => void clearConversation()} disabled={busy} className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-black">Confirmer</button>
              <button type="button" onClick={() => setShowReset(false)} className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white">Annuler</button>
            </div>
          ) : null}
        </header>

        <div className="min-h-64 max-h-[55vh] space-y-4 overflow-y-auto px-4 py-6 sm:px-6" aria-label="Messages de la conversation" aria-live="polite" aria-relevant="additions text">
          {loadingHistory ? <p role="status" className="text-sm text-yellow-200">Chargement de tes derniers échanges…</p> : null}
          {!loadingHistory && messages.length === 0 ? (
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="rounded-2xl border border-yellow-500/20 bg-[#151822] p-4 text-sm leading-6 text-white/85">
                <p className="font-bold text-yellow-200">Bonjour ! Je suis Alex.</p>
                <p className="mt-2">Qu'aimerais-tu faire avancer aujourd'hui ? Tu peux me parler normalement, même si tu débutes.</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Pour commencer, choisis une idée ou écris ta propre demande :</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => { setDraft(suggestion); inputRef.current?.focus(); }}
                    className="rounded-xl border border-white/15 bg-white/[0.03] p-3 text-left text-sm leading-5 text-white/80 transition hover:border-yellow-400/40 hover:text-yellow-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[94%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[85%] ${message.role === "user" ? "bg-yellow-400 text-black" : "border border-yellow-500/20 bg-[#151822] text-white/85"}`}>
                  <p className="mb-1 text-xs font-bold opacity-70">{message.role === "user" ? "Toi" : "Coach Alex"}</p>
                  {message.role === "assistant" ? <AlexFormattedMessage content={message.content} /> : message.content}
                </div>
              </div>
            ))
          )}
          {busy && (
            <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-[#151822] px-4 py-3 text-sm text-yellow-200">
              <span aria-hidden="true" className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-yellow-400/20 border-t-yellow-300" />
              <span>Alex construit ta réponse…</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-yellow-500/20 px-4 py-4 sm:px-6">
          {busy && (
            <div role="status" aria-live="polite" className="mb-4 flex items-center gap-3 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200">
              <span aria-hidden="true" className="inline-block h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-yellow-400/25 border-t-yellow-300 border-r-yellow-400" />
              <span>Alex prépare ta réponse…</span>
            </div>
          )}
          <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void send(); }}>
            <label htmlFor="alex-conversation-input" className="mb-2 block text-sm font-semibold text-yellow-100">Ton message</label>
            <textarea
              id="alex-conversation-input"
              ref={inputRef}
              value={draft}
              maxLength={MAX_USER_MESSAGE}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => { setDraft(e.target.value); if (error) setError(""); }}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }}
              rows={3}
              placeholder="Ex. Alex, j'ai une idée de formation mais je ne sais pas si elle intéresse vraiment ma cible…"
              disabled={busy || !memoryReady || loadingHistory}
              className="w-full resize-y rounded-xl border border-yellow-500/25 bg-black/35 p-3 text-sm leading-6 text-white outline-none placeholder:text-white/40 focus:border-yellow-400 focus-visible:ring-1 focus-visible:ring-yellow-400 disabled:opacity-60"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/50">{draft.length}/{MAX_USER_MESSAGE} · Entrée pour envoyer, Maj + Entrée pour aller à la ligne</p>
              <button type="submit" disabled={!draft.trim() || busy || !memoryReady || loadingHistory} className="min-h-11 rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? "Réponse en cours…" : "Envoyer à Alex"}
              </button>
            </div>
            {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
            {!memoryReady && !loadingHistory && (
              <button type="button" onClick={() => void loadHistory()} className="mt-3 rounded-xl border border-yellow-500/40 px-4 py-2 text-sm text-yellow-200 hover:bg-yellow-400/10">Réessayer de charger ma mémoire</button>
            )}
            <p className="mt-3 text-xs leading-5 text-white/50">
              Seules les demandes nécessitant une génération IA utilisent ton quota. Tes 20 messages les plus récents (10 échanges) sont conservés dans ton compte LGD et retrouvés à ta prochaine visite. Tu peux les effacer ici sans supprimer ton profil Business.
            </p>
          </form>
        </div>
      </section>

      <nav className="mt-5 flex flex-wrap gap-2 text-sm" aria-label="Outils LGD">
        <Link href="/dashboard/automatisations/reseaux_sociaux/editor-intelligent" className="rounded-xl border border-white/20 px-4 py-3 text-white/80 hover:border-yellow-400/40">Éditeur Intelligent</Link>
        <Link href="/dashboard/email-campaigns" className="rounded-xl border border-white/20 px-4 py-3 text-white/80 hover:border-yellow-400/40">Emailing IA</Link>
        <Link href="/dashboard/lead-engine" className="rounded-xl border border-white/20 px-4 py-3 text-white/80 hover:border-yellow-400/40">Lead Engine</Link>
      </nav>
    </main>
  );
}
