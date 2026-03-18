export type FeatureKey = "global" | "coach" | "editor" | "carrousel" | "posts" | "audit" | string
export type PlanKey = "essentiel" | "pro" | "ultime" | string

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")

export type QuotaRow = {
  user_id: number
  email: string
  plan: string
  feature: string
  used: number
  limit: number
  remaining: number
  pct: number
}

export type QuotasResponse = {
  items: QuotaRow[]
  total: number
  page: number
  page_size: number
  source?: string
}

export type AdminQuotasQuery = {
  admin_key: string
  feature?: FeatureKey
  plan?: PlanKey
  q?: string
  page?: number
  page_size?: number
}

function buildUrl(path: string, params: Record<string, any>) {
  const url = new URL(`${API_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return
    url.searchParams.set(k, String(v))
  })
  return url.toString()
}

export async function getAdminQuotas(query: AdminQuotasQuery): Promise<QuotasResponse> {
  const url = buildUrl("/admin/ia/quotas", {
    admin_key: query.admin_key,
    feature: query.feature,
    plan: query.plan,
    q: query.q,
    page: query.page ?? 1,
    page_size: query.page_size ?? 10,
  })

  // IMPORTANT: don't set Content-Type on GET => avoids CORS preflight spam (OPTIONS)
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text || "Invalid JSON")
  }
}

export async function adminSetLimit(opts: {
  admin_key: string
  user_id: number
  feature: string
  limit_tokens: number
}): Promise<any> {
  // Backend expects query params (no JSON body)
  const url = buildUrl("/admin/ia/quotas/set-limit", {
    admin_key: opts.admin_key,
    user_id: opts.user_id,
    feature: opts.feature,
    limit_tokens: opts.limit_tokens,
  })

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })

  const text = await res.text()
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`)

  try {
    return JSON.parse(text)
  } catch {
    return { ok: true }
  }
}

export async function adminReset(opts: { admin_key: string; user_id: number; feature: string }): Promise<any> {
  // Backend expects query params (no JSON body)
  const url = buildUrl("/admin/ia/quotas/reset", {
    admin_key: opts.admin_key,
    user_id: opts.user_id,
    feature: opts.feature,
  })

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })

  const text = await res.text()
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`)

  try {
    return JSON.parse(text)
  } catch {
    return { ok: true }
  }
}
