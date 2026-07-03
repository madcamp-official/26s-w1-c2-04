import { useState } from 'react'

type Vocab = {
    id: number
    title: string
}

type VocabListPageProps = {
    username: string
    onLogout: () => void
}

function VocabListPage({ username, onLogout }: VocabListPageProps) {
    const [vocabTitle, setVocabTitle] = useState('')
    const [vocabs, setVocabs] = useState<Vocab[]>([])

    function handleAddVocab(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const title = vocabTitle.trim()
        if (!title) return

        const newVocab = {
            id: Date.now(),
            title,
        }

        setVocabs((currentVocabs) => [...currentVocabs, newVocab])
        setVocabTitle('')
    }

    function handleDeleteVocab(id: number) {
        setVocabs((currentVocabs) =>
            currentVocabs.filter((vocab) => vocab.id !== id),
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
                    <span aria-hidden="true">A</span>
                    <h2>아직 단어장이 없습니다</h2>
                    <p>위 입력창에서 첫 번째 단어장을 만들어 보세요.</p>
                </section>
            ) : (
                <section className="vocab-grid">
                    {vocabs.map((vocab) => (
                        <article className="vocab-card" key={vocab.id}>

                            <h2>{vocab.title}</h2>
                            <button
                                className="delete-button"
                                type="button"
                                onClick={() => handleDeleteVocab(vocab.id)}
                            >
                                삭제
                            </button>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}

export default VocabListPage
