import api from '@/lib/api'

// Auth API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
  }) => api.post('/auth/register', userData),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  logout: () => api.post('/auth/logout'),
}

// User API calls
export const userApi = {
  getProfile: () => {
    console.log('📊 API: Fetching user profile from /auth/profile')
    return api.get('/auth/profile')
  },
  updateProfile: (data: { name?: string; phone?: string; address?: string }) => {
    console.log('📊 API: Updating user profile:', data)
    return api.put('/auth/profile', data)
  },
  getAllUsers: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    paymentStatus?: string
  }) => {
    console.log('📊 API: Fetching users with params:', params)
    return api.get('/users', { params })
  },
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended') =>
    api.put(`/users/${id}/status`, { status }),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
}

// Payment API calls
export const paymentApi = {
  getPayments: (params?: {
    page?: number
    limit?: number
    userId?: string
    status?: string
    method?: string
  }) => {
    console.log('💳 API: Fetching payments with params:', params)
    return api.get('/payments', { params })
  },

  createPayment: (data: {
    amount: number
    duration: number
    method: 'qr' | 'upi'
    screenshot?: File
    upiNumber?: string
  }) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string | Blob)
      }
    })
    return api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  updatePaymentStatus: (id: string, status: 'approved' | 'rejected') =>
    api.put(`/payments/${id}/status`, { status }),

  getUserPayments: (userId: string) =>
    api.get(`/payments/user/${userId}`),

  getPaymentStats: () => api.get('/payments/stats'),
}

// Notification API calls
export const notificationApi = {
  getNotifications: (params?: {
    page?: number
    limit?: number
    read?: boolean
  }) => {
    // Check if user is admin from localStorage
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null

    console.log('🔔 API: Getting notifications for user:', user?.role)

    if (user?.role === 'admin') {
      // Admin can access all notifications
      console.log('🔔 API: Using admin notifications endpoint')
      return api.get('/notifications', { params })
    } else {
      // Regular users use the my-notifications endpoint
      console.log('🔔 API: Using user notifications endpoint')
      return api.get('/notifications/my-notifications', { params })
    }
  },

  markAsRead: (id: string) => api.post(`/notifications/${id}/mark-read`),

  markAllAsRead: () => api.post('/notifications/mark-all-read'),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
}

// Admin API calls
export const adminApi = {
  getDashboardStats: () => {
    console.log('📊 API: Fetching admin dashboard stats')
    return api.get('/users/dashboard-stats')
  },
  getPaymentStats: () => {
    console.log('📊 API: Fetching payment dashboard stats')
    return api.get('/payments/dashboard-stats')
  },
  updateQrCode: (qrCode: string) => api.put('/admin/qr-code', { qrCode }),
  updateUpiNumber: (upiNumber: string) => api.put('/admin/upi-number', { upiNumber }),
  getSettings: () => api.get('/admin/settings'),
}