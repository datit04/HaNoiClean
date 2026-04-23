import api from './api'

export const getMyGreenPoints = (options = {}) => api.get('/greenpoints/my', options)
export const getGreenPointLeaderboard = (top = 5, options = {}) => api.get('/greenpoints/leaderboard', { params: { top }, ...options })
