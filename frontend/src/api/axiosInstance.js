import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('srpe_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('srpe_token')
      localStorage.removeItem('srpe_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  }
)

export default axiosInstance