import { useState } from 'react'// react 가져오기
import VocabListPage from './pages/VocabListPage' //성공시 보여줄 페이지
import { login, logout, signup } from './api/authApi' //API함수 가져오기-같은 큰 폴더 내 다른 파일
import './App.css'

function App() {
  // 상태 변수 설정하기
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [userId, setUserId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault() // 폼 제출 수 새로고침 방지

    const trimmedUsername = username.trim()

    if (!trimmedUsername || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.')
      return
    }//아이디 or 비번 공백 에러

    if (authMode === 'signup' && password !== passwordConfirm) {
      setError('비밀번호가 서로 일치하지 않습니다.')
      return
    } // 비번 불일치 에러

    setIsSubmitting(true)

    try {
      if (authMode === 'signup') {
        await signup(trimmedUsername, password)
      }

      const user = await login(trimmedUsername, password) //로그인 API호출
      setUsername(user.username) //로그인 성공 시 ID저장
      setUserId(user.id)
      setPassword('')
      setPasswordConfirm('')
      setError('') //다비우기
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : authMode === 'signup'
            ? '회원가입에 실패했습니다.'
            : '로그인에 실패했습니다.',
      )
    } finally {
      setIsSubmitting(false)//로딩 상태 해제
    }
  }

  async function handleLogout() { //로그아웃
    try {
      await logout()
    } finally {
      setUserId(null) //ID 초기화로 로그인화면으로 돌아가도록
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

  //화면만들기
  if (userId !== null) {  //로그인된 상태
    return (
      <VocabListPage //단어장 페이지 보여줌
        userId={userId}
        username={username}
        onLogout={handleLogout}
      />
    )
  }

  return ( //비로그인 상태라면 로그인/회원가입 화면 보여주기 
    <main className="login-page">
      <section className="login-card">
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
              onChange={(event) => setUsername(event.target.value)}
              placeholder="아이디를 입력하세요"
            />
          </label>

          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </label>

          {authMode === 'signup' && (
            <label>
              비밀번호 확인
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
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

export default App //다른 파일에서 사용가능하도록 내보내기
