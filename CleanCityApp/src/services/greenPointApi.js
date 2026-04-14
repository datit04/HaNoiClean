import api from './api'

export const getMyGreenPoints = () => api.get('/greenpoints/my')
export const getGreenPointLeaderboard = (top = 5) => api.get('/greenpoints/leaderboard', { params: { top } })
