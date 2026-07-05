export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function normalizeUsernames(values: Iterable<string>): string[] {
  const normalized = new Set<string>();

  for (const value of values) {
    const username = normalizeUsername(value);
    if (username) {
      normalized.add(username);
    }
  }

  return Array.from(normalized).sort((a, b) => a.localeCompare(b));
}
