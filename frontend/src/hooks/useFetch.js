import { useState, useEffect, useCallback } from 'react'

const useFetch = (fetchFunction, immediate = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (immediate) execute()
  }, [])

  return { data, loading, error, execute, setData }
}

export default useFetch