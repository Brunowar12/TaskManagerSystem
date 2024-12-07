import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = 'http://127.0.0.1:8000/auth/login/'

export interface LoginResponse {
  username: string
  email: string
  access: string
  refresh: string
}

export async function login(
  email: string,
  password: string
): Promise<Omit<LoginResponse, 'access' | 'refresh'>> {
  try {
    const response = await axios.post<LoginResponse>(API_URL, {
      email,
      password,
    })
    const { access, refresh, username, email: userEmail } = response.data

    // Сохраняем токены в куки
    Cookies.set('accessToken', access, { expires: 1 / 24 })
    Cookies.set('refreshToken', refresh, { expires: 7 })

    return { username, email: userEmail }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'An error occurred during login.'
    )
  }
}