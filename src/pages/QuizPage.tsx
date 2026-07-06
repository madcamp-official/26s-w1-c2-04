import { useState } from 'react'
import type { Vocab, WordEntry } from '../types/vocabulary'

type QuizPageProps = {
  vocab: Vocab
  words: WordEntry[]
  onBack: () => void
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

function QuizPage({ vocab, words, onBack }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const currentWord = words[currentIndex]
  const totalCount = words.length
  const progress =
    totalCount === 0 ? 0 : Math.round(((currentIndex + 1) / totalCount) * 100)
  const accuracy =
    answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100)
  const isLastWord = currentIndex === totalCount - 1

  function resetCard() {
    setAnswer('')
    setShowHint(false)
    setIsAnswered(false)
    setFeedback('')
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentWord || isAnswered) return

    const isCorrect =
      normalizeAnswer(answer) === normalizeAnswer(currentWord.meaning)

    setAnsweredCount((count) => count + 1)
    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      setFeedback('정답!')
    } else {
      setFeedback(`오답. 정답: ${currentWord.meaning}`)
    }
    setIsAnswered(true)
  }

  function handleNext() {
    if (isLastWord) return
    setCurrentIndex((index) => index + 1)
    resetCard()
  }

  function handleRestart() {
    setCurrentIndex(0)
    setAnsweredCount(0)
    setCorrectCount(0)
    resetCard()
  }

  if (totalCount === 0) {
    return (
      <main className="quiz-page">
        <header className="quiz-header">
          <button className="back-button" type="button" onClick={onBack}>
            단어장으로
          </button>
          <div>
            <p className="vocab-eyebrow">QUIZ</p>
            <h1>{vocab.title}</h1>
          </div>
        </header>
        <section className="empty-words">
          <h2>퀴즈를 만들 단어가 없습니다</h2>
        </section>
      </main>
    )
  }

  return (
    <main className="quiz-page">
      <header className="quiz-header">
        <button className="back-button" type="button" onClick={onBack}>
          단어장으로
        </button>
        <div>
          <p className="vocab-eyebrow">QUIZ</p>
          <h1>{vocab.title}</h1>
        </div>
        <span className="word-count">
          {currentIndex + 1}/{totalCount}
        </span>
      </header>

      <section className="quiz-stats">
        <div>
          <span>진도율</span>
          <strong>{progress}%</strong>
        </div>
        <div>
          <span>정답률</span>
          <strong>{accuracy}%</strong>
        </div>
      </section>

      <section className="flashcard">
        <p>WORD</p>
        <h2>{currentWord.word}</h2>
        {showHint && (
          <div className="flashcard-hint">
            {currentWord.examples || '등록된 예문이 없습니다.'}
          </div>
        )}
      </section>

      <form className="quiz-answer-form" onSubmit={handleSubmit}>
        <label>
          답
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="뜻을 입력하세요"
            disabled={isAnswered}
            autoFocus
          />
        </label>

        <div className="quiz-actions">
          <button
            className="hint-button"
            type="button"
            onClick={() => setShowHint(true)}
            disabled={!currentWord.examples}
          >
            예문 힌트
          </button>
          <button type="submit" disabled={!answer.trim() || isAnswered}>
            답 제출
          </button>
        </div>
      </form>

      {feedback && <p className="quiz-feedback">{feedback}</p>}

      {isAnswered && (
        <div className="quiz-next-actions">
          {isLastWord ? (
            <button type="button" onClick={handleRestart}>
              다시 풀기
            </button>
          ) : (
            <button type="button" onClick={handleNext}>
              다음 문제
            </button>
          )}
        </div>
      )}
    </main>
  )
}

export default QuizPage
