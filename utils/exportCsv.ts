function csvEscape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function usersToCsv(usernames: string[]): string {
  const rows = usernames.map((username) =>
    [username, `https://instagram.com/${username}`].map(csvEscape).join(",")
  );

  return ["username,profile_url", ...rows].join("\n");
}

export function downloadCsv(filename: string, usernames: string[]): void {
  const blob = new Blob([usersToCsv(usernames)], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function copyUsernames(usernames: string[]): Promise<void> {
  await navigator.clipboard.writeText(usernames.join("\n"));
}
