"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import Select, { SelectOption } from "@/components/ui/select"
import { userApi, paymentApi } from "@/lib/api-functions"
import { formatCurrency, formatDate, getUserStatusColor } from "@/lib/utils"
import { Payment, User } from "@/types"
import { toast } from "react-hot-toast"
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UserMinusIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline"

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

  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", searchQuery, statusFilter],
    queryFn: () =>
      userApi.getAllUsers({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      }),
  })

  const users = usersData?.users ?? []
  const totalUsers = usersData?.pagination.total ?? users.length

  const { data: userPayments } = useQuery({
    queryKey: ["user-payments", selectedUser?.id],
    queryFn: () => (selectedUser ? paymentApi.getUserPayments(selectedUser.id) : null),
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
    mutationFn: ({ userId, duration }: { userId: string; duration: number }) =>
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
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  return (
    <DashboardLayout>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-primary/80">Admin Control</p>
            <h1 className="text-3xl font-semibold text-foreground">All Users</h1>
            <p className="text-sm text-muted-foreground">Manage all registered users and their WiFi access.</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg transform scale-100 border border-blue-400/30">+ Add User</Button>
        </header>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>Combine search with status filters to refine results.</CardDescription>
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
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Users ({totalUsers})</CardTitle>
              <CardDescription className="pt-2">Manage user accounts and WiFi access</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="min-w-full overflow-x-auto">
              <div className="hidden min-w-full grid-cols-[0.5fr_1.5fr_1.2fr_1fr_1fr_0.8fr] gap-4 rounded-2xl bg-secondary/70 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                <span>ID</span>
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-card shadow-sm">
                {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading users...</div>}

                {!isLoading && users.length === 0 && (
                  <div className="p-12 text-center text-sm text-muted-foreground">No users found.</div>
                )}

                {users.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-1 gap-4 px-6 py-5 text-sm text-foreground transition hover:bg-primary/5 md:grid-cols-[0.5fr_1.5fr_1.2fr_1fr_1fr_0.8fr]"
                  >
                    <span className="font-medium text-muted-foreground">{u.id.slice(0, 6)}</span>
                    <span className="font-medium">{fullName(u)}</span>
                    <span className="truncate text-muted-foreground">{u.email}</span>
                    <span>{u.phone || "—"}</span>
                    <span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getUserStatusColor(u.status)}`}>
                        {u.status}
                      </span>
                    </span>
                    <div className="flex items-center justify-end gap-2 text-sm">
                      <Button variant="outline" size="sm" onClick={() => openUserModal(u)} className="gap-1">
                        <EyeIcon className="h-4 w-4" /> View
                      </Button>
                      {u.status === "inactive" ? (
                        <Button size="sm" onClick={() => handleUserStatusChange(u, "active")} className="gap-1">
                          <UserPlusIcon className="h-4 w-4" /> Activate
                        </Button>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleUserStatusChange(u, "inactive")} className="gap-1">
                          <UserMinusIcon className="h-4 w-4" /> Disable
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u)} className="text-destructive">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
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
            <label className="block text-sm font-medium text-muted-foreground">Duration (months)</label>
            <Select
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
    </DashboardLayout>
  )
}
