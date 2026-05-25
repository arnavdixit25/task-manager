import api from './axios'

export const getTasks = (projectId, filters = {}) =>
  api.get('/tasks', { params: { projectId, ...filters } })

export const createTask = (data) => api.post('/tasks', data)
export const getTask = (id) => api.get(`/tasks/${id}`)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

export const updateTaskStatus = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status })

export const addComment = (taskId, data) =>
  api.post(`/tasks/${taskId}/comments`, data)

export const deleteComment = (taskId, commentId) =>
  api.delete(`/tasks/${taskId}/comments/${commentId}`)