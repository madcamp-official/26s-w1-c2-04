import { useEffect, useState } from 'react'
import { login } from '../api/authApi'
import {
  createVocab,
  createWord,
  deleteVocab,
  deleteWord,
  getVocabs,
  updateVocabDescription,
  updateVocabPublic,
  updateWord,
} from '../api/vocabularyApi'
import type { Vocab } from '../types/vocabulary'
import type { VocabSortMode } from '../utils/sort'
import { getShareCount, sortVocabs } from '../utils/sort'
import type { ThemeMode } from '../types/theme'
import VocabDetailPage from './VocabDetailPage'
import CharacterIMG from '../assets/BamtiV3_withoutbg.png'

type VocabListPageProps = {
  userId: number
  username: string
  themeMode: ThemeMode
  onLogout: () => void
  onOpenMyPage: () => void
  onOpenSharedPage: () => void
}

function Characters({ isBamtiMode }: { isBamtiMode: boolean }) {
  if (!isBamtiMode) {
    return (
      <div>
        <img
          src={CharacterIMG}
          alt="캐릭터"
          style={{ width: '60px', height: 'auto' }}
        />
      </div>
    )
  }

  return (
    <div className="bamti-stack" aria-hidden="true">
      <span className="bamti-speech bamti-speech-left">네?</span>
      <img
        src={CharacterIMG}
        alt=""
        className="bamti-character"
      />
      <span className="bamti-speech bamti-speech-right">완전 밤티</span>
    </div>
  )
}

function VocabListPage({
  userId,
  username,
  themeMode,
  onLogout,
  onOpenMyPage,
  onOpenSharedPage,
}: VocabListPageProps) {
  const isBamtiMode = themeMode === 'bamti'
  const [vocabTitle, setVocabTitle] = useState('')
  const [vocabs, setVocabs] = useState<Vocab[]>([])
  const [selectedVocabId, setSelectedVocabId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestError, setRequestError] = useState('')
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [myPagePassword, setMyPagePassword] = useState('')
  const [myPagePasswordError, setMyPagePasswordError] = useState('')
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [sortMode, setSortMode] = useState<VocabSortMode>('latest')
  const [nameSearch, setNameSearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')

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

  function clearErrors() {
    setRequestError('')
    setMyPagePasswordError('')
  }

  async function handleAddVocab(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearErrors()

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
    clearErrors()

    const shouldDelete = window.confirm('이 단어장을 삭제할까요?')

    if (!shouldDelete) return

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
    clearErrors()

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
    clearErrors()

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
    clearErrors()

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

  async function handleUpdateVocabTags(
    vocabId: number,
    tags: string,
  ) {
    clearErrors()

    try {
      const updatedVocab = await updateVocabDescription(
        vocabId,
        '',
        tags,
      )
      setVocabs((currentVocabs) =>
        currentVocabs.map((vocab) =>
          vocab.id === vocabId ? updatedVocab : vocab,
        ),
      )
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
      throw error
    }
  }

  async function handleUpdateVocabPublic(vocabId: number, isPublic: boolean) {
    clearErrors()

    try {
      const updatedVocab = await updateVocabPublic(vocabId, isPublic)
      setVocabs((currentVocabs) =>
        currentVocabs.map((vocab) =>
          vocab.id === vocabId ? updatedVocab : vocab,
        ),
      )
      setRequestError('')
    } catch (error) {
      setRequestError(getErrorMessage(error))
    }
  }

  async function handleOpenMyPage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearErrors()

    if (!myPagePassword) {
      setMyPagePasswordError('기존 비밀번호를 입력해 주세요.')
      return
    }

    setIsCheckingPassword(true)

    try {
      await login(username, myPagePassword)
      setMyPagePassword('')
      setMyPagePasswordError('')
      setIsPasswordModalOpen(false)
      onOpenMyPage()
    } catch {
      setMyPagePasswordError('기존 비밀번호가 올바르지 않습니다')
    } finally {
      setIsCheckingPassword(false)
    }
  }

  function handleClosePasswordModal() {
    setIsPasswordModalOpen(false)
    setMyPagePassword('')
    clearErrors()
  }

  const selectedVocab = vocabs.find((vocab) => vocab.id === selectedVocabId)
  const normalizedNameSearch = nameSearch.trim().toLowerCase()
  const normalizedTagSearch = tagSearch.trim().toLowerCase()
  const filteredVocabs = vocabs.filter((vocab) => {
    const matchesName =
      !normalizedNameSearch ||
      vocab.title.toLowerCase().includes(normalizedNameSearch)
    const matchesTag =
      !normalizedTagSearch ||
      (vocab.tags ?? '').toLowerCase().includes(normalizedTagSearch)

    return matchesName && matchesTag
  })
  const sortedVocabs = sortVocabs(filteredVocabs, sortMode)

  if (selectedVocab) {
    return (
      <VocabDetailPage
        vocab={selectedVocab}
        requestError={requestError}
        onBack={() => {
          setSelectedVocabId(null)
          clearErrors()
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
        onUpdateTags={(tags) =>
          handleUpdateVocabTags(selectedVocab.id, tags)
        }
        onClearRequestError={clearErrors}
        themeMode={themeMode}
      />
    )
  }

  return (
    <main className={`vocab-page${isBamtiMode ? ' bamti-page' : ''}`}>
      {isBamtiMode && <div className="bamti-noise" aria-hidden="true" />}
      <header className="vocab-header">
        <div>
          <p className="vocab-eyebrow">
            {isBamtiMode ? 'MY BAMTI VOCABULARY' : 'MY VOCABULARY'}
          </p>
          <div className={isBamtiMode ? 'bamti-title-row' : 'vocab-title-row'}>
            <h1>{isBamtiMode ? `${username}님의 밤티 단어장` : `${username}님의 단어장`}</h1>
            <Characters isBamtiMode={isBamtiMode} />
          </div>
        </div>
        <div className="vocab-header-actions">
          <div className="theme-mode-bubble" aria-label="화면 모드 변경 안내">
            <span className="theme-mode-bubble-arrow">↘</span>
            <strong>
              {isBamtiMode ? '기본 모드로 변경?' : '밤티 모드로 변경?'}
            </strong>
            <small>마이페이지에서 바꿀 수 있어요</small>
          </div>
          <button
            className="logout-button"
            type="button"
            onClick={() => {
              clearErrors()
              setIsPasswordModalOpen(true)
            }}
          >
            마이페이지
          </button>
          <button
            className="logout-button"
            type="button"
            onClick={() => {
              clearErrors()
              onOpenSharedPage()
            }}
          >
            공유 단어장
          </button>
          <button
            className="logout-button"
            type="button"
            onClick={() => {
              clearErrors()
              onLogout()
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <section className="vocab-toolbar">
        <form className="vocab-create-form" onSubmit={handleAddVocab}>
          {isBamtiMode && (
            <span className="bamti-form-label">새로운 밤티 생성</span>
          )}
          <input
            value={vocabTitle}
            onChange={(event) => {
              setVocabTitle(event.target.value)
              clearErrors()
            }}
            placeholder="새 단어장 이름"
          />
          <button type="submit">{isBamtiMode ? '뚝딱' : '추가'}</button>
        </form>

        <label className="sort-control">
          {isBamtiMode ? '밤티 줄세우기' : '정렬'}
          <select
            value={sortMode}
            onChange={(event) => {
              setSortMode(event.target.value as VocabSortMode)
              clearErrors()
            }}
          >
            <option value="latest">최신순</option>
            <option value="share-count">공유순</option>
            <option value="en-ko">영 - 한</option>
            <option value="ko-en">한 - 영</option>
          </select>
        </label>
      </section>

      {requestError && <p className="api-error">{requestError}</p>}

      {!isLoading && vocabs.length > 0 && (
        <section className="shared-search-controls">
          <label>
            이름으로 검색
            <input
              value={nameSearch}
              onChange={(event) => {
                setNameSearch(event.target.value)
                clearErrors()
              }}
              placeholder="단어장 이름"
            />
          </label>
          <label>
            태그로 검색
            <input
              value={tagSearch}
              onChange={(event) => {
                setTagSearch(event.target.value)
                clearErrors()
              }}
              placeholder="예: 토익, 중급"
            />
          </label>
        </section>
      )}

      {isLoading ? (
        <section className={`empty-vocab${isBamtiMode ? ' bamti-empty' : ''}`}>
          {isBamtiMode && <Characters isBamtiMode={isBamtiMode} />}
          <h2>{isBamtiMode ? '단어장을 덜그럭 불러오는 중입니다' : '단어장을 불러오는 중입니다'}</h2>
        </section>
      ) : vocabs.length === 0 ? (
        <section className={`empty-vocab${isBamtiMode ? ' bamti-empty' : ''}`}>
          {isBamtiMode && <Characters isBamtiMode={isBamtiMode} />}
          <h2>아직 단어장이 없습니다</h2>
          <p>{isBamtiMode ? '위 입력창에서 첫 번째 밤티를 만들어 보세요.' : '위 입력창에서 첫 번째 단어장을 만들어 보세요.'}</p>
        </section>
      ) : sortedVocabs.length === 0 ? (
        <section className={`empty-vocab${isBamtiMode ? ' bamti-empty' : ''}`}>
          {isBamtiMode && <Characters isBamtiMode={isBamtiMode} />}
          <h2>검색 결과가 없습니다</h2>
          <p>{isBamtiMode ? '이 밤티는 아직 발견되지 않았습니다.' : '다른 이름이나 태그로 검색해 보세요.'}</p>
        </section>
      ) : (
        <section className="vocab-grid">
          {sortedVocabs.map((vocab) => {
            const tags = (vocab.tags ?? '')
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)

            return (
              <article
                className={`vocab-card${isBamtiMode ? ' bamti-card' : ''}`}
                key={vocab.id}
              >
                {isBamtiMode && (
                  <span className="bamti-card-sticker">
                    밤티력 +{(vocab.words.length % 9) + 1}
                  </span>
                )}
                <h2>{vocab.title}</h2>
                {tags.length > 0 && (
                  <div className="vocab-tags">
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
                <p className="vocab-word-count">
                  {vocab.words.length}개 단어 · 공유 {getShareCount(vocab)}회

                </p>
                <div className="vocab-card-actions">
                  <button
                    className="open-vocab-button"
                    type="button"
                    onClick={() =>
                      handleUpdateVocabPublic(vocab.id, !vocab.is_public)
                    }
                  >
                    {vocab.is_public ? '공유 중' : '비공개'}
                  </button>
                  <button
                    className="open-vocab-button"
                    type="button"
                    onClick={() => {
                      clearErrors()
                      setSelectedVocabId(vocab.id)
                    }}
                  >
                    열기
                  </button>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => {
                      clearErrors()
                      handleDeleteVocab(vocab.id)
                    }}
                  >
                    삭제
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {isPasswordModalOpen && (
        <div className="password-modal-backdrop">
          <section className="password-modal" role="dialog" aria-modal="true">
            <h2>비밀번호 확인</h2>
            <form onSubmit={handleOpenMyPage}>
              <label>
                기존 비밀번호
                <input
                  type="password"
                  value={myPagePassword}
                  onChange={(event) => {
                    setMyPagePassword(event.target.value)
                    clearErrors()
                  }}
                  placeholder="기존 비밀번호를 입력하세요"
                  autoFocus
                />
              </label>

              {myPagePasswordError && (
                <p className="error-message">{myPagePasswordError}</p>
              )}

              <div className="password-modal-actions">
                <button
                  className="cancel-modal-button"
                  type="button"
                  onClick={handleClosePasswordModal}
                >
                  취소
                </button>
                <button type="submit" disabled={isCheckingPassword}>
                  확인
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default VocabListPage
