import api from './api'

// Lấy thống kê tổng hợp báo cáo theo trạng thái
// GET /api/reports/stats
export const getReportStats = (params = {}) => api.get('/reports/stats', { params })

// ─── ReportStatus enum (phải khớp với BE) ─────────────────────────────────
// 0 = Submitted | 1 = Received | 2 = InProgress | 3 = Completed
export const ReportStatus = {
  Submitted: 0,
  Received: 1,
  InProgress: 2,
  Completed: 3,
  Rejected: 4,
}

// Map int → key dùng trong FE component
export const statusToKey = (statusInt) => {
  const map = { 0: 'submitted', 1: 'received', 2: 'processing', 3: 'done', 4: 'rejected' }
  return map[statusInt] ?? 'submitted'
}

// ─── Priority enum ─────────────────────────────────────────────────────────
// Backend: 1 = Urgent | 2 = Medium | 3 = Normal
export const ReportPriority = { High: 1, Medium: 2, Low: 3 }

export const priorityToKey = (priorityInt) => {
  const map = { 1: 'urgent', 2: 'medium', 3: 'low' }
  return map[priorityInt] ?? 'medium'
}

const buildReportTitle = (report) => {
  const description = report.description?.trim()

  if (description) {
    return description.length > 72 ? `${description.slice(0, 72).trim()}...` : description
  }

  return report.category?.name || 'Bao cao moi truong'
}

export const normalizeReport = (report) => ({
  ...report,
  title: buildReportTitle(report),
  statusKey: statusToKey(report.status),
  priorityKey: priorityToKey(report.priority),
  imageUrl: report.imageUrl || null,
  location: report.ward?.name || 'Ha Noi',
  categoryName: report.category?.name || 'Chua phan loai',
  completedAt: report.completedAt
    ? new Date(report.completedAt).toLocaleDateString('vi-VN')
    : null,
})

// ─── API calls ─────────────────────────────────────────────────────────────

/**
 * GET /api/reports
 * @param {{ wardId?: number, categoryId?: number, status?: number, priority?: number, pageIndex?: number, pageSize?: number }} params
 * @returns Promise<{ items: Report[], totalRecords: number }>
 */
export const getReports = (params = {}, options = {}) => api.get('/reports', { params, ...options })

/**
 * GET /api/reports/my — báo cáo của người dùng hiện tại
 */
export const getMyReports = () => api.get('/reports/my')

/**
 * GET /api/reports/:id
 */
export const getReportById = (id) => api.get(`/reports/${id}`)

/**
 * GET /api/reports/:id/progress
 */
export const getReportProgress = (id) => api.get(`/reports/${id}/progress`)

export const getCategories = (options = {}) => api.get('/categories', options)

export const createCategory = (data) =>
  api.post('/categories', {
    name: data.name?.trim() || '',
    icon: data.icon?.trim() || null,
    color: data.color?.trim() || null,
    isActive: Boolean(data.isActive),
  })

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, {
    name: data.name?.trim() || '',
    icon: data.icon?.trim() || null,
    color: data.color?.trim() || null,
    isActive: Boolean(data.isActive),
  })

export const deleteCategory = (id) => api.delete(`/categories/${id}`)

/**
 * GET /api/categories/statistics
 * @param {{ fromDate?: string, toDate?: string, wardId?: number, categoryId?: number, status?: number }} params
 */
export const getCategoryStatistics = (params = {}) =>
  api.get('/categories/statistics', { params })

/**
 * GET /api/reports/topward
 * @param {{ top?: number, fromDate?: string, toDate?: string }} params
 */
export const getTopWards = (params = {}) =>
  api.get('/reports/topward', { params })

/**
 * GET /api/reports/weekly-stats
 * @param {{ status?: number, wardId?: number, categoryId?: number }} params
 */
export const getWeeklyStats = (params = {}) =>
  api.get('/reports/weekly-stats', { params })

// ─── Teams ─────────────────────────────────────────────────────────────────
export const getTeams = (params = {}) => api.get('/teams', { params })
export const getTeamById = (id) => api.get(`/teams/${id}`)
export const createTeam = (data) => api.post('/teams', data)
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data)
export const deleteTeam = (id) => api.delete(`/teams/${id}`)

export const getWards = () => api.get('/wards')

/**
 * POST /api/reports — tạo báo cáo mới (multipart/form-data)
 * @param {{ description: string, image?: File | null, latitude?: number, longitude?: number, wardId: number, categoryId: number, priority?: number }} data
 */
export const createReport = (data) => {
  const formData = new FormData()
  formData.append('description', data.description?.trim() || '')
  formData.append('latitude', Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : 0)
  formData.append('longitude', Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : 0)
  formData.append('wardId', Number(data.wardId))
  formData.append('categoryId', Number(data.categoryId))
  formData.append('priority', Number(data.priority || ReportPriority.Medium))
  if (data.image) {
    formData.append('image', data.image)
  }
  return api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * POST /api/reports/:id/status — cập nhật trạng thái (multipart/form-data)
 * @param {number} id
 * @param {{ status: number, note?: string, imageAfter?: File | null }} data
 */
export const updateReportStatus = (id, data) => {
  const formData = new FormData()
  formData.append('status', data.status)
  if (data.note) formData.append('note', data.note)
  if (data.imageAfter) formData.append('imageAfter', data.imageAfter)
  return api.post(`/reports/${id}/status`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * POST /api/reports/:id/assign — giao đội xử lý (cán bộ)
 * @param {number} id
 * @param {{ teamId: number }} data
 */
export const assignTeam = (id, data) => api.post(`/reports/${id}/assign`, data)

/**
 * DELETE /api/reports/:id
 */
export const deleteReport = (id) => api.delete(`/reports/${id}`)

/**
 * POST /api/upload — upload image file, returns URL
 * @param {File} file
 * @returns Promise<string> imageUrl
 */
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // BE trả về { url: '...' } hoặc string trực tiếp
  return typeof res.data === 'string' ? res.data : res.data?.url || res.data?.imageUrl || ''
}
