import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, LogIn, LogOut, Mail, Shield, UserPlus, CheckCircle, XCircle } from "lucide-react";

/**
 * Front Auth + Pricing — Single-file UI
 * -------------------------------------------------
 * Usage:
 * - Déploie ce composant dans une page Next.js (ex: /pages/index.tsx ou app/page.tsx)
 * - Définit la variable globale optionnelle: window.__DG_BASE_URL = "https://app.legenerateurdigital.com"
 * - Remplace le lien de checkout Systeme.io ou saisis-le dans le champ prévu (persisté en localStorage)
 *
 * Fonctions incluses:
 * - Pricing (27 €/mois) avec bouton "S'abonner" → URL Systeme.io
 * - Auth: /auth/register, /auth/login (FastAPI du pack Docker)
 * - Session token en mémoire (localStorage) + bouton logout
 * - Test d'accès API /health et affichage du statut
 */

const DG_DEFAULT_BASE_URL = (typeof window !== 'undefined' && (window as any).__DG_BASE_URL) || "http://localhost:8000";
const STORAGE_KEY_TOKEN = "dg_token";
const STORAGE_KEY_CHECKOUT = "dg_checkout_url";

async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${DG_DEFAULT_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function DGAuthPricing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [health, setHealth] = useState<string>("…");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (saved) setToken(saved);
    const co = localStorage.getItem(STORAGE_KEY_CHECKOUT);
    if (co) setCheckoutUrl(co);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const h = await api('/health');
        setHealth('API OK');
      } catch (e:any) {
        setHealth('API non joignable');
      }
    })();
  }, []);

  const saveCheckout = () => {
    localStorage.setItem(STORAGE_KEY_CHECKOUT, checkoutUrl.trim());
    setMsg('Lien Systeme.io enregistré ✅');
    setTimeout(()=> setMsg(''), 1800);
  };

  const register = async () => {
    setBusy('register'); setMsg('');
    try {
      const res = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
      setToken(res.access_token);
      localStorage.setItem(STORAGE_KEY_TOKEN, res.access_token);
      setMsg('Compte créé ✔︎');
    } catch (e:any) { setMsg(e.message || 'Erreur inscription'); }
    setBusy(null);
  };

  const login = async () => {
    setBusy('login'); setMsg('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setToken(res.access_token);
      localStorage.setItem(STORAGE_KEY_TOKEN, res.access_token);
      setMsg('Connecté ✔︎');
    } catch (e:any) { setMsg(e.message || 'Erreur connexion'); }
    setBusy(null);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setMsg('Déconnecté');
    setTimeout(()=> setMsg(''), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold">Le Générateur Digital</h1>
            <p className="text-slate-500">Abonnement : <b>27 €/mois</b> · API: <span className={health.includes('OK')? 'text-emerald-600':'text-rose-600'}>{health}</span></p>
            <p className="text-xs text-slate-400">Base URL API: {DG_DEFAULT_BASE_URL}</p>
          </div>
          {token ? (
            <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white"><LogOut className="w-4 h-4"/> Déconnexion</button>
          ) : null}
        </div>

        {/* Message */}
        {msg && (
          <div className="mb-6 p-3 rounded-xl border bg-white text-sm">
            {msg}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pricing */}
          <div className="p-5 bg-white rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5"/>
              <h2 className="font-semibold">Offre Pro</h2>
            </div>
            <div className="text-4xl font-bold">27€<span className="text-base font-normal">/mois</span></div>
            <ul className="mt-4 text-sm space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Génération de contenu illimitée</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Campagnes publicitaires (outil)</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Tunnels de vente</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Emails & automatisations</li>
            </ul>

            <div className="mt-5">
              <label className="text-xs text-slate-500">URL Checkout Systeme.io</label>
              <input value={checkoutUrl} onChange={(e)=> setCheckoutUrl(e.target.value)} placeholder="https://votre-tunnel.systeme.io/checkout..." className="mt-1 w-full border rounded-lg px-3 py-2"/>
              <div className="flex gap-2 mt-2">
                <button onClick={saveCheckout} className="px-3 py-2 rounded-lg border">Enregistrer</button>
                <a href={checkoutUrl||'#'} target="_blank" rel="noreferrer" className={`px-3 py-2 rounded-lg text-white ${checkoutUrl? 'bg-black':'bg-gray-400 cursor-not-allowed'} inline-flex items-center gap-2`}>
                  <Shield className="w-4 h-4"/> S'abonner maintenant
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-2">Astuce: colle ici l'URL de paiement de ton tunnel Systeme.io. Après l'achat, redirige tes clients vers l'app.</p>
            </div>
          </div>

          {/* Auth */}
          <div className="p-5 bg-white rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5"/>
              <h2 className="font-semibold">Connexion / Inscription</h2>
            </div>
            <label className="text-xs text-slate-500">E‑mail</label>
            <input value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="contact@profitsduweb.com" className="mt-1 w-full border rounded-lg px-3 py-2"/>
            <div className="mt-3">
              <label className="text-xs text-slate-500">Mot de passe</label>
              <input type="password" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full border rounded-lg px-3 py-2"/>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={register} disabled={busy==='register'} className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">
                <UserPlus className="w-4 h-4"/>{busy==='register'? 'Création…':'Créer mon compte'}
              </button>
              <button onClick={login} disabled={busy==='login'} className="px-3 py-2 rounded-lg bg-black text-white inline-flex items-center gap-2">
                <LogIn className="w-4 h-4"/>{busy==='login'? 'Connexion…':'Se connecter'}
              </button>
            </div>
            {token ? (
              <div className="mt-4 text-xs break-all p-2 bg-slate-50 border rounded-lg">
                <div className="font-medium mb-1">Token:</div>
                {token}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">Un token apparaîtra ici après connexion.</p>
            )}
          </div>
        </div>

        {/* Mini tests / diagnostics */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-white text-sm">
            <div className="font-semibold mb-1">Test API</div>
            <div className={`inline-flex items-center gap-2 ${health.includes('OK')? 'text-emerald-600':'text-rose-600'}`}>
              {health.includes('OK')? <CheckCircle className="w-4 h-4"/>: <XCircle className="w-4 h-4"/>} {health}
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-white text-sm">
            <div className="font-semibold mb-1">Étapes pour Systeme.io</div>
            <ol className="list-decimal ml-4 space-y-1 text-slate-600">
              <li>Crée l'offre 27€/mois dans Systeme.io.</li>
              <li>Copie l'URL de checkout et colle-la ci‑dessus.</li>
              <li>Après paiement, redirige vers l'app (dashboard).</li>
            </ol>
          </div>
          <div className="p-4 rounded-xl border bg-white text-sm">
            <div className="font-semibold mb-1">Configuration</div>
            <ul className="space-y-1 text-slate-600">
              <li><b>API</b> : {DG_DEFAULT_BASE_URL}</li>
              <li><b>Override</b> : window.__DG_BASE_URL</li>
              <li><b>Contact</b> : contact@profitsduweb.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
