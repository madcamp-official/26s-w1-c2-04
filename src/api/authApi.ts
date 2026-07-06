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

export type MessageResponse = {
  message: string
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
  return apiRequest<MessageResponse>('/logout/', {
    method: 'POST',
  })
}

export function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  return apiRequest<MessageResponse>(`/users/${userId}/password/`, {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
}

export function deleteUser(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  return apiRequest<MessageResponse>(`/users/${userId}/`, {
    method: 'DELETE',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
}
