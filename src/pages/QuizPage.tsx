import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Vocab, WordEntry } from '../types/vocabulary'
import type { ThemeMode } from '../types/theme'
import Bam1 from '../assets/AlBam/Bam1.png'
import Bam2 from '../assets/AlBam/Bam2.png'
import Bam3 from '../assets/AlBam/Bam3.png'
import Bam4 from '../assets/AlBam/Bam4.png'

const bamtiWrongImages = [Bam1, Bam2, Bam3, Bam4]

type QuizPageProps = {
  vocab: Vocab
  words: WordEntry[]
  onBack: () => void
  onClearErrors: () => void
  themeMode: ThemeMode
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

function QuizPage({
  vocab,
  words,
  onBack,
  onClearErrors,
  themeMode,
}: QuizPageProps) {
  const isBamtiMode = themeMode === 'bamti'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isWrongAnswer, setIsWrongAnswer] = useState(false)
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false)
  const [wrongBurstKey, setWrongBurstKey] = useState(0)
  const [correctBurstKey, setCorrectBurstKey] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [answeredCount, setAnsweredCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const currentWord = words[currentIndex]
  const totalCount = words.length
  const hasExample = Boolean(currentWord?.examples?.trim())
  const progress =
    totalCount === 0 ? 0 : Math.round(((currentIndex + 1) / totalCount) * 100)
  const accuracy =
    answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100)
  const isLastWord = currentIndex === totalCount - 1

  function resetCard() {
    setAnswer('')
    setShowHint(false)
    setIsAnswered(false)
    setIsWrongAnswer(false)
    setIsCorrectAnswer(false)
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
      setIsWrongAnswer(false)
      setIsCorrectAnswer(true)
      setCorrectBurstKey((key) => key + 1)
    } else {
      setFeedback(`오답. 정답: ${currentWord.meaning}`)
      setIsWrongAnswer(true)
      setIsCorrectAnswer(false)
      setWrongBurstKey((key) => key + 1)
    }
    setIsAnswered(true)
  }

  function handleNext() {
    if (isLastWord) return
    onClearErrors()
    setCurrentIndex((index) => index + 1)
    resetCard()
  }

  function handleRestart() {
    onClearErrors()
    setCurrentIndex(0)
    setAnsweredCount(0)
    setCorrectCount(0)
    resetCard()
  }

  if (totalCount === 0) {
    return (
      <main className={`quiz-page${isBamtiMode ? ' bamti-page bamti-work-page' : ''}`}>
        {isBamtiMode && <div className="bamti-noise" aria-hidden="true" />}
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
    <main className={`quiz-page${isBamtiMode ? ' bamti-page bamti-work-page' : ''}`}>
      {isBamtiMode && <div className="bamti-noise" aria-hidden="true" />}
      {isBamtiMode && isWrongAnswer && (
        <div className="bamti-wrong-party" aria-hidden="true" key={wrongBurstKey}>
          {Array.from({ length: 20 }, (_, index) => (
            <img
              className="bamti-fall"
              src={bamtiWrongImages[index % bamtiWrongImages.length]}
              alt=""
              style={
                {
                  '--i': index,
                  '--spin': `${(index - 10) * 13}deg`,
                  '--reverse-spin': `${(index - 10) * -15}deg`,
                  '--drift-a': `${(index - 10) * 13}px`,
                  '--drift-b': `${(index - 10) * -9}px`,
                  '--drift-c': `${(index - 10) * 17}px`,
                  left: `${index * 5 + (index % 3) * 2}%`,
                } as CSSProperties
              }
              key={index}
            />
          ))}
        </div>
      )}
      {isBamtiMode && isCorrectAnswer && (
        <div
          className="bamti-correct-party"
          aria-hidden="true"
          key={correctBurstKey}
        >
          <strong className="bamti-fanfare-title">정 답</strong>
          {Array.from({ length: 28 }, (_, index) => (
            <span
              className="bamti-confetti"
              style={
                {
                  '--i': index,
                  '--angle': `${index * 13}deg`,
                  '--burst-x-small': `${((index % 7) - 3) * 19}px`,
                  '--burst-y-small': `${(Math.floor(index / 7) - 1.5) * 22}px`,
                  '--burst-x': `${((index % 7) - 3) * 54}px`,
                  '--burst-y': `${(Math.floor(index / 7) - 1.5) * 62}px`,
                  '--burst-x-big': `${((index % 7) - 3) * 73}px`,
                  '--burst-y-big': `${(Math.floor(index / 7) - 1.5) * 105 + 160}px`,
                } as CSSProperties
              }
              key={index}
            />
          ))}
        </div>
      )}
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
            {hasExample ? currentWord.examples : '등록된 예문이 없습니다.'}
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
