import type { Vocab, WordEntry } from '../types/vocabulary'

export type SortMode = 'latest' | 'en-ko' | 'ko-en'
export type VocabSortMode = SortMode | 'share-count'

type LeadingGroup = 'en' | 'ko' | 'other'

const englishPattern = /^[A-Za-z]/
const koreanPattern = /^[ㄱ-ㅎㅏ-ㅣ가-힣]/

function getLeadingGroup(value: string): LeadingGroup {
  const firstCharacter = value.trim()[0] ?? ''

  if (englishPattern.test(firstCharacter)) return 'en'
  if (koreanPattern.test(firstCharacter)) return 'ko'
  return 'other'
}

function getGroupPriority(group: LeadingGroup, mode: Exclude<SortMode, 'latest'>) {
  if (mode === 'en-ko') {
    if (group === 'en') return 0
    if (group === 'ko') return 1
    return 2
  }

  if (group === 'ko') return 0
  if (group === 'en') return 1
  return 2
}

function compareText(a: string, b: string, mode: Exclude<SortMode, 'latest'>) {
  const left = a.trim()
  const right = b.trim()
  const leftGroup = getLeadingGroup(left)
  const rightGroup = getLeadingGroup(right)
  const priorityDifference =
    getGroupPriority(leftGroup, mode) - getGroupPriority(rightGroup, mode)

  if (priorityDifference !== 0) return priorityDifference

  return left.localeCompare(right, ['ko', 'en'], {
    sensitivity: 'base',
    numeric: true,
  })
}

export function getShareCount(vocab: Vocab) {
  return vocab.share_count ?? 0
}

export function sortVocabs(vocabs: Vocab[], mode: VocabSortMode) {
  const copiedVocabs = [...vocabs]

  if (mode === 'latest') {
    return copiedVocabs.sort((a, b) => b.id - a.id)
  }

  if (mode === 'share-count') {
    return copiedVocabs.sort(
      (a, b) => getShareCount(b) - getShareCount(a) || b.id - a.id,
    )
  }

  return copiedVocabs.sort(
    (a, b) => compareText(a.title, b.title, mode) || b.id - a.id,
  )
}

export function sortWords(words: WordEntry[], mode: SortMode) {
  const copiedWords = [...words]

  if (mode === 'latest') {
    return copiedWords.sort((a, b) => b.id - a.id)
  }

  const getSortTarget = (entry: WordEntry) =>
    mode === 'en-ko' ? entry.word : entry.meaning

  return copiedWords.sort(
    (a, b) => compareText(getSortTarget(a), getSortTarget(b), mode) || b.id - a.id,
  )
}
