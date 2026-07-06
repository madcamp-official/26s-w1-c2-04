import { useState } from 'react'
import { changePassword, deleteUser } from '../api/authApi'

type MyPageProps = {
  userId: number
  username: string
  onBack: () => void
  onDeleted: () => void
}

function MyPage({ userId, username, onBack, onDeleted }: MyPageProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : '요청에 실패했습니다.'
  }

  function validatePasswords() {
    if (!currentPassword || !newPassword) {
      setError('기존 비밀번호와 새로운 비밀번호를 모두 입력해 주세요.')
      return false
    }

    return true
  }

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setMessage('')

    if (!validatePasswords()) return

    setIsSubmitting(true)

    try {
      const response = await changePassword(
        userId,
        currentPassword,
        newPassword,
      )
      setMessage(response.message)
      setError('')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteAccount() {
    setMessage('')

    if (!validatePasswords()) return

    setIsSubmitting(true)

    try {
      await deleteUser(userId, currentPassword, newPassword)
      onDeleted()
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mypage-page">
      <section className="mypage-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="back-button" type="button" onClick={onBack}>
                단어장으로 돌아가기
            </button>
        </div>
        <p className="vocab-eyebrow">MY PAGE</p>
        <h1>{username}님의 회원정보</h1>

        <form className="mypage-form" onSubmit={handleChangePassword}>
          <label>
            기존 비밀번호
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="기존 비밀번호를 입력하세요"
            />
          </label>
          <label>
            새로운 비밀번호
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="새로운 비밀번호를 입력하세요"
            />
          </label>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          <div className="mypage-actions">
            <button type="submit" disabled={isSubmitting}>
              비밀번호 수정
            </button>
            <button
              className="danger-button"
              type="button"
              disabled={isSubmitting}
              onClick={handleDeleteAccount}
            >
              회원 탈퇴
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default MyPage
