import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, paginate, parseFilters, segmentRisk, serializeFilters } from "../src/domain/query";
import { payments } from "../src/domain/payments";

describe("dashboard query state", () => {
  it("round-trips filters into a shareable URL", () => {
    const filters = { ...DEFAULT_FILTERS, query: "northwind", status: "settled" as const, page: 2, pageSize: 25 };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });

  it("clamps invalid pages and paginates without mutating source rows", () => {
    const result = paginate(payments, 99, 2);
    expect(result.currentPage).toBe(2);
    expect(result.rows).toHaveLength(2);
    expect(payments).toHaveLength(4);
  });

  it("segments visible payments by risk band", () => {
    expect(segmentRisk(payments)).toEqual({ low: 3, medium: 0, high: 1 });
  });
});
