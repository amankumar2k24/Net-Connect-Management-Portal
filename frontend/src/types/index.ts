export interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  amount: number
  duration: number // in months
  method: 'qr' | 'upi'
  status: 'pending' | 'approved' | 'rejected'
  screenshot?: string
  upiNumber?: string
  activationDate?: string
  expiryDate?: string
  user?: User
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'payment_reminder' | 'payment_approved' | 'payment_rejected' | 'account_status' | 'system'
  status: 'read' | 'unread'
  metadata?: any
  readAt?: string
  createdAt: string
  // Compatibility getter for old 'read' boolean field
  read?: boolean
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalPayments: number
  pendingPayments: number
  monthlyRevenue: number
  newUsersThisMonth: number
}

export interface PaymentStats {
  totalAmount: number
  totalCount: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  forceLogout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

export interface PaymentFormData {
  amount: number
  duration: number
  method: 'qr' | 'upi'
  screenshot?: File
  upiNumber?: string
}