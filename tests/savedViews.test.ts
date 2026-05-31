import { describe, expect, it } from "vitest";
import { makeSavedView, parseSavedViews } from "../src/domain/savedViews";

describe("saved dashboard views", () => {
  it("round-trips valid saved views and ignores malformed storage", () => {
    const view = makeSavedView("High risk", { query: "Northwind", status: "failed", page: 2, pageSize: 25 });
    expect(parseSavedViews(JSON.stringify([view]))).toEqual([view]);
    expect(parseSavedViews("not-json")).toEqual([]);
    expect(parseSavedViews(JSON.stringify([{ id: 42 }]))).toEqual([]);
  });
});
