import { useState } from 'react'
import type { Vocab } from '../types/vocabulary'
import QuizPage from './QuizPage'

type VocabDetailPageProps = {
  vocab: Vocab
  requestError: string
  onBack: () => void
  onAddWord: (word: string, meaning: string, examples: string) => Promise<void>
  onUpdateWord: (
    wordId: number,
    word: string,
    meaning: string,
    examples: string,
  ) => Promise<void>
  onDeleteWords: (wordIds: number[]) => Promise<void>
}

function VocabDetailPage({
  vocab,
  requestError,
  onBack,
  onAddWord,
  onUpdateWord,
  onDeleteWords,
}: VocabDetailPageProps) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [examples, setExamples] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null)
  const [editingWordId, setEditingWordId] = useState<number | null>(null)
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([])
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  function resetForm() {
    setWord('')
    setMeaning('')
    setExamples('')
    setError('')
    setFormMode(null)
    setEditingWordId(null)
  }

  async function handleSaveWord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedWord = word.trim()
    const trimmedMeaning = meaning.trim()
    const rawExamples = examples

    if (!trimmedWord || !trimmedMeaning) {
      setError('단어와 뜻을 모두 입력해 주세요.')
      return
    }

    try {
      if (formMode === 'edit' && editingWordId !== null) {
        await onUpdateWord(editingWordId, trimmedWord, trimmedMeaning, rawExamples)
        setSelectedWordIds([])
      } else {
        await onAddWord(trimmedWord, trimmedMeaning, rawExamples)
      }

      resetForm()
    } catch {
      // 부모 컴포넌트에서 서버 오류 메시지를 표시합니다.
    }
  }

  function handleShowAddForm() {
    setWord('')
    setMeaning('')
    setExamples('')
    setError('')
    setEditingWordId(null)
    setFormMode('add')
  }

  function handleShowEditForm() {
    if (selectedWordIds.length !== 1) {
      setError('수정할 단어를 하나만 선택해 주세요.')
      return
    }

    const selectedWord = vocab.words.find(
      (entry) => entry.id === selectedWordIds[0],
    )

    if (!selectedWord) return

    setWord(selectedWord.word)
    setMeaning(selectedWord.meaning)
    setExamples(selectedWord.examples ?? selectedWord.examples ?? '')
    setEditingWordId(selectedWord.id)
    setFormMode('edit')
    setError('')
  }

  async function handleDeleteSelected() {
    if (selectedWordIds.length === 0) {
      setError('삭제할 단어를 선택해 주세요.')
      return
    }

    try {
      await onDeleteWords(selectedWordIds)
      setSelectedWordIds([])
      resetForm()
    } catch {
      // 부모 컴포넌트에서 서버 오류 메시지를 표시합니다.
    }
  }

  function handleToggleWord(wordId: number) {
    setSelectedWordIds((currentIds) =>
      currentIds.includes(wordId)
        ? currentIds.filter((id) => id !== wordId)
        : [...currentIds, wordId],
    )
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredWords = vocab.words.filter(
    (entry) =>
      entry.word.toLowerCase().includes(normalizedSearch) ||
      entry.meaning.toLowerCase().includes(normalizedSearch),
  )
  const quizWords =
    selectedWordIds.length > 0
      ? vocab.words.filter((entry) => selectedWordIds.includes(entry.id))
      : vocab.words

  if (isQuizOpen) {
    return (
      <QuizPage
        vocab={vocab}
        words={quizWords}
        onBack={() => setIsQuizOpen(false)}
      />
    )
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <button className="back-button" type="button" onClick={onBack}>
          단어장 목록
        </button>
        <div>
          <p className="vocab-eyebrow">VOCABULARY</p>
          <h1>{vocab.title}</h1>
        </div>
        <div className="detail-header-actions">
          <button
            type="button"
            onClick={() => setIsQuizOpen(true)}
            disabled={vocab.words.length === 0}
          >
            퀴즈 치기
          </button>
          <span className="word-count">{vocab.words.length}개 단어</span>
        </div>
      </header>

      <section className="detail-controls">
        <div className="detail-actions">
          <button type="button" onClick={handleShowAddForm}>
            단어 추가
          </button>
          <button
            type="button"
            onClick={handleShowEditForm}
            disabled={vocab.words.length === 0}
          >
            선택 수정
          </button>
          <button
            className="selected-delete-button"
            type="button"
            onClick={handleDeleteSelected}
            disabled={vocab.words.length === 0}
          >
            선택 삭제
          </button>
          <span>{selectedWordIds.length}개 선택</span>
        </div>

        <label className="word-search">
          단어 검색
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="단어나 뜻을 검색하세요"
          />
        </label>
      </section>

      {formMode && (
        <form
          className="word-create-form detail-word-form"
          onSubmit={handleSaveWord}
        >
          <label>
            단어
            <input
              value={word}
              onChange={(event) => setWord(event.target.value)}
              placeholder="예: apple"
            />
          </label>
          <label>
            뜻
            <input
              value={meaning}
              onChange={(event) => setMeaning(event.target.value)}
              placeholder="예: 사과"
            />
          </label>
          <label>
            예문
            <input
              value={examples}
              onChange={(event) => setExamples(event.target.value)}
              placeholder="예: Apples are delicious"
            />
          </label>
          <button type="submit">
            {formMode === 'edit' ? '수정 저장' : '추가 완료'}
          </button>
          <button className="cancel-form-button" type="button" onClick={resetForm}>
            취소
          </button>
          {error && <p className="word-form-error">{error}</p>}
        </form>
      )}

      {!formMode && error && <p className="detail-message">{error}</p>}
      {requestError && <p className="detail-message">{requestError}</p>}

      {vocab.words.length === 0 ? (
        <section className="empty-words">
          <h2>아직 등록된 단어가 없습니다</h2>
          <p>위 입력창에서 첫 번째 단어를 추가해 보세요.</p>
        </section>
      ) : filteredWords.length === 0 ? (
        <section className="empty-words">
          <h2>검색 결과가 없습니다</h2>
          <p>다른 검색어를 입력해 보세요.</p>
        </section>
      ) : (
        <ul className="word-list">
          {filteredWords.map((entry) => (
            <li className="word-item" key={entry.id}>
              <input
                type="checkbox"
                checked={selectedWordIds.includes(entry.id)}
                onChange={() => handleToggleWord(entry.id)}
                aria-label={`${entry.word} 선택`}
              />
              <div>
                <strong>{entry.word}</strong>
                <span>{entry.meaning}</span>
                {(entry.examples ?? entry.examples) && (
                  <span>{entry.examples ?? entry.examples}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default VocabDetailPage
