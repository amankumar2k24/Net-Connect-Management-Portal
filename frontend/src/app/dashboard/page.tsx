'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { useAuth } from '@/contexts/auth-context'
import AdminDashboard from '@/components/dashboard/admin-dashboard'
import UserDashboard from '@/components/dashboard/user-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      {user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </DashboardLayout>
  )
}