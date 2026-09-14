import { useState, useEffect, useCallback } from 'react'
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../services/commentService'
import { parseApiError } from '../utils/apiError'

export function useComments(reportId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!reportId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getComments(reportId)
      setComments(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = useCallback(
    async (content, imageFile = null, parentCommentId = null) => {
      setSubmitting(true)
      try {
        const res = await createComment(reportId, content, imageFile, parentCommentId)
        const newComment = res.data
        setComments((prev) => [...prev, newComment])
        return { ok: true }
      } catch (err) {
        return { ok: false, message: parseApiError(err) }
      } finally {
        setSubmitting(false)
      }
    },
    [reportId]
  )

  const editComment = useCallback(async (commentId, content, imageFile = null) => {
    setSubmitting(true)
    try {
      const res = await updateComment(commentId, content, imageFile)
      const updated = res.data
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: parseApiError(err) }
    } finally {
      setSubmitting(false)
    }
  }, [])

  const removeComment = useCallback(async (commentId) => {
    try {
      await deleteComment(commentId)
      // Xóa luôn reply con nếu có
      setComments((prev) =>
        prev.filter((c) => c.id !== commentId && c.parentCommentId !== commentId)
      )
      return { ok: true }
    } catch (err) {
      return { ok: false, message: parseApiError(err) }
    }
  }, [])

  return {
    comments,
    loading,
    error,
    submitting,
    addComment,
    editComment,
    removeComment,
    refetch: fetchComments,
  }
}
