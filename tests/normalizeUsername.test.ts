import { describe, expect, it } from "vitest";
import { normalizeUsername, normalizeUsernames } from "@/utils/normalizeUsername";

describe("username normalization", () => {
  it("lowercases, trims, and removes leading @ characters", () => {
    expect(normalizeUsername("  @@Example.User  ")).toBe("example.user");
  });

  it("deduplicates normalized usernames", () => {
    expect(normalizeUsernames([" @Alice ", "alice", "BOB", "bob", ""])).toEqual([
      "alice",
      "bob"
    ]);
  });
});
