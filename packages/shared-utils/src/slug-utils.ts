export function generateSlug(name: string, id?: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return id ? `${base}-${id.slice(0, 8)}` : base;
}
