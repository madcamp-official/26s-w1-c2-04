import { useState } from 'react'
import { changePassword, deleteUser } from '../api/authApi'
import type { ThemeMode } from '../types/theme'

type MyPageProps = {
  userId: number
  username: string
  themeMode: ThemeMode
  onThemeModeChange: (themeMode: ThemeMode) => void
  onBack: () => void
  onDeleted: () => void
}

function MyPage({
  userId,
  username,
  themeMode,
  onThemeModeChange,
  onBack,
  onDeleted,
}: MyPageProps) {
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : '요청에 실패했습니다.'
  }

  function validatePasswords() {
    if (newPassword !== newPasswordConfirm) {
      setError('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    return true
  }

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!validatePasswords()) return

    setIsSubmitting(true)

    try {
      const response = await changePassword(
        userId,
        newPassword,
      )
      setMessage(response.message)
      setError('')
      setNewPassword('')
      setNewPasswordConfirm('')
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteAccount() {
    setMessage('')
    setError('')

    const shouldDelete = window.confirm(
      '회원 탈퇴를 진행할까요? 계정 정보가 삭제됩니다.',
    )

    if (!shouldDelete) return

    setIsSubmitting(true)

    try {
      await deleteUser(userId)
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

        <section className="theme-mode-panel" aria-label="화면 모드 선택">
          <span>화면 모드</span>
          <div className="theme-mode-actions">
            <button
              type="button"
              className={themeMode === 'default' ? 'active' : ''}
              onClick={() => onThemeModeChange('default')}
            >
              기본 모드
            </button>
            <button
              type="button"
              className={themeMode === 'bamti' ? 'active' : ''}
              onClick={() => onThemeModeChange('bamti')}
            >
              밤티 모드
            </button>
          </div>
        </section>

        <form className="mypage-form" onSubmit={handleChangePassword}>
          <label>
            새로운 비밀번호
            <input
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setError('')
              }}
              placeholder="새로운 비밀번호를 입력하세요"
            />
          </label>
          <label>
            새로운 비밀번호 확인
            <input
              type="password"
              value={newPasswordConfirm}
              onChange={(event) => {
                setNewPasswordConfirm(event.target.value)
                setError('')
              }}
              placeholder="새로운 비밀번호를 한 번 더 입력하세요"
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
