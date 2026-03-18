
import type { EmailAnalyticsDashboardResponse } from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export async function fetchEmailAnalyticsDashboard(): Promise<EmailAnalyticsDashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/email-analytics/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Impossible de charger le dashboard analytics.");
  }

  return response.json();
}
