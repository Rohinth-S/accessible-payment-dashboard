import type { Payment, PaymentStatus } from "./payments";

export type PaymentFilters = {
  query: string;
  status: "all" | PaymentStatus;
  page: number;
  pageSize: number;
};

export const DEFAULT_FILTERS: PaymentFilters = {
  query: "",
  status: "all",
  page: 1,
  pageSize: 10,
};

export function parseFilters(search: string): PaymentFilters {
  const params = new URLSearchParams(search);
  const status = params.get("status");
  const page = Number(params.get("page") ?? DEFAULT_FILTERS.page);
  const pageSize = Number(params.get("pageSize") ?? DEFAULT_FILTERS.pageSize);
  return {
    query: params.get("q") ?? DEFAULT_FILTERS.query,
    status: status === "settled" || status === "pending" || status === "failed" || status === "refunded" ? status : "all",
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_FILTERS.page,
    pageSize: [10, 25, 50].includes(pageSize) ? pageSize : DEFAULT_FILTERS.pageSize,
  };
}

export function serializeFilters(filters: PaymentFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.page !== 1) params.set("page", String(filters.page));
  if (filters.pageSize !== DEFAULT_FILTERS.pageSize) params.set("pageSize", String(filters.pageSize));
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export function paginate<T>(rows: readonly T[], page: number, pageSize: number) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * safePageSize;
  return { rows: rows.slice(start, start + safePageSize), currentPage, totalPages, totalRows: rows.length };
}

export function segmentRisk(rows: readonly Payment[]) {
  return rows.reduce((segments, row) => {
    const bucket = row.riskScore >= 70 ? "high" : row.riskScore >= 35 ? "medium" : "low";
    segments[bucket] += 1;
    return segments;
  }, { low: 0, medium: 0, high: 0 });
}
