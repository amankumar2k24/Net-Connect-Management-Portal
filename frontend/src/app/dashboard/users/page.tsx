"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import Select, { SelectOption } from "@/components/ui/select"
import { userApi, paymentApi } from "@/lib/api-functions"
import { formatCurrency, formatDate, getUserStatusColor } from "@/lib/utils"
import { User } from "@/types"
import { toast } from "react-hot-toast"
import * as Yup from 'yup'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UserMinusIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline"
import { MorphingShapesLoader } from "@/components/ui/unique-loader"

const statusOptions: SelectOption[] = [
  { label: "All Status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
]

const paymentStatusOptions: SelectOption[] = [
  { label: "All Payment Status", value: "" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
]

const userValidationSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  phone: Yup.string().test('phone-validation', 'Phone number must be exactly 10 digits', function (value) {
    if (!value || value === '') return true; // Allow empty phone
    return /^[0-9]{10}$/.test(value);
  }),
  role: Yup.string().oneOf(['user', 'admin'], 'Invalid role').required('Role is required'),
})

const fullName = (u: User | null | undefined) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "Unknown user"

export default function AllUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [userToActivate, setUserToActivate] = useState<User | null>(null)
  const [activationDuration, setActivationDuration] = useState(3)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user' as 'user' | 'admin'
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isValidating, setIsValidating] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", searchQuery, statusFilter, currentPage, pageSize],
    queryFn: () =>
      userApi.getAllUsers({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      }),
  })

  const users = usersData?.users ?? []
  const totalUsers = usersData?.pagination?.total ?? users.length

  const { data: userPayments } = useQuery({
    queryKey: ["user-payments", selectedUser?.id],
    queryFn: () => (selectedUser ? paymentApi.getMyPayments() : null),
    enabled: Boolean(selectedUser?.id),
  })

  const paymentsForSelectedUser = userPayments?.payments ?? []

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: User["status"] }) =>
      userApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user status")
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User deleted successfully")
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user")
    },
  })

  const activateUserMutation = useMutation({
    mutationFn: ({ duration }: { userId: string; duration: number }) =>
      paymentApi.createPayment({
        amount: duration * 500,
        durationMonths: duration,
        method: "qr_code",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Activation initiated successfully")
      setIsActivationModalOpen(false)
      setUserToActivate(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to activate user")
    },
  })

  const createUserMutation = useMutation({
    mutationFn: (userData: typeof newUserData) =>
      userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User created successfully")
      setIsAddUserModalOpen(false)
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'user'
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create user")
    },
  })

  const handleUserStatusChange = (user: User, status: User["status"]) => {
    updateUserStatusMutation.mutate({ userId: user.id, status })
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id)
    }
  }

  const handleActivateUser = (user: User) => {
    setUserToActivate(user)
    setIsActivationModalOpen(true)
  }

  const confirmActivation = () => {
    if (userToActivate) {
      activateUserMutation.mutate({ userId: userToActivate.id, duration: activationDuration })
    }
  }

  const openUserModal = (user: User) => {
    console.log('Opening user modal for:', user.email)
    console.log('Current modal state before:', isUserModalOpen)
    setSelectedUser(user)
    setIsUserModalOpen(true)
    console.log('Modal state set to true')

    // Force a re-render to debug
    setTimeout(() => {
      console.log('Modal state after timeout:', isUserModalOpen)
    }, 100)
  }

  const handleAddUser = () => {
    // Reset form when opening modal
    setNewUserData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'user'
    })
    setFormErrors({})
    setIsAddUserModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false)
    setFormErrors({})
    setNewUserData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'user'
    })
  }

  const validateField = async (fieldName: string, value: any) => {
    try {
      await userValidationSchema.validateAt(fieldName, { ...newUserData, [fieldName]: value })
      setFormErrors(prev => ({ ...prev, [fieldName]: '' }))
      return true
    } catch (error: any) {
      setFormErrors(prev => ({ ...prev, [fieldName]: error.message }))
      return false
    }
  }

  const validateForm = async () => {
    try {
      await userValidationSchema.validate(newUserData, { abortEarly: false })
      setFormErrors({})
      return true
    } catch (error: any) {
      const errors: { [key: string]: string } = {}
      error.inner.forEach((err: any) => {
        if (err.path) {
          errors[err.path] = err.message
        }
      })
      setFormErrors(errors)
      return false
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewUserData({ ...newUserData, [field]: value })
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleInputBlur = (field: string, value: string) => {
    validateField(field, value)
  }

  const handleCreateUser = async () => {
    setIsValidating(true)
    const isValid = await validateForm()
    setIsValidating(false)

    if (isValid) {
      createUserMutation.mutate(newUserData)
    }
  }

  const toggleDropdown = (userId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    setOpenDropdownId(openDropdownId === userId ? null : userId)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Don't close if clicking on the dropdown button or dropdown content
      if (!target.closest('[data-dropdown]')) {
        setOpenDropdownId(null)
      }
    }

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdownId])

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    if (usersData?.pagination && currentPage < usersData.pagination.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <DashboardLayout>
        <section className="space-y-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-primary/80">Admin Control</p>
              <h1 className="text-3xl font-semibold text-foreground">All Users</h1>
              <p className="text-sm text-muted-foreground">Manage all registered users and their WiFi access.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log('Test modal button clicked')
                  setSelectedUser(users[0])
                  setIsUserModalOpen(true)
                }}
                variant="outline"
                className="text-xs"
              >
                Test Modal
              </Button>
              <Button
                onClick={handleAddUser}
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-400/30 gap-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </header>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-primary" />
                Search & Filters
              </CardTitle>
              <CardDescription>Find users by name, email, or filter by status and role.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Payment Status</label>
                <Select value={paymentStatusFilter} onChange={setPaymentStatusFilter} options={paymentStatusOptions} />
              </div>
            </CardContent>
            {(searchQuery || statusFilter || paymentStatusFilter) && (
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("")
                    setPaymentStatusFilter("")
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </CardContent>
            )}
          </Card>

          <Card className="card-enhanced">
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Users
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {totalUsers}
                  </span>
                </CardTitle>
                <CardDescription className="pt-2">Manage user accounts and WiFi access</CardDescription>
              </div>
              {!isLoading && users.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                </div>
              )}
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="min-w-full overflow-x-auto">
                <div className="hidden min-w-full grid-cols-[0.4fr_0.8fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.6fr] gap-4 rounded-2xl bg-secondary/70 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                  <span>S No</span>
                  <span>User ID</span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Phone</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-sm">
                  {isLoading && <MorphingShapesLoader message="Loading users data..." />}

                  {!isLoading && users.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="text-muted-foreground text-sm mb-2">No users found</div>
                      <div className="text-xs text-muted-foreground/60">Try adjusting your search filters</div>
                    </div>
                  )}

                  {users.map((u, index) => (
                    <div
                      key={u.id}
                      className="grid grid-cols-1 gap-4 px-6 py-5 text-sm text-foreground transition hover:bg-primary/5 md:grid-cols-[0.4fr_0.8fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.6fr]"
                    >
                      {/* S No Column */}
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {((currentPage - 1) * pageSize) + index + 1}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-muted-foreground">#{u.id.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground/60">{u.id.slice(-4)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{fullName(u)}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.isEmailVerified ? "✅ Verified" : "⚠️ Unverified"}
                        </span>
                      </div>
                      <span className="truncate text-muted-foreground">{u.email}</span>
                      <span className="text-muted-foreground">{u.phone || "—"}</span>
                      <span>
                        <span className={`capitalize inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${u.role === 'admin'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          }`}>
                          {u.role}
                        </span>
                      </span>
                      <span>
                        <span className={`inline-flex capitalize items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getUserStatusColor(u.status)}`}>
                          {u.status}
                        </span>
                      </span>
                      <div className="flex items-center justify-end">
                        <div className="relative" data-dropdown>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => toggleDropdown(u.id, e)}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors opacity-50 hover:opacity-100 cursor-pointer"
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </Button>

                          {openDropdownId === u.id && (
                            <div
                              className="absolute right-0 top-8 z-50 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 py-1 animate-in fade-in-0 zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  openUserModal(u)
                                  setOpenDropdownId(null)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                              >
                                <EyeIcon className="h-3 w-3 text-blue-500" />
                                <span>View</span>
                              </button>

                              {u.status === "inactive" ? (
                                <button
                                  onClick={() => {
                                    handleUserStatusChange(u, "active")
                                    setOpenDropdownId(null)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                  <UserPlusIcon className="h-3 w-3 text-green-500" />
                                  <span>Enable</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleUserStatusChange(u, "inactive")
                                    setOpenDropdownId(null)
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                  <UserMinusIcon className="h-3 w-3 text-orange-500" />
                                  <span>Disable</span>
                                </button>
                              )}

                              <div className="mx-2 my-0.5 h-px bg-gray-200 dark:bg-gray-600"></div>

                              <button
                                onClick={() => {
                                  handleDeleteUser(u)
                                  setOpenDropdownId(null)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                              >
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            {!isLoading && users.length > 0 && usersData?.pagination && usersData.pagination.totalPages > 1 && (
              <CardContent className="pt-0">
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Page {currentPage} of {usersData.pagination.totalPages}</span>
                    <span className="text-muted-foreground/60">•</span>
                    <span>{totalUsers} total users</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage <= 1}
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!usersData?.pagination || currentPage >= usersData.pagination.totalPages}
                      className="text-xs px-3 py-1.5 h-auto"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="User Details" size="lg">
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Profile</h3>
                  <dl className="space-y-2 rounded-xl border border-border/70 bg-card p-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Name</dt>
                      <dd className="text-sm font-medium text-foreground">{fullName(selectedUser)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Email</dt>
                      <dd className="text-sm text-foreground">{selectedUser.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Phone</dt>
                      <dd className="text-sm text-foreground">{selectedUser.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Status</dt>
                      <dd>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getUserStatusColor(selectedUser.status)}`}>
                          {selectedUser.status}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">Recent Payments</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto rounded-xl border border-border/70 bg-card p-4">
                    {paymentsForSelectedUser.length === 0 && (
                      <p className="text-sm text-muted-foreground">No payment history available.</p>
                    )}
                    {paymentsForSelectedUser.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${payment.status === "approved"
                          ? "bg-green-500/15 text-green-400"
                          : payment.status === "pending"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-red-500/15 text-red-400"
                          }`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User" size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Confirm deletion</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete {fullName(userToDelete)} and related data.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteUserMutation.isPending}>
                {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isActivationModalOpen} onClose={() => setIsActivationModalOpen(false)} title="Activate WiFi" size="sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Activate WiFi for {fullName(userToActivate)}</h3>
              <p className="text-sm text-muted-foreground">Select the duration for this activation request.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Duration (months)</label>
              <Select
                variant="modal"
                value={String(activationDuration)}
                onChange={(value) => setActivationDuration(Number(value))}
                options={[
                  { label: "1 Month", value: "1" },
                  { label: "3 Months", value: "3" },
                  { label: "6 Months", value: "6" },
                  { label: "12 Months", value: "12" },
                ]}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsActivationModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmActivation} disabled={activateUserMutation.isPending} className="gap-2">
                <CreditCardIcon className="h-4 w-4" />
                {activateUserMutation.isPending ? "Processing..." : "Activate WiFi"}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isAddUserModalOpen} onClose={handleCloseModal} title="Add New User" size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                <Input
                  variant="modal"
                  value={newUserData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  onBlur={(e) => handleInputBlur('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={formErrors.firstName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{formErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                <Input
                  variant="modal"
                  value={newUserData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  onBlur={(e) => handleInputBlur('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={formErrors.lastName ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <Input
                variant="modal"
                type="email"
                value={newUserData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={(e) => handleInputBlur('email', e.target.value)}
                placeholder="Enter email address"
                className={formErrors.email ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500 font-medium">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
              <Input
                variant="modal"
                type="password"
                value={newUserData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={(e) => handleInputBlur('password', e.target.value)}
                placeholder="Enter password"
                className={formErrors.password ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500 font-medium">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <Input
                variant="modal"
                value={newUserData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={(e) => handleInputBlur('phone', e.target.value)}
                placeholder="Enter 10-digit phone number"
                className={formErrors.phone ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20' : ''}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500 font-medium">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
              <Select
                value={newUserData.role}
                onChange={(value) => setNewUserData({ ...newUserData, role: value as 'user' | 'admin' })}
                options={[
                  { label: "User", value: "user" },
                  { label: "Admin", value: "admin" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </>
  )
}
