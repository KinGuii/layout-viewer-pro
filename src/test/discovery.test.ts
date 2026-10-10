import { describe, expect, it } from "vitest";
import { recommendations, releases } from "@/lib/discovery";

const make = (n: number, status = "radar") => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, status }));
describe("discovery", () => {
  it("releases are the first 8 stored tracks", () => {
    expect(releases(make(10)).map(t => t.id)).toEqual(["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]);
  });
  it("recommendations exclude repeat and put radar before club, keeping stored order", () => {
    const tracks = [{ id: "a", status: "club" }, { id: "b", status: "repeat" }, { id: "c", status: "radar" }, { id: "d", status: "radar" }];
    expect(recommendations(tracks).map(t => t.id)).toEqual(["c", "d", "a"]);
  });
  it("recommendations are capped at 8", () => {
    expect(recommendations(make(12))).toHaveLength(8);
  });
});
