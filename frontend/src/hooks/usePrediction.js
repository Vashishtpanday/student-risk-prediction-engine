import { useState } from 'react'
import { predictStudent, batchPredict } from '../api/prediction.api'

const usePrediction = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const predict = async (studentData) => {
    try {
      setLoading(true)
      setError(null)
      const res = await predictStudent(studentData)
      setResult(res)
      return res
    } catch (err) {
      setError(err.message || 'Prediction failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const predictBatch = async (studentsArray) => {
    try {
      setLoading(true)
      setError(null)
      const res = await batchPredict(studentsArray)
      setResult(res)
      return res
    } catch (err) {
      setError(err.message || 'Batch prediction failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return { result, loading, error, predict, predictBatch, reset }
}

export default usePrediction