import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return { success: true };
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (resetToken, password, confirmPassword) => {
    return api.post('/auth/reset-password', {
      resetToken,
      password,
      confirmPassword
    });
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await api.post('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  addFavoritePet: async (petId) => {
    return api.post(`/users/favorites/${petId}`);
  },

  removeFavoritePet: async (petId) => {
    return api.delete(`/users/favorites/${petId}`);
  },

  getFavoritePets: async () => {
    return api.get('/users/favorites/list');
  }
};

export const petService = {
  getAllPets: async (page = 1, limit = 20) => {
    const response = await api.get(`/pets?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPetById: async (id) => {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },

  createPet: async (petData, images = []) => {
    const formData = new FormData();
    Object.keys(petData).forEach((key) => {
      formData.append(key, petData[key]);
    });
    images.forEach((image) => {
      formData.append('images', image);
    });
    const response = await api.post('/pets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updatePet: async (id, petData, images = []) => {
    const formData = new FormData();
    Object.keys(petData).forEach((key) => {
      formData.append(key, petData[key]);
    });
    images.forEach((image) => {
      formData.append('images', image);
    });
    const response = await api.put(`/pets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deletePet: async (id) => {
    return api.delete(`/pets/${id}`);
  },

  getPetsByCategory: async (category, page = 1) => {
    return api.get(`/pets/category/${category}?page=${page}`);
  },

  likePet: async (id) => {
    return api.post(`/pets/${id}/like`);
  },

  unlikePet: async (id) => {
    return api.delete(`/pets/${id}/like`);
  },

  searchPets: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get(`/pets/search?${params}`);
  }
};

export const articleService = {
  getAllArticles: async (page = 1) => {
    return api.get(`/articles?page=${page}`);
  },

  getArticleById: async (id) => {
    return api.get(`/articles/${id}`);
  },

  createArticle: async (articleData) => {
    return api.post('/articles', articleData);
  },

  updateArticle: async (id, articleData) => {
    return api.put(`/articles/${id}`, articleData);
  },

  deleteArticle: async (id) => {
    return api.delete(`/articles/${id}`);
  },

  likeArticle: async (id) => {
    return api.post(`/articles/${id}/like`);
  },

  searchArticles: async (query) => {
    return api.get(`/articles/search?q=${query}`);
  }
};

export const commentService = {
  getArticleComments: async (articleId, page = 1) => {
    return api.get(`/comments/article/${articleId}?page=${page}`);
  },

  createComment: async (articleId, content) => {
    return api.post('/comments', { articleId, content });
  },

  updateComment: async (id, content) => {
    return api.put(`/comments/${id}`, { content });
  },

  deleteComment: async (id) => {
    return api.delete(`/comments/${id}`);
  },

  likeComment: async (id) => {
    return api.post(`/comments/${id}/like`);
  },

  replyToComment: async (id, content) => {
    return api.post(`/comments/${id}/reply`, { content });
  }
};

export const appointmentService = {
  getUserAppointments: async (page = 1) => {
    return api.get(`/appointments?page=${page}`);
  },

  getAppointmentById: async (id) => {
    return api.get(`/appointments/${id}`);
  },

  createAppointment: async (appointmentData) => {
    return api.post('/appointments', appointmentData);
  },

  updateAppointment: async (id, data) => {
    return api.put(`/appointments/${id}`, data);
  },

  cancelAppointment: async (id) => {
    return api.delete(`/appointments/${id}`);
  },

  confirmAppointment: async (id) => {
    return api.post(`/appointments/${id}/confirm`);
  },

  completeAppointment: async (id, data) => {
    return api.post(`/appointments/${id}/complete`, data);
  }
};

export const adoptionService = {
  getUserAdoptionRequests: async (page = 1) => {
    return api.get(`/adoption-requests?page=${page}`);
  },

  getPetAdoptionRequests: async (petId, page = 1) => {
    return api.get(`/adoption-requests/pet/${petId}?page=${page}`);
  },

  getAdoptionRequestById: async (id) => {
    return api.get(`/adoption-requests/${id}`);
  },

  createAdoptionRequest: async (requestData) => {
    return api.post('/adoption-requests', requestData);
  },

  approveAdoptionRequest: async (id) => {
    return api.post(`/adoption-requests/${id}/approve`);
  },

  rejectAdoptionRequest: async (id, reason) => {
    return api.post(`/adoption-requests/${id}/reject`, {
      rejectionReason: reason
    });
  },

  cancelAdoptionRequest: async (id) => {
    return api.delete(`/adoption-requests/${id}`);
  }
};

export const vetService = {
  getAllVets: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, ...filters });
    return api.get(`/vets?${params}`);
  },

  getVetById: async (id) => {
    return api.get(`/vets/${id}`);
  },

  registerAsVet: async (vetData) => {
    return api.post('/vets', vetData);
  },

  updateVetProfile: async (data) => {
    return api.put('/vets', data);
  },

  deleteVetProfile: async () => {
    return api.delete('/vets');
  },

  searchVets: async (query, filters = {}) => {
    const params = new URLSearchParams({ query, ...filters });
    return api.get(`/vets/search?${params}`);
  },

  getNearbyVets: async (latitude, longitude, radius) => {
    return api.get(`/vets/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }
};

export const categoryService = {
  getAllCategories: async () => {
    return api.get('/categories');
  },

  getCategoryById: async (id) => {
    return api.get(`/categories/${id}`);
  },

  getCategoryBySlug: async (slug) => {
    return api.get(`/categories/slug/${slug}`);
  }
};
