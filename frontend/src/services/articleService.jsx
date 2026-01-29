import { api } from './api'

export const articleService = {
  // Public endpoints
  async getPublishedArticles(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/blog/articles?${query}`, { skipAuth: true })
  },
  
  async getArticleBySlug(slug) {
    return api.get(`/blog/articles/${slug}`, { skipAuth: true })
  },
  
  // Admin endpoints
  async getAllArticles() {
    return api.get('/blog/admin/articles')
  },
  
  async createArticle(data) {
    return api.post('/blog/admin/articles', data)
  },
  
  async updateArticle(id, data) {
    return api.put(`/blog/admin/articles/${id}`, data)
  },
  
  async deleteArticle(id) {
    return api.delete(`/blog/admin/articles/${id}`)
  },
}