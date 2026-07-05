import JSZip from "jszip";
import { normalizeUsernames } from "./normalizeUsername";
import type { ParsedInstagramExport, ParseFileStat, ParseKind, ParseProgress } from "./types";

type CandidateFormat = "json" | "html";

interface ExportCandidate {
  name: string;
  format: CandidateFormat;
  text: string;
}

const jsonFilePattern = /\.json$/i;
const htmlFilePattern = /\.html?$/i;
const supportedFilePattern = /\.(json|html?)$/i;
const followersFilePattern = /(^|\/)followers(?:[_\s-]?\d+)?(?:\s*\(\d+\))?\.(json|html?)$/i;
const followingFilePattern = /(^|\/)following(?:[_\s-]?\d+)?(?:\s*\(\d+\))?\.(json|html?)$/i;
const instagramHrefPattern =
  /https?:\\?\/\\?\/(?:www\.)?instagram\.com\\?\/([a-zA-Z0-9._]{1,30})(?:\\?\/|["?#\\\s]|$)/gi;
const ignoredInstagramPathSegments = new Set([
  "",
  "about",
  "accounts",
  "developer",
  "direct",
  "explore",
  "p",
  "privacy",
  "reel",
  "stories",
  "_u"
]);

export function classifyExportFile(name: string, parsed?: unknown): ParseKind | null {
  const normalizedPath = name.replaceAll("\\", "/").toLowerCase();

  if (followersFilePattern.test(normalizedPath)) {
    return "followers";
  }

  if (followingFilePattern.test(normalizedPath)) {
    return "following";
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed as Record<string, unknown>);
    if (keys.includes("relationships_following")) {
      return "following";
    }
    if (keys.includes("relationships_followers")) {
      return "followers";
    }
  }

  return null;
}

function pushProfileFromRecord(record: Record<string, unknown>, usernames: string[]): boolean {
  const href = record.href;
  const profileFromHref = typeof href === "string" ? usernameFromInstagramHref(href) : null;

  if (profileFromHref) {
    usernames.push(profileFromHref);
    return true;
  }

  if (href) {
    return false;
  }

  const value = record.value;
  if (typeof value === "string" && looksLikeUsername(value)) {
    usernames.push(value);
    return true;
  }

  const title = record.title;
  if (typeof title === "string" && looksLikeUsername(title)) {
    usernames.push(title);
    return true;
  }

  return false;
}

function collectRelationshipValues(node: unknown, usernames: string[]): void {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      collectRelationshipValues(child, usernames);
    }
    return;
  }

  if (typeof node !== "object") {
    return;
  }

  const record = node as Record<string, unknown>;
  const stringListData = record.string_list_data;
  const stringMapData = record.string_map_data;

  if (Array.isArray(stringListData)) {
    for (const item of stringListData) {
      if (item && typeof item === "object") {
        pushProfileFromRecord(item as Record<string, unknown>, usernames);
      }
    }
  }

  if (stringMapData && typeof stringMapData === "object" && !Array.isArray(stringMapData)) {
    for (const item of Object.values(stringMapData as Record<string, unknown>)) {
      if (item && typeof item === "object") {
        pushProfileFromRecord(item as Record<string, unknown>, usernames);
      }
    }
  }

  if (!stringListData && !stringMapData) {
    pushProfileFromRecord(record, usernames);
  }

  for (const value of Object.values(record)) {
    if (value !== stringListData && value !== stringMapData) {
      collectRelationshipValues(value, usernames);
    }
  }
}

function looksLikeUsername(value: string): boolean {
  return /^@?[a-zA-Z0-9._]{1,30}$/.test(value.trim());
}

function usernameFromInstagramHref(href: string): string | null {
  try {
    const url = new URL(href, "https://instagram.com");
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    if (hostname !== "instagram.com") {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const usernameSegment = segments[0]?.toLowerCase() === "_u" ? segments[1] : segments[0];
    const username = decodeURIComponent(usernameSegment ?? "");
    if (ignoredInstagramPathSegments.has(username.toLowerCase())) {
      return null;
    }

    return username;
  } catch {
    return null;
  }
}

function collectProfileValuesFromText(text: string): string[] {
  const values: string[] = [];
  const normalizedText = text.replaceAll("\\/", "/");

  for (const match of normalizedText.matchAll(instagramHrefPattern)) {
    const username = match[1];
    if (!ignoredInstagramPathSegments.has(username.toLowerCase())) {
      values.push(username);
    }
  }

  return values;
}

export function collectJsonProfileValues(node: unknown, usernames: string[]): void {
  collectRelationshipValues(node, usernames);
}

export function collectStringListValues(node: unknown, usernames: string[]): void {
  collectRelationshipValues(node, usernames);
}

function relationshipPayload(parsed: unknown, kind: ParseKind): unknown {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const record = parsed as Record<string, unknown>;
  const preferredKey = kind === "followers" ? "relationships_followers" : "relationships_following";

  return record[preferredKey] ?? parsed;
}

function countRelationshipRecords(node: unknown): number {
  if (!node) {
    return 0;
  }

  if (Array.isArray(node)) {
    return node.length;
  }

  if (typeof node !== "object") {
    return 0;
  }

  const record = node as Record<string, unknown>;
  if (Array.isArray(record.relationships_followers)) {
    return record.relationships_followers.length;
  }
  if (Array.isArray(record.relationships_following)) {
    return record.relationships_following.length;
  }

  let count = 0;
  if (record.string_list_data || record.string_map_data || record.href) {
    count += 1;
  }

  for (const value of Object.values(record)) {
    count += countRelationshipRecords(value);
  }

  return count;
}

function pushFileStat(
  result: ParsedInstagramExport,
  candidate: ExportCandidate,
  kind: ParseKind,
  recordCount: number,
  usernames: string[]
): void {
  result.sourceStats.push({
    name: candidate.name,
    kind,
    format: candidate.format,
    recordCount,
    usernameCount: normalizeUsernames(usernames).length
  });
}

export function detectIncompleteExportWarnings(result: ParsedInstagramExport): string[] {
  const warnings: string[] = [];
  const followersCount = result.followers.length;
  const followingCount = result.following.length;
  const followerStats = result.sourceStats.filter((stat) => stat.kind === "followers");
  const followingStats = result.sourceStats.filter((stat) => stat.kind === "following");
  const followerRecords = followerStats.reduce((total, stat) => total + stat.recordCount, 0);
  const followingRecords = followingStats.reduce((total, stat) => total + stat.recordCount, 0);

  if (followerStats.length > 0 && followersCount === 0) {
    warnings.push("Followers file was found, but no usernames were detected inside it.");
  }

  if (followingStats.length > 0 && followingCount === 0) {
    warnings.push("Following file was found, but no usernames were detected inside it.");
  }

  if (followerStats.length === 1 && followersCount > 0 && followersCount < 100) {
    warnings.push(
      "Only one followers file was found and it contains fewer than 100 usernames. If this looks too low, re-export Instagram data with Date range set to All time / Tum zamanlar."
    );
  }

  if (followersCount > 0 && followingCount >= 200 && followersCount * 3 < followingCount) {
    warnings.push(
      "Following count is much larger than followers count. This can happen when the Instagram export was limited to a recent date range instead of All time / Tum zamanlar."
    );
  }

  if (followerRecords > 0 && followersCount > 0 && followersCount < followerRecords * 0.75) {
    warnings.push(
      "Follower records were detected, but many records did not produce usernames. Open parsed file details to inspect records seen vs usernames found."
    );
  }

  if (followingRecords > 0 && followingCount > 0 && followingCount < followingRecords * 0.75) {
    warnings.push(
      "Following records were detected, but many records did not produce usernames. Open parsed file details to inspect records seen vs usernames found."
    );
  }

  return warnings;
}

export function collectHtmlProfileValues(html: string): string[] {
  if (typeof DOMParser === "undefined") {
    throw new Error("DOMParser is not available in this browser context.");
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const values: string[] = [];

  for (const anchor of Array.from(document.querySelectorAll("a"))) {
    const href = anchor.getAttribute("href");
    const fromHref = usernameFromInstagramHref(href ?? "");
    if (fromHref) {
      values.push(fromHref);
      continue;
    }

    if (href) {
      continue;
    }

    const text = anchor.textContent?.trim();
    if (text && looksLikeUsername(text)) {
      values.push(text);
    }
  }

  return values;
}

async function readZipCandidates(file: File): Promise<ExportCandidate[]> {
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files).filter(
    (entry) => !entry.dir && supportedFilePattern.test(entry.name)
  );

  return Promise.all(
    entries.map(async (entry) => ({
      name: entry.name,
      format: htmlFilePattern.test(entry.name) ? ("html" as const) : ("json" as const),
      text: await entry.async("string")
    }))
  );
}

async function readTextFromFile(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  if (typeof FileReader !== "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
      reader.addEventListener("error", () => reject(reader.error ?? new Error("Could not read file")));
      reader.readAsText(file);
    });
  }

  return new Response(file).text();
}

async function readFileCandidates(file: File): Promise<ExportCandidate[]> {
  if (/\.zip$/i.test(file.name)) {
    return readZipCandidates(file);
  }

  if (jsonFilePattern.test(file.name) || htmlFilePattern.test(file.name)) {
    return [
      {
        name: file.name,
        format: htmlFilePattern.test(file.name) ? "html" : "json",
        text: await readTextFromFile(file)
      }
    ];
  }

  return [];
}

function createEmptyResult(): ParsedInstagramExport {
  return {
    followers: [],
    following: [],
    sourceFiles: {
      followers: [],
      following: []
    },
    sourceStats: [],
    sourceFormats: {
      json: 0,
      html: 0
    },
    ignoredFiles: [],
    errors: [],
    warnings: []
  };
}

export async function parseInstagramExport(
  files: File[],
  onProgress?: (progress: ParseProgress) => void
): Promise<ParsedInstagramExport> {
  const result = createEmptyResult();
  const candidates: ExportCandidate[] = [];

  for (const file of files) {
    try {
      const nextCandidates = await readFileCandidates(file);
      if (nextCandidates.length === 0) {
        result.ignoredFiles.push(file.name);
      }
      candidates.push(...nextCandidates);
    } catch (error) {
      result.errors.push(`${file.name}: ${error instanceof Error ? error.message : "Could not read file"}`);
    }
  }

  const followerValues: string[] = [];
  const followingValues: string[] = [];
  const total = candidates.length;

  candidates.forEach((candidate, index) => {
    onProgress?.({
      currentFile: candidate.name,
      completed: index,
      total,
      message: candidate.format === "html" ? "Reading local HTML export" : "Reading local JSON export"
    });

    try {
      const parsed = candidate.format === "json" ? (JSON.parse(candidate.text) as unknown) : undefined;
      const kind = classifyExportFile(candidate.name, parsed);

      if (!kind) {
        result.ignoredFiles.push(candidate.name);
        return;
      }

      const target = kind === "followers" ? followerValues : followingValues;
      const beforeCount = target.length;
      let recordCount = 0;

      if (candidate.format === "html") {
        const htmlValues = collectHtmlProfileValues(candidate.text);
        target.push(...htmlValues);
        recordCount = htmlValues.length;
      } else {
        const payload = relationshipPayload(parsed, kind);
        collectJsonProfileValues(payload, target);
        target.push(...collectProfileValuesFromText(candidate.text));
        recordCount = countRelationshipRecords(payload);
      }

      result.sourceFiles[kind].push(candidate.name);
      result.sourceFormats[candidate.format] += 1;
      pushFileStat(result, candidate, kind, recordCount, target.slice(beforeCount));
    } catch (error) {
      result.errors.push(`${candidate.name}: ${error instanceof Error ? error.message : "Invalid export file"}`);
    }
  });

  result.followers = normalizeUsernames(followerValues);
  result.following = normalizeUsernames(followingValues);

  if (result.sourceFiles.followers.length === 0) {
    result.errors.push(
      "No followers export file was found. Add followers_1.json, followers_2.json, followers.html, or the full Instagram ZIP export."
    );
  }

  if (result.sourceFiles.following.length === 0) {
    result.errors.push(
      "No following export file was found. Add following.json, following.html, or the full Instagram ZIP export."
    );
  }

  result.warnings.push(...detectIncompleteExportWarnings(result));

  onProgress?.({
    currentFile: "",
    completed: total,
    total,
    message: "Analysis complete"
  });

  return result;
}
