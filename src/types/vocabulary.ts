export type WordEntry = {
  id: number
  word: string
  meaning: string
  examples?: string
}

export type Vocab = {
  id: number
  owner_id: number
  title: string
  words: WordEntry[]
  description: string
  tags: string
  is_public: boolean
}
