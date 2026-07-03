import { useState } from 'react'
import VocabListPage from './pages/VocabListPage'
import './App.css'

function App() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.')
      return
    }

    setError('')
    setIsLoggedIn(true)
  }
  if (isLoggedIn) {
    return (
      <VocabListPage
        username={username}
        onLogout={() => setIsLoggedIn(false)}
      />
    )
  }
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Word Book</h1>
        <p>나만의 영어 단어장을 만들어 보세요.</p>

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
          {error && <p className="error-message">{error}</p>}
          <button type="submit">로그인</button>
        </form>
      </section>
    </main>
  )
}

export default App
