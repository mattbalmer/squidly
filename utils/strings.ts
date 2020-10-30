export function capitalize(str: string): string {
  return str.replace(/\b[a-z]/g, s => s.toUpperCase())
}
