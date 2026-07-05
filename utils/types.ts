export type ResultTabId =
  | "notFollowingBack"
  | "iDontFollowBack"
  | "mutuals"
  | "followers"
  | "following";

export type ParseKind = "followers" | "following";

export interface ParsedInstagramExport {
  followers: string[];
  following: string[];
  sourceFiles: {
    followers: string[];
    following: string[];
  };
  sourceStats: ParseFileStat[];
  sourceFormats: {
    json: number;
    html: number;
  };
  ignoredFiles: string[];
  errors: string[];
  warnings: string[];
}

export interface ParseFileStat {
  name: string;
  kind: ParseKind;
  format: "json" | "html";
  recordCount: number;
  usernameCount: number;
}

export interface FollowAnalysis {
  followers: string[];
  following: string[];
  notFollowingBack: string[];
  iDontFollowBack: string[];
  mutuals: string[];
}

export interface TabConfig {
  id: ResultTabId;
  label: string;
  description: string;
  count: number;
  users: string[];
}

export interface ParseProgress {
  currentFile: string;
  completed: number;
  total: number;
  message: string;
}
