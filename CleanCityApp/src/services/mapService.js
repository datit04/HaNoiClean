import api from './api'

/**
 * Fetch geo-coded report markers for the map
 * @param {{ wardId?: number, category?: string, status?: string }} filters
 */
export const getMapMarkers = (filters = {}) => api.get('/map/markers', { params: filters })

/**
 * Fetch heatmap data points
 */
export const getHeatmapData = () => api.get('/map/heatmap')
