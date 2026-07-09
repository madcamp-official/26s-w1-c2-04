import { useEffect, useState } from 'react'
import { copySharedVocab, getSharedVocabs } from '../api/vocabularyApi'
import type { Vocab } from '../types/vocabulary'
import type { ThemeMode } from '../types/theme'
import { getShareCount, sortVocabs } from '../utils/sort'

type SharedVocabPageProps = {
  userId: number
  themeMode: ThemeMode
  onBack: () => void
}

function SharedVocabPage({
  userId,
  themeMode,
  onBack,
}: SharedVocabPageProps) {
  const isBamtiMode = themeMode === 'bamti'
  const [sharedVocabs, setSharedVocabs] = useState<Vocab[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [requestError, setRequestError] = useState('')
  const [copiedVocabIds, setCopiedVocabIds] = useState<number[]>([])
  const [nameSearch, setNameSearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadSharedVocabs() {
      try {
        const loadedVocabs = await getSharedVocabs(userId)
        if (!isCancelled) {
          setSharedVocabs(loadedVocabs)
          setRequestError('')
        }
      } catch (error) {
        if (!isCancelled) setRequestError(getErrorMessage(error))
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadSharedVocabs()

    return () => {
      isCancelled = true
    }
  }, [userId])

  function getErrorMessage(error: unknown) {
    return error instanceof Error
      ? error.message
      : '서버 요청에 실패했습니다.'
  }

  async function handleCopyVocab(vocabId: number) {
    setRequestError('')

    try {
      await copySharedVocab(vocabId, userId)
      setCopiedVocabIds((currentIds) => [...currentIds, vocabId])
      setSharedVocabs((currentVocabs) =>
        currentVocabs.map((vocab) =>
          vocab.id === vocabId
            ? { ...vocab, share_count: getShareCount(vocab) + 1 }
            : vocab,
        ),
      )
    } catch (error) {
      setRequestError(getErrorMessage(error))
    }
  }

  const normalizedNameSearch = nameSearch.trim().toLowerCase()
  const normalizedTagSearch = tagSearch.trim().toLowerCase()
  const filteredVocabs = sharedVocabs.filter((vocab) => {
    const matchesName =
      !normalizedNameSearch ||
      vocab.title.toLowerCase().includes(normalizedNameSearch)
    const matchesTag =
      !normalizedTagSearch ||
      (vocab.tags ?? '').toLowerCase().includes(normalizedTagSearch)

    return matchesName && matchesTag
  })
  const sortedVocabs = sortVocabs(filteredVocabs, 'share-count')

  return (
    <main className={`vocab-page${isBamtiMode ? ' bamti-page' : ''}`}>
      {isBamtiMode && <div className="bamti-noise" aria-hidden="true" />}
      <header className="vocab-header">
        <div>
          <p className="vocab-eyebrow">SHARED BAMTI VOCABULARY</p>
          <h1>{isBamtiMode ? '공유 밤티 단어장' : '공유 단어장'}</h1>
        </div>
        <div className="vocab-header-actions">
          <button className="logout-button" type="button" onClick={onBack}>
            내 단어장
          </button>
        </div>
      </header>

      {requestError && <p className="api-error">{requestError}</p>}

      {!isLoading && sharedVocabs.length > 0 && (
        <section className="shared-search-controls">
          <label>
            이름으로 검색
            <input
              value={nameSearch}
              onChange={(event) => setNameSearch(event.target.value)}
              placeholder="단어장 이름"
            />
          </label>
          <label>
            태그로 검색
            <input
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
              placeholder="예: 토익, 중급"
            />
          </label>
        </section>
      )}

      {isLoading ? (
        <section className={`empty-vocab${isBamtiMode ? ' bamti-empty' : ''}`}>
          <h2>{isBamtiMode ? '공유 밤티를 덜그럭 불러오는 중입니다' : '공유 단어장을 불러오는 중입니다'}</h2>
        </section>
      ) : sharedVocabs.length === 0 ? (
        <section className={`empty-vocab${isBamtiMode ? ' bamti-empty' : ''}`}>
          <h2>아직 공유된 단어장이 없습니다</h2>
          <p>{isBamtiMode ? '아직 길 잃은 밤티가 없습니다.' : '다른 사용자가 공개한 단어장이 여기에 표시됩니다.'}</p>
        </section>
      ) : sortedVocabs.length === 0 ? (
        <section className={`empty-vocab${isBamtiMode ? ' bamti-empty' : ''}`}>
          <h2>검색 결과가 없습니다</h2>
          <p>{isBamtiMode ? '이 밤티는 아직 발견되지 않았습니다.' : '다른 이름이나 태그로 검색해 보세요.'}</p>
        </section>
      ) : (
        <section className="vocab-grid">
          {sortedVocabs.map((vocab) => {
            const isCopied = copiedVocabIds.includes(vocab.id)
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
                    밤티력 +{(getShareCount(vocab) % 9) + 1}
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
                  {vocab.words.length}개 단어 · 공유 {getShareCount(vocab)}
                </p>
                <div className="vocab-card-actions">
                  <button
                    className="open-vocab-button"
                    type="button"
                    disabled={isCopied}
                    onClick={() => handleCopyVocab(vocab.id)}
                  >
                    {isCopied ? '가져옴' : '내 단어장으로 가져오기'}
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default SharedVocabPage
