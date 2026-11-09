export function escapeCsvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T extends Record<string, string | number | null | undefined>>(
  rows: T[],
  columns: readonly (keyof T)[],
): string {
  const header = columns.map((column) => escapeCsvCell(String(column))).join(",");
  const body = rows.map((row) => columns.map((column) => escapeCsvCell(row[column])).join(","));
  return [header, ...body].join("\n");
}
