import { apiRequest } from './client'

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
