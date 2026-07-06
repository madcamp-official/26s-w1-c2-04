//API 연결해주는 파일 (통신 담당)
//인증 추가하고 싶다면 이 파일 수정
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

//T는 타입을 저장하는 변수
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `요청에 실패했습니다. (${response.status})`

    try {
      const errorBody = (await response.json()) as { detail?: string }
      if (errorBody.detail) message = errorBody.detail
    } catch {
      // JSON 형식의 오류 응답이 아니면 기본 메시지를 사용합니다.
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}
