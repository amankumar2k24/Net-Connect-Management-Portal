import { AxiosResponse } from "axios"
import api from "@/lib/api"
import { unwrapResponse } from "@/lib/utils"
import {
  User,
  PaginatedUsers,
  PaginatedPayments,
  Payment,
  Notification,
  NotificationList,
  DashboardSnapshot,
  PaymentDashboardSnapshot,
  PaymentStatus,
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

  logout: () => Promise.resolve(),
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

  getUpcomingPayments: () =>
    resolve<{ upcomingPayments: Payment[] }>(api.get("/payments/upcoming")),

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

  deletePayment: (id: string) => resolve<{ message: string }>(api.delete(`/payments/${id}`)),

  getDashboardStats: () => resolve<PaymentDashboardSnapshot>(api.get("/payments/dashboard-stats")),
}

// Notification API calls
export const notificationApi = {
  getNotifications: (params?: {
    page?: number
    limit?: number
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
}

// Admin helpers
export const adminApi = {
  getDashboardStats: () => userApi.getDashboardStats(),
  getPaymentStats: () => paymentApi.getDashboardStats(),
  getSettings: () => Promise.resolve({ qrCodeUrl: "", upiNumber: "" }),
  updateQrCodeImage: (file: File) => uploadFile("/uploads/qr-code", file),
  updateUpiNumber: async (_upiNumber: string) => Promise.resolve({ message: "Not implemented" }),
}

