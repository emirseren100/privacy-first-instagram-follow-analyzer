import { describe, expect, it } from "vitest";
import { analyzeFollows, difference, intersection } from "@/utils/setOperations";

describe("set operations", () => {
  it("computes set difference", () => {
    expect(difference(["alice", "bob", "cara"], ["bob"])).toEqual(["alice", "cara"]);
  });

  it("computes intersection", () => {
    expect(intersection(["alice", "bob", "cara"], ["bob", "drew", "alice"])).toEqual([
      "alice",
      "bob"
    ]);
  });

  it("builds the complete follow analysis", () => {
    expect(analyzeFollows(["alice", "bob"], ["bob", "cara"])).toEqual({
      followers: ["alice", "bob"],
      following: ["bob", "cara"],
      notFollowingBack: ["cara"],
      iDontFollowBack: ["alice"],
      mutuals: ["bob"]
    });
  });
});
