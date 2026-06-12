export const truncateWords = (text: string, maxWords: number): string => {
  const words = text.trim().split(/\s+/)

  if (words.length <= maxWords) {
    return text
  }

  return `${words.slice(0, maxWords).join(' ')}…`
}

export const exceedsWordLimit = (text: string, maxWords: number): boolean =>
  text.trim().split(/\s+/).length > maxWords
