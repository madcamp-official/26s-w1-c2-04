//CRUD API 호출용도
import type { Vocab, WordEntry } from '../types/vocabulary'
import { apiRequest } from './client'

export function getVocabs(ownerId: number) {
  return apiRequest<Vocab[]>(`/vocabs/?owner_id=${ownerId}`)
}

export function createVocab(title: string, ownerId: number) {
  return apiRequest<Vocab>('/vocabs/', {
    method: 'POST',
    body: JSON.stringify({
      title,
      owner_id: ownerId,
    }),
  })
}

export function deleteVocab(vocabId: number) {
  return apiRequest<{ message: string }>(`/vocabs/${vocabId}`, {
    method: 'DELETE',
  })
}

export function createWord(
  vocabId: number,
  word: string,
  meaning: string,
  examples: string,
) {
  return apiRequest<WordEntry>(`/vocabs/${vocabId}/words/`, {
    method: 'POST',
    body: JSON.stringify({ word, meaning, example: examples }),
  })
}

export function updateWord(
  wordId: number,
  word: string,
  meaning: string,
  examples: string,
) {
  return apiRequest<WordEntry>(`/words/${wordId}`, {
    method: 'PUT',
    body: JSON.stringify({ word, meaning, example: examples }),
  })
}

export function deleteWord(wordId: number) {
  return apiRequest<{ message: string }>(`/words/${wordId}`, {
    method: 'DELETE',
  })
}
