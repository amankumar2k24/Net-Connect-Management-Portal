import { AxiosResponse } from "axios"
import api from "@/lib/api"
import { unwrapResponse } from "@/lib/utils"
import {
  User,
  PaginatedUsers,
  PaginatedPayments,
  Payment,
  Pagination,
  Notification,
  NotificationList,
  DashboardSnapshot,
  PaymentDashboardSnapshot,
  PaymentStatus,
  PaymentPlan,
} from "@/types"

type ApiPromise<T> = Promise<T>

const resolve = <T>(promise: Promise<AxiosResponse<any>>): ApiPromise<T> =>
  promise.then((response) => unwrapResponse<T>(response))

// Auth API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    resolve<{ token: string; user: User }>(api.post("/auth/login", credentials)),

  register: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
  }) => resolve<{ message: string }>(api.post("/auth/register", userData)),

  forgotPassword: (email: string) =>
    resolve<{ message: string }>(api.post("/auth/forgot-password", { email })),

  resetPassword: (data: { token: string; password: string }) =>
    resolve<{ message: string }>(api.post("/auth/reset-password", data)),

  verifyOtp: (data: { email: string; otp: string }) =>
    resolve<{ message: string }>(api.post("/auth/verify-otp", data)),

  resendOtp: (email: string) =>
    resolve<{ message: string }>(api.post("/auth/send-otp", { email })),

  logout: () => Promise.resolve({ message: 'Logged out successfully' }),
}

// User API calls
export const userApi = {
  getProfile: () => resolve<{ user: User }>(api.get("/auth/profile")),

  updateProfile: (payload: Partial<User>) =>
    resolve<{ user: User }>(api.put("/auth/profile", payload)),

  getAllUsers: (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }) => resolve<PaginatedUsers>(api.get("/users", { params })),

  createUser: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    role?: string
  }) => resolve<{ user: User }>(api.post("/users", userData)),

  getUserById: (id: string) => resolve<{ user: User }>(api.get(`/users/${id}`)),

  updateUserStatus: (id: string, status: User["status"]) =>
    resolve<{ user: User }>(api.patch(`/users/${id}/status`, { status })),

  deleteUser: (id: string) => resolve<{ message: string }>(api.delete(`/users/${id}`)),

  getDashboardStats: () => resolve<DashboardSnapshot>(api.get("/users/dashboard-stats")),
}

const uploadFile = async (path: string, file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  const result = await resolve<{ url: string }>(
    api.post(path, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  )
  return result.url
}

// Payment API calls
export const paymentApi = {
  getPayments: (params?: {
    page?: number
    limit?: number
    userId?: string
    status?: string
    method?: string
  }) => resolve<PaginatedPayments>(api.get("/payments", { params })),

  getMyPayments: (params?: { page?: number; limit?: number }) =>
    resolve<PaginatedPayments>(api.get("/payments/my-payments", { params })),

  getUpcomingPayments: (page: number = 1, limit: number = 10) =>
    resolve<{ upcomingPayments: Payment[]; pagination: Pagination }>(
      api.get("/payments/upcoming", { params: { page, limit } })
    ),

  getUserPayments: (userId: string, params?: { page?: number; limit?: number }) =>
    resolve<PaginatedPayments>(api.get("/payments", { params: { ...params, userId } })),

  createPayment: async (data: {
    amount: number
    durationMonths: number
    method: "qr_code" | "upi"
    screenshotFile?: File | null
    upiId?: string
    notes?: string
  }) => {
    const payload: Record<string, unknown> = {
      amount: data.amount,
      durationMonths: data.durationMonths,
      method: data.method,
      notes: data.notes,
      upiNumber: data.upiId,
    }

    if (data.screenshotFile) {
      payload.screenshotUrl = await uploadFile("/uploads/payment-screenshot", data.screenshotFile)
    }

    return resolve<{ payment: Payment }>(api.post("/payments", payload))
  },

  updatePaymentStatus: (id: string, status: PaymentStatus, options?: { notes?: string; reason?: string }) => {
    if (status === "approved") {
      return resolve<{ payment: Payment }>(api.post(`/payments/${id}/approve`, { notes: options?.notes }))
    }

    if (status === "rejected") {
      return resolve<{ payment: Payment }>(
        api.post(`/payments/${id}/reject`, {
          reason: options?.reason || "Rejected by admin",
          notes: options?.notes,
        }),
      )
    }

    // For pending status, we don't need to make an API call
    return Promise.reject(new Error("Cannot update payment status to pending"))
  },

  approvePayment: (id: string, notes?: string) =>
    resolve<{ payment: Payment }>(api.post(`/payments/${id}/approve`, { notes })),

  rejectPayment: (id: string, reason: string, notes?: string) =>
    resolve<{ payment: Payment }>(api.post(`/payments/${id}/reject`, { reason, notes })),

  deletePayment: (id: string) => resolve<{ message: string }>(api.delete(`/payments/${id}`)),

  getDashboardStats: () => resolve<PaymentDashboardSnapshot>(api.get("/payments/dashboard-stats")),
}

// Notification API calls
export const notificationApi = {
  getNotifications: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: "read" | "unread"
    userId?: string
  }) => {
    try {
      const raw = localStorage.getItem("user")
      const parsed = raw ? JSON.parse(raw) : null
      const isAdmin = parsed?.role === 'admin'
      const endpoint = isAdmin ? '/notifications' : '/notifications/my-notifications'
      return resolve<NotificationList>(api.get(endpoint, { params }))
    } catch {
      return resolve<NotificationList>(api.get('/notifications', { params }))
    }
  }, markAsRead: (id: string) => resolve<{ notification: Notification }>(api.post(`/notifications/${id}/mark-read`, {})),

  markAllAsRead: () => resolve<{ message: string }>(api.post("/notifications/mark-all-read", {})),

  deleteNotification: (id: string) => resolve<{ message: string }>(api.delete(`/notifications/${id}`)),

  createNotification: (data: { userId: string; title: string; message: string; type: string }) =>
    resolve<{ notification: Notification }>(api.post("/notifications", data)),

  createBulkNotification: (data: { userIds: string[]; title: string; message: string; type: string }) =>
    resolve<{ notifications: Notification[] }>(api.post("/notifications/bulk", data)),
}

// Payment Plans API calls
export const paymentPlansApi = {
  getAll: () => resolve<{ paymentPlans: PaymentPlan[] }>(api.get("/payment-plans")),

  getActive: () => resolve<{ paymentPlans: PaymentPlan[] }>(api.get("/payment-plans/active")),

  create: (data: {
    durationMonths: number
    durationLabel: string
    amount: number
    isActive?: boolean
    sortOrder?: number
  }) => {
    console.log('🔍 API Function - Sending data:', data);
    console.log('🔍 API Function - Data types:', {
      durationMonths: typeof data.durationMonths,
      amount: typeof data.amount,
      sortOrder: typeof data.sortOrder
    });
    return resolve<{ paymentPlan: PaymentPlan }>(api.post("/payment-plans", data));
  },

  update: (id: string, data: Partial<PaymentPlan>) => {
    console.log('🔍 Frontend API - Update Payment Plan ID:', id);
    console.log('🔍 Frontend API - Update Payment Plan Data:', data);
    console.log('🔍 Frontend API - Update Payment Plan Data Types:', {
      durationMonths: typeof data.durationMonths,
      amount: typeof data.amount,
      sortOrder: typeof data.sortOrder,
      isActive: typeof data.isActive
    });
    return resolve<{ paymentPlan: PaymentPlan }>(api.patch(`/payment-plans/${id}`, data));
  },

  delete: (id: string) => resolve<{ message: string }>(api.delete(`/payment-plans/${id}`)),

  getById: (id: string) => resolve<{ paymentPlan: PaymentPlan }>(api.get(`/payment-plans/${id}`)),

  reorder: (reorderData: { id: string; sortOrder: number }[]) =>
    resolve<{ paymentPlans: PaymentPlan[] }>(api.patch("/payment-plans/reorder", reorderData)),
}

// Admin helpers
export const adminApi = {
  getDashboardStats: () => userApi.getDashboardStats(),
  getPaymentStats: () => paymentApi.getDashboardStats(),
  getSettings: () => resolve<{ settings: { qrCodeUrl: string; upiNumber: string } }>(api.get("/admin/settings")),
  updateQrCodeImage: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return resolve<{ url: string; settings: { qrCodeUrl: string; upiNumber: string }; message: string }>(
      api.post("/admin/qr-code", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    )
  },
  updateUpiNumber: (upiNumber: string) =>
    resolve<{ settings: { qrCodeUrl: string; upiNumber: string }; message: string }>(
      api.put("/admin/settings", { upiNumber })
    ),
}

