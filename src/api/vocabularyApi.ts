//CRUD API 호출용도
import type { Vocab, WordEntry } from '../types/vocabulary'
import { apiRequest } from './client'

export function getVocabs(ownerId: number) {
  return apiRequest<Vocab[]>(`/vocabs/?owner_id=${ownerId}`)
}

export function getSharedVocabs(ownerId: number) {
  return apiRequest<Vocab[]>(`/shared-vocabs/?owner_id=${ownerId}`)
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

export function updateVocabDescription(
  vocabId: number,
  description: string,
  tags: string,
) {
  return apiRequest<Vocab>(`/vocabs/${vocabId}/description/`, {
    method: 'PUT',
    body: JSON.stringify({ description, tags }),
  })
}

export function updateVocabPublic(vocabId: number, isPublic: boolean) {
  return apiRequest<Vocab>(`/vocabs/${vocabId}/public/`, {
    method: 'PUT',
    body: JSON.stringify({ is_public: isPublic }),
  })
}

export function copySharedVocab(vocabId: number, ownerId: number) {
  return apiRequest<Vocab>(`/vocabs/${vocabId}/copy/`, {
    method: 'POST',
    body: JSON.stringify({ owner_id: ownerId }),
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
    body: JSON.stringify({ word, meaning, examples }),
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
    body: JSON.stringify({ word, meaning, examples }),
  })
}

export function deleteWord(wordId: number) {
  return apiRequest<{ message: string }>(`/words/${wordId}`, {
    method: 'DELETE',
  })
}
