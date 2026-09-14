import api from './api'

/**
 * Lấy danh sách comments của 1 báo cáo
 * GET /api/reports/{reportId}/comments
 */
export const getComments = (reportId) =>
  api.get(`/reports/${reportId}/comments`)

/**
 * Lấy số lượng comments của 1 báo cáo
 * GET /api/reports/{reportId}/comments/count
 */
export const getCommentCount = (reportId) =>
  api.get(`/reports/${reportId}/comments/count`)

/**
 * Tạo comment mới (multipart/form-data)
 * POST /api/reports/{reportId}/comments
 */
export const createComment = (reportId, content, imageFile = null, parentCommentId = null) => {
  const formData = new FormData()
  formData.append('Content', content)
  if (imageFile) formData.append('Image', imageFile)
  if (parentCommentId != null) formData.append('ParentCommentId', parentCommentId)
  return api.post(`/reports/${reportId}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Cập nhật comment (multipart/form-data)
 * PUT /api/comments/{commentId}
 */
export const updateComment = (commentId, content, imageFile = null) => {
  const formData = new FormData()
  formData.append('Content', content)
  if (imageFile) formData.append('Image', imageFile)
  return api.put(`/comments/${commentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Xóa comment
 * DELETE /api/comments/{commentId}
 */
export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`)
