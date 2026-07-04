import { useState } from 'react'
import type { Vocab } from '../types/vocabulary'
import VocabDetailPage from './VocabDetailPage'

type VocabListPageProps = {
    username: string
    onLogout: () => void
}

function VocabListPage({ username, onLogout }: VocabListPageProps) {
    const [vocabTitle, setVocabTitle] = useState('')
    const [vocabs, setVocabs] = useState<Vocab[]>([])
    const [selectedVocabId, setSelectedVocabId] = useState<number | null>(null)

    function handleAddVocab(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const title = vocabTitle.trim()
        if (!title) return

        const newVocab = {
            id: Date.now(),
            title,
            words: [],
        }

        setVocabs((currentVocabs) => [...currentVocabs, newVocab])
        setVocabTitle('')
    }

    function handleDeleteVocab(id: number) {
        setVocabs((currentVocabs) =>
            currentVocabs.filter((vocab) => vocab.id !== id),
        )
    }

    function handleAddWord(vocabId: number, word: string, meaning: string) {
        setVocabs((currentVocabs) =>
            currentVocabs.map((vocab) =>
                vocab.id === vocabId
                    ? {
                        ...vocab,
                        words: [
                            ...vocab.words,
                            { id: Date.now(), word, meaning },
                        ],
                    }
                    : vocab,
            ),
        )
    }

    function handleUpdateWord(
        vocabId: number,
        wordId: number,
        word: string,
        meaning: string,
    ) {
        setVocabs((currentVocabs) =>
            currentVocabs.map((vocab) =>
                vocab.id === vocabId
                    ? {
                        ...vocab,
                        words: vocab.words.map((entry) =>
                            entry.id === wordId
                                ? { ...entry, word, meaning }
                                : entry,
                        ),
                    }
                    : vocab,
            ),
        )
    }

    function handleDeleteWords(vocabId: number, wordIds: number[]) {
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
    }

    const selectedVocab = vocabs.find((vocab) => vocab.id === selectedVocabId)

    if (selectedVocab) {
        return (
            <VocabDetailPage
                vocab={selectedVocab}
                onBack={() => setSelectedVocabId(null)}
                onAddWord={(word, meaning) =>
                    handleAddWord(selectedVocab.id, word, meaning)
                }
                onUpdateWord={(wordId, word, meaning) =>
                    handleUpdateWord(
                        selectedVocab.id,
                        wordId,
                        word,
                        meaning,
                    )
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

            {vocabs.length === 0 ? (
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
