import type { FollowAnalysis } from "./types";

export function difference(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item)).sort((a, b) => a.localeCompare(b));
}

export function intersection(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item)).sort((a, b) => a.localeCompare(b));
}

export function analyzeFollows(followers: string[], following: string[]): FollowAnalysis {
  return {
    followers,
    following,
    notFollowingBack: difference(following, followers),
    iDontFollowBack: difference(followers, following),
    mutuals: intersection(followers, following)
  };
}
