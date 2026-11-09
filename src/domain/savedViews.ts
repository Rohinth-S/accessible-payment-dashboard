import type { PaymentFilters } from "./query";

export type SavedView = { id: string; name: string; filters: Pick<PaymentFilters, "query" | "status" | "pageSize">; createdAt: string };
const STORAGE_KEY = "clearpay.saved-views.v1";

export function parseSavedViews(raw: string | null): SavedView[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is SavedView => Boolean(entry && typeof entry === "object" && typeof (entry as SavedView).id === "string" && typeof (entry as SavedView).name === "string" && (entry as SavedView).filters));
  } catch { return []; }
}
export function loadSavedViews(): SavedView[] { return parseSavedViews(window.localStorage.getItem(STORAGE_KEY)); }
export function persistSavedViews(views: readonly SavedView[]) { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views.slice(0, 20))); }
export function makeSavedView(name: string, filters: PaymentFilters): SavedView { return { id: crypto.randomUUID(), name: name.trim(), filters: { query: filters.query.trim(), status: filters.status, pageSize: filters.pageSize }, createdAt: new Date().toISOString() }; }
