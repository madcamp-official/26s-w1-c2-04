import { apiRequest } from './client'

export type LoginResponse = {
  id: number
  username: string
  message: string
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return apiRequest<{ message: string }>('/logout/', {
    method: 'POST',
  })
}
