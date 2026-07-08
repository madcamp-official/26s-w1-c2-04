import { useState } from 'react'
import VocabListPage from './pages/VocabListPage'
import MyPage from './pages/MyPage'
import { login, logout, signup } from './api/authApi'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [userId, setUserId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<'vocab' | 'mypage'>('vocab')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const trimmedUsername = username.trim()

    if (!trimmedUsername || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.')
      return
    }

    if (authMode === 'signup' && password !== passwordConfirm) {
      setError('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)

    try {
      if (authMode === 'signup') {
        await signup(trimmedUsername, password)
      }

      const user = await login(trimmedUsername, password)
      setUsername(user.username)
      setUserId(user.id)
      setCurrentPage('vocab')
      setPassword('')
      setPasswordConfirm('')
      setError('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : authMode === 'signup'
            ? '회원가입에 실패했습니다.'
            : '로그인에 실패했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } finally {
      setUserId(null)
      setCurrentPage('vocab')
      setPassword('')
      setPasswordConfirm('')
    }
  }

  function handleModeChange(nextMode: 'login' | 'signup') {
    setAuthMode(nextMode)
    setError('')
    setUsername('')
    setPassword('')
    setPasswordConfirm('')
  }

  if (userId !== null) {
    if (currentPage === 'mypage') {
      return (
        <MyPage
          userId={userId}
          username={username}
          onBack={() => setCurrentPage('vocab')}
          onDeleted={handleLogout}
        />
      )
    }

    return (
      <VocabListPage
        userId={userId}
        username={username}
        onLogout={handleLogout}
        onOpenMyPage={() => setCurrentPage('mypage')}
      />
    )
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>The Bamti</h1>
        <h1>Word Book</h1>
        <p>나만의 영어 단어장을 만들어 보세요.</p>

        <div className="auth-tabs" role="tablist" aria-label="인증 방식">
          <button
            type="button"
            className={authMode === 'login' ? 'active' : ''}
            onClick={() => handleModeChange('login')}
          >
            로그인
          </button>
          <button
            type="button"
            className={authMode === 'signup' ? 'active' : ''}
            onClick={() => handleModeChange('signup')}
          >
            회원가입
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            아이디
            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setError('')
              }}
              placeholder="아이디를 입력하세요"
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              placeholder="비밀번호를 입력하세요"
            />
          </label>

          {authMode === 'signup' && (
            <label>
              비밀번호 확인
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => {
                  setPasswordConfirm(event.target.value)
                  setError('')
                }}
                placeholder="비밀번호를 한 번 더 입력하세요"
              />
            </label>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? authMode === 'signup'
                ? '가입 중...'
                : '로그인 중...'
              : authMode === 'signup'
                ? '회원가입'
                : '로그인'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
