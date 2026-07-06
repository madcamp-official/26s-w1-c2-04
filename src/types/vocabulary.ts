export type WordEntry = {
  id: number
  word: string
  meaning: string
  example?: string
}

export type Vocab = {
  id: number
  title: string
  words: WordEntry[]
}
