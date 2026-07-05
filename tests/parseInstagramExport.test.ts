import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import {
  collectHtmlProfileValues,
  collectJsonProfileValues,
  collectStringListValues,
  detectIncompleteExportWarnings,
  parseInstagramExport
} from "@/utils/parseInstagramExport";
import type { ParsedInstagramExport } from "@/utils/types";

function jsonFile(name: string, content: unknown): File {
  return new File([JSON.stringify(content)], name, { type: "application/json" });
}

function htmlFile(name: string, content: string): File {
  return new File([content], name, { type: "text/html" });
}

describe("Instagram export parser", () => {
  it("collects usernames from nested string_list_data values", () => {
    const values: string[] = [];

    collectStringListValues(
      {
        relationships_followers: [
          { string_list_data: [{ value: "Alice" }] },
          { nested: { string_list_data: [{ value: "@Bob" }] } }
        ]
      },
      values
    );

    expect(values).toEqual(["Alice", "@Bob"]);
  });

  it("supports multiple followers JSON files and removes duplicates", async () => {
    const result = await parseInstagramExport([
      jsonFile("followers_1.json", [
        { string_list_data: [{ value: "Alice" }] },
        { string_list_data: [{ value: "@Bob" }] }
      ]),
      jsonFile("followers_2.json", [{ string_list_data: [{ value: "alice" }] }]),
      jsonFile("following.json", {
        relationships_following: [
          { string_list_data: [{ value: "Bob" }] },
          { string_list_data: [{ value: "Cara" }] }
        ]
      })
    ]);

    expect(result.followers).toEqual(["alice", "bob"]);
    expect(result.following).toEqual(["bob", "cara"]);
    expect(result.errors).toEqual([]);
    expect(result.sourceFiles.followers).toHaveLength(2);
  });

  it("supports following_1.json and href based username fields", async () => {
    const result = await parseInstagramExport([
      jsonFile("followers_1.json", [
        { string_list_data: [{ value: "Alice" }] },
        { href: "https://www.instagram.com/bob/" }
      ]),
      jsonFile("following_1.json", {
        relationships_following: [
          { href: "https://instagram.com/bob/" },
          { value: "@Cara" }
        ]
      })
    ]);

    expect(result.followers).toEqual(["alice", "bob"]);
    expect(result.following).toEqual(["bob", "cara"]);
    expect(result.warnings).toContain(
      "Only one followers file was found and it contains fewer than 100 usernames. If this looks too low, re-export Instagram data with Date range set to All time / Tum zamanlar."
    );
  });

  it("supports Instagram _u profile redirect hrefs", async () => {
    const result = await parseInstagramExport([
      jsonFile("followers_1.json", [{ string_list_data: [{ href: "https://www.instagram.com/_u/Alice" }] }]),
      jsonFile("following.json", {
        relationships_following: [
          { title: "Alice", string_list_data: [{ href: "https://www.instagram.com/_u/Alice" }] },
          { title: "Bob", string_list_data: [{ href: "https://www.instagram.com/_u/Bob" }] }
        ]
      })
    ]);

    expect(result.followers).toEqual(["alice"]);
    expect(result.following).toEqual(["alice", "bob"]);
  });

  it("supports copied chunk filenames from file pickers", async () => {
    const result = await parseInstagramExport([
      jsonFile("followers_2 (1).json", [{ string_list_data: [{ value: "Alice" }] }]),
      jsonFile("following_1 (1).json", [{ string_list_data: [{ value: "Bob" }] }])
    ]);

    expect(result.followers).toEqual(["alice"]);
    expect(result.following).toEqual(["bob"]);
    expect(result.errors).toEqual([]);
  });

  it("collects usernames from JSON href and value fallback fields", () => {
    const values: string[] = [];

    collectJsonProfileValues(
      {
        items: [
          { href: "https://instagram.com/alice/" },
          { value: "@Bob" },
          { href: "https://instagram.com/p/not-a-user", value: "post" }
        ]
      },
      values
    );

    expect(values).toEqual(["alice", "@Bob"]);
  });

  it("parses HTML exports with DOMParser", async () => {
    const result = await parseInstagramExport([
      htmlFile(
        "followers.html",
        '<a href="https://www.instagram.com/Alice/">Alice</a><a href="/bob/">bob</a>'
      ),
      htmlFile(
        "following.html",
        '<a href="https://instagram.com/bob/">bob</a><a href="https://instagram.com/cara/">cara</a>'
      )
    ]);

    expect(result.followers).toEqual(["alice", "bob"]);
    expect(result.following).toEqual(["bob", "cara"]);
    expect(result.sourceFormats.html).toBe(2);
  });

  it("parses supported files from ZIP exports", async () => {
    const zip = new JSZip();
    zip.file("connections/followers_and_following/followers_1.json", JSON.stringify([
      { string_list_data: [{ value: "Alice" }] }
    ]));
    zip.file("connections/followers_and_following/following.json", JSON.stringify({
      relationships_following: [{ string_list_data: [{ value: "Bob" }] }]
    }));
    zip.file("profile/profile_information.json", JSON.stringify({ name: "ignored" }));

    const blob = await zip.generateAsync({ type: "blob" });
    const result = await parseInstagramExport([
      new File([blob], "instagram-export.zip", { type: "application/zip" })
    ]);

    expect(result.followers).toEqual(["alice"]);
    expect(result.following).toEqual(["bob"]);
    expect(result.ignoredFiles).toEqual(["profile/profile_information.json"]);
  });

  it("reports missing required Instagram files clearly", async () => {
    const result = await parseInstagramExport([
      jsonFile("followers_1.json", [{ string_list_data: [{ value: "Alice" }] }])
    ]);

    expect(result.followers).toEqual(["alice"]);
    expect(result.following).toEqual([]);
    expect(result.errors).toContain(
      "No following export file was found. Add following.json, following.html, or the full Instagram ZIP export."
    );
  });

  it("warns when an export looks limited or incomplete", () => {
    const result: ParsedInstagramExport = {
      followers: Array.from({ length: 65 }, (_, index) => `follower${index}`),
      following: Array.from({ length: 547 }, (_, index) => `following${index}`),
      sourceFiles: {
        followers: ["connections/followers_and_following/followers_1.json"],
        following: ["connections/followers_and_following/following.json"]
      },
      sourceStats: [
        {
          name: "connections/followers_and_following/followers_1.json",
          kind: "followers",
          format: "json",
          recordCount: 65,
          usernameCount: 65
        },
        {
          name: "connections/followers_and_following/following.json",
          kind: "following",
          format: "json",
          recordCount: 547,
          usernameCount: 547
        }
      ],
      sourceFormats: {
        json: 2,
        html: 0
      },
      ignoredFiles: [],
      errors: [],
      warnings: []
    };

    expect(detectIncompleteExportWarnings(result)).toEqual([
      "Only one followers file was found and it contains fewer than 100 usernames. If this looks too low, re-export Instagram data with Date range set to All time / Tum zamanlar.",
      "Following count is much larger than followers count. This can happen when the Instagram export was limited to a recent date range instead of All time / Tum zamanlar."
    ]);
  });

  it("warns when records are seen but usernames are mostly missing", () => {
    const result: ParsedInstagramExport = {
      followers: ["alice"],
      following: ["bob"],
      sourceFiles: {
        followers: ["followers_1.json"],
        following: ["following.json"]
      },
      sourceStats: [
        {
          name: "followers_1.json",
          kind: "followers",
          format: "json",
          recordCount: 20,
          usernameCount: 1
        },
        {
          name: "following.json",
          kind: "following",
          format: "json",
          recordCount: 20,
          usernameCount: 1
        }
      ],
      sourceFormats: {
        json: 2,
        html: 0
      },
      ignoredFiles: [],
      errors: [],
      warnings: []
    };

    expect(detectIncompleteExportWarnings(result)).toContain(
      "Follower records were detected, but many records did not produce usernames. Open parsed file details to inspect records seen vs usernames found."
    );
    expect(detectIncompleteExportWarnings(result)).toContain(
      "Following records were detected, but many records did not produce usernames. Open parsed file details to inspect records seen vs usernames found."
    );
  });

  it("extracts profile usernames from HTML anchors", () => {
    expect(
      collectHtmlProfileValues(
        '<a href="https://instagram.com/alice/">Alice</a><a href="https://instagram.com/p/abc">post</a>'
      )
    ).toEqual(["alice"]);
  });
});
