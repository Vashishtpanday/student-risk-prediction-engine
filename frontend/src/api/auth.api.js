import axiosInstance from './axiosInstance'

export async function loginUser(email, password, role) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  const cleanPassword = String(password || '').trim()

  let userRole = String(role || '').trim().toLowerCase()

  if (!userRole || userRole === 'undefined' || userRole === 'null' || userRole === '') {
    if (cleanEmail.includes('faculty')) userRole = 'faculty'
    else if (cleanEmail.includes('admin')) userRole = 'admin'
    else userRole = 'student'
  }

  const payload = {
    email: cleanEmail,
    password: cleanPassword,
    role: userRole,
  }

  console.log('🚀 Sending Login Payload to Backend:', payload)

  const response = await axiosInstance.post('/auth/login', payload)
  const data = response.data || response

  const userObj = data.user || data.data?.user || data.data
  const tokenStr = data.token || data.data?.token

  return {
    user: userObj,
    token: tokenStr,
  }
}

export async function registerUser(userData) {
  const response = await axiosInstance.post('/auth/register', userData)
  return response.data || response
}

export async function getCurrentUser() {
  const response = await axiosInstance.get('/auth/me')
  return response.data || response
}

export async function logoutUser() {
  try {
    await axiosInstance.post('/auth/logout')
  } catch (e) {
    console.error('Logout error:', e)
  }
  localStorage.removeItem('srpe_token')
  localStorage.removeItem('srpe_user')
}