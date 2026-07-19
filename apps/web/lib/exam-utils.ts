export interface OptionItem {
  label: string
  text: string
}

export function normalizeOptions(
  raw: unknown,
): OptionItem[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  if (typeof raw[0] === 'string') {
    return raw.map((text, i) => ({
      label: String.fromCharCode(65 + i),
      text: String(text),
    }))
  }
  return raw as OptionItem[]
}
