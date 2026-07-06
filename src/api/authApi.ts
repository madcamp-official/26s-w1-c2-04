//API 폴더 내에 있는 파일들은 기능만 필요하고 실질적인 디스플레이는 없기에 ts이용
//display및 UI가 필요하면 html 혹은 tsx 이용
import { apiRequest } from './client'

//export: 타 파일로 함수나 타입 보내기 위함
export type LoginResponse = {
  id: number
  username: string
  message: string
}

export type SignupResponse = {
  id: number
  username: string
}

export function login(username: string, password: string) {
  // 이 요청의 결과값은 LoginResponse 
  return apiRequest<LoginResponse>('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function signup(username: string, password: string) {
  return apiRequest<SignupResponse>('/users/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return apiRequest<{ message: string }>('/logout/', {
    method: 'POST',
  })
}
