export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  isEmailVerified: boolean
  fullName?: string
  profileImage?: string
  qrCodeUrl?: string
  upiId?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedUsers {
  users: User[]
  pagination: Pagination
}

export type PaymentMethod = 'qr_code' | 'upi'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export interface Payment {
  id: string
  userId: string
  amount: number
  durationMonths: number
  method: PaymentMethod
  status: PaymentStatus
  screenshotUrl?: string
  upiNumber?: string
  notes?: string
  rejectionReason?: string
  approvedAt?: string
  approvedBy?: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  // Adding missing properties that are used in the frontend
  activationDate?: string
  expiryDate?: string
  screenshot?: string
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
}

export interface PaginatedPayments {
  payments: Payment[]
  pagination: Pagination
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'payment_reminder' | 'payment_approved' | 'payment_rejected' | 'account_status' | 'system'
  status: 'read' | 'unread'
  metadata?: Record<string, unknown>
  readAt?: string
  createdAt: string
}

export interface NotificationList {
  notifications: Notification[]
  pagination: Pagination
}

export interface DashboardSnapshot {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  recentUsers: User[]
}

export interface PaymentDashboardSnapshot {
  totalPayments: number
  pendingPayments: number
  approvedPayments: number
  rejectedPayments: number
  totalRevenue: number
  recentPayments: Payment[]
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
  durationMonths: number
  method: PaymentMethod
  screenshotFile?: File | null
  upiId?: string
  notes?: string
}

