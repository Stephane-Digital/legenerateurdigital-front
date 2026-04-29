import type { CMOPayload } from "../types";

export const CMO_DISPATCH_PAYLOAD_KEY = "lgd_cmo_dispatch_payload";
export const CMO_LEGACY_PAYLOAD_KEY = "lgd_cmo_module_auto_payload";

export function saveCMOPayload(payload: CMOPayload) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(payload);
  window.localStorage.setItem(CMO_DISPATCH_PAYLOAD_KEY, serialized);
  window.localStorage.setItem(CMO_LEGACY_PAYLOAD_KEY, serialized);
}
