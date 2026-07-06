import { useEffect, useState } from 'react'
import {
  createVocab,
  createWord,
  deleteVocab,
  deleteWord,
  getVocabs,
  updateWord,
} from '../api/vocabularyApi'
import type { Vocab } from '../types/vocabulary'
import VocabDetailPage from './VocabDetailPage'

type VocabListPageProps = {
  userId: number
  username: string
  onLogout: () => void
}

function VocabListPage({ userId, username, onLogout }: VocabListPageProps) {
  const [vocabTitle, setVocabTitle] = useState('')
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [selectedVocabId, setSelectedVocabId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestError, setRequestError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadVocabs() {
      try {
        const loadedVocabs = await getVocabs(userId)
        if (!isCancelled) {
          setVocabs(loadedVocabs)
          setRequestError('')
        }
      } catch (error) {
        if (!isCancelled) setRequestError(getErrorMessage(error))
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadVocabs()

    return () => {
      isCancelled = true
    }
  }, [userId])

  function getErrorMessage(error: unknown) {
    return error instanceof Error
      ? error.message
      : '서버 요청에 실패했습니다.'
  }

  async function handleAddVocab(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = vocabTitle.trim()
    if (!title) return

    try {
      const newVocab = await createVocab(title, userId)
      setVocabs((currentVocabs) => [...currentVocabs, newVocab])
      setVocabTitle('')
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
    }
  }

  async function handleDeleteVocab(id: number) {
    try {
      await deleteVocab(id)
      setVocabs((currentVocabs) =>
        currentVocabs.filter((vocab) => vocab.id !== id),
      )
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
    }
  }

  async function handleAddWord(
    vocabId: number,
    word: string,
    meaning: string,
    examples: string,
  ) {
    try {
      const newWord = await createWord(vocabId, word, meaning, examples)
      setVocabs((currentVocabs) =>
        currentVocabs.map((vocab) =>
          vocab.id === vocabId
            ? { ...vocab, words: [...vocab.words, newWord] }
            : vocab,
        ),
      )
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
      throw error
    }
  }

  async function handleUpdateWord(
    vocabId: number,
    wordId: number,
    word: string,
    meaning: string,
    examples: string,
  ) {
    try {
      const updatedWord = await updateWord(wordId, word, meaning, examples)
      setVocabs((currentVocabs) =>
        currentVocabs.map((vocab) =>
          vocab.id === vocabId
            ? {
                ...vocab,
                words: vocab.words.map((entry) =>
                  entry.id === wordId ? updatedWord : entry,
                ),
              }
            : vocab,
        ),
      )
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
      throw error
    }
  }

  async function handleDeleteWords(vocabId: number, wordIds: number[]) {
    try {
      await Promise.all(wordIds.map((wordId) => deleteWord(wordId)))
      setVocabs((currentVocabs) =>
        currentVocabs.map((vocab) =>
          vocab.id === vocabId
            ? {
                ...vocab,
                words: vocab.words.filter(
                  (entry) => !wordIds.includes(entry.id),
                ),
              }
            : vocab,
        ),
      )
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
      throw error
    }
  }

  const selectedVocab = vocabs.find((vocab) => vocab.id === selectedVocabId)

  if (selectedVocab) {
    return (
      <VocabDetailPage
        vocab={selectedVocab}
        requestError={requestError}
        onBack={() => {
          setSelectedVocabId(null)
          setRequestError('')
        }}
        onAddWord={(word, meaning, examples) =>
          handleAddWord(selectedVocab.id, word, meaning, examples)
        }
        onUpdateWord={(wordId, word, meaning, examples) =>
          handleUpdateWord(selectedVocab.id, wordId, word, meaning, examples)
        }
        onDeleteWords={(wordIds) =>
          handleDeleteWords(selectedVocab.id, wordIds)
        }
      />
    )
  }

  return (
    <main className="vocab-page">
      <header className="vocab-header">
        <div>
          <p className="vocab-eyebrow">MY VOCABULARY</p>
          <h1>{username}님의 단어장</h1>
        </div>
        <button className="logout-button" type="button" onClick={onLogout}>
          로그아웃
        </button>
      </header>

      <form className="vocab-create-form" onSubmit={handleAddVocab}>
        <input
          value={vocabTitle}
          onChange={(event) => setVocabTitle(event.target.value)}
          placeholder="새 단어장 이름"
        />
        <button type="submit">추가</button>
      </form>

      {requestError && <p className="api-error">{requestError}</p>}

      {isLoading ? (
        <section className="empty-vocab">
          <h2>단어장을 불러오는 중입니다</h2>
        </section>
      ) : vocabs.length === 0 ? (
        <section className="empty-vocab">
          <h2>아직 단어장이 없습니다</h2>
          <p>위 입력창에서 첫 번째 단어장을 만들어 보세요.</p>
        </section>
      ) : (
        <section className="vocab-grid">
          {vocabs.map((vocab) => (
            <article className="vocab-card" key={vocab.id}>
              <h2>{vocab.title}</h2>
              <p className="vocab-word-count">
                {vocab.words.length}개 단어
              </p>
              <div className="vocab-card-actions">
                <button
                  className="open-vocab-button"
                  type="button"
                  onClick={() => setSelectedVocabId(vocab.id)}
                >
                  열기
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => handleDeleteVocab(vocab.id)}
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default VocabListPage
