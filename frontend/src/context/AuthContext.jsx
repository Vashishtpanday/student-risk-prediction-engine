import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('srpe_user')
      const storedToken = localStorage.getItem('srpe_token')
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    } catch (err) {
      localStorage.removeItem('srpe_user')
      localStorage.removeItem('srpe_token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('srpe_user', JSON.stringify(userData))
    localStorage.setItem('srpe_token', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('srpe_user')
    localStorage.removeItem('srpe_token')
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('srpe_user', JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}