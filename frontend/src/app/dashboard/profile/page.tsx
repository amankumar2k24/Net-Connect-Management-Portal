'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { userApi, adminApi } from '@/lib/api-functions'
import { toast } from 'react-hot-toast'
import {
  UserIcon,
  CreditCardIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

const profileSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits').required('Phone is required'),
  address: Yup.string().min(10, 'Address must be at least 10 characters').required('Address is required'),
})

const adminSettingsSchema = Yup.object({
  qrCode: Yup.string().required('QR Code is required'),
  upiNumber: Yup.string().matches(/^[0-9]{10}@[a-zA-Z]+$/, 'Invalid UPI format (e.g., 9876543210@paytm)').required('UPI Number is required'),
})

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)

  const queryClient = useQueryClient()

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile(),
  })

  const { data: adminSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
    enabled: user?.role === 'admin',
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; phone?: string; address?: string }) =>
      userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const updateQrCodeMutation = useMutation({
    mutationFn: (qrCode: string) => adminApi.updateQrCode(qrCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('QR Code updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update QR Code')
    },
  })

  const updateUpiNumberMutation = useMutation({
    mutationFn: (upiNumber: string) => adminApi.updateUpiNumber(upiNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('UPI Number updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update UPI Number')
    },
  })

  const profile = profileData?.data?.data || user
  const settings = adminSettings?.data?.data || {}

  const profileFormik = useFormik({
    initialValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      updateProfileMutation.mutate(values)
    },
  })

  const settingsFormik = useFormik({
    initialValues: {
      qrCode: settings?.qrCode || '',
      upiNumber: settings?.upiNumber || '',
    },
    validationSchema: adminSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Update both settings
      await updateQrCodeMutation.mutateAsync(values.qrCode)
      await updateUpiNumberMutation.mutateAsync(values.upiNumber)
      setIsEditingSettings(false)
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Profile
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your personal information and settings
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Avatar */}
                <div className="md:col-span-2 flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {profile?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{profile?.name}</h3>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {profile?.role} Account
                    </p>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={profileFormik.values.name}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    disabled={!isEditing}
                    className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''} ${profileFormik.touched.name && profileFormik.errors.name ? 'border-red-500' : ''
                      }`}
                  />
                  {profileFormik.touched.name && profileFormik.errors.name && (
                    <p className="mt-1 text-sm text-destructive">{String(profileFormik.errors.name)}</p>
                  )}
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileFormik.values.phone}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    disabled={!isEditing}
                    className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''} ${profileFormik.touched.phone && profileFormik.errors.phone ? 'border-red-500' : ''
                      }`}
                  />
                  {profileFormik.touched.phone && profileFormik.errors.phone && (
                    <p className="mt-1 text-sm text-destructive">{String(profileFormik.errors.phone)}</p>
                  )}
                </div>

                {/* Role Field (Read-only) */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <Input
                    id="role"
                    name="role"
                    type="text"
                    value={profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || ''}
                    disabled
                    className="mt-1 bg-gray-50 capitalize"
                  />
                </div>

                {/* Address Field */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={profileFormik.values.address}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    disabled={!isEditing}
                    className={`mt-1 ${!isEditing ? 'bg-gray-50' : ''} ${profileFormik.touched.address && profileFormik.errors.address ? 'border-red-500' : ''
                      }`}
                  />
                  {profileFormik.touched.address && profileFormik.errors.address && (
                    <p className="mt-1 text-sm text-destructive">{profileFormik.errors.address as string}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      profileFormik.resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Admin Settings */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>Manage QR Code and UPI details for user payments</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingSettings(!isEditingSettings)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {isEditingSettings ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={settingsFormik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code Field */}
                  <div>
                    <label htmlFor="qrCode" className="block text-sm font-medium text-foreground">
                      <QrCodeIcon className="h-4 w-4 inline mr-1" />
                      QR Code Image URL
                    </label>
                    <Textarea
                      id="qrCode"
                      name="qrCode"
                      placeholder="Enter QR code image URL (e.g., https://example.com/qr-image.png)"
                      value={settingsFormik.values.qrCode}
                      onChange={settingsFormik.handleChange}
                      onBlur={settingsFormik.handleBlur}
                      disabled={!isEditingSettings}
                      className={`mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground ${!isEditingSettings ? 'bg-muted/50' : ''} ${settingsFormik.touched.qrCode && settingsFormik.errors.qrCode ? 'border-destructive' : ''
                        }`}
                    />
                    {settingsFormik.touched.qrCode && settingsFormik.errors.qrCode && (
                      <p className="mt-1 text-sm text-destructive">{String(settingsFormik.errors.qrCode)}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      📱 Users will scan this QR code image to make payments
                    </p>
                  </div>

                  {/* UPI Number Field */}
                  <div>
                    <label htmlFor="upiNumber" className="block text-sm font-medium text-foreground">
                      <DevicePhoneMobileIcon className="h-4 w-4 inline mr-1" />
                      UPI ID / Phone Number
                    </label>
                    <Input
                      id="upiNumber"
                      name="upiNumber"
                      type="text"
                      placeholder="e.g., 9876543210@paytm or yourname@upi"
                      value={settingsFormik.values.upiNumber}
                      onChange={settingsFormik.handleChange}
                      onBlur={settingsFormik.handleBlur}
                      disabled={!isEditingSettings}
                      className={`mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground ${!isEditingSettings ? 'bg-muted/50' : ''} ${settingsFormik.touched.upiNumber && settingsFormik.errors.upiNumber ? 'border-destructive' : ''
                        }`}
                    />
                    {settingsFormik.touched.upiNumber && settingsFormik.errors.upiNumber && (
                      <p className="mt-1 text-sm text-destructive">{String(settingsFormik.errors.upiNumber)}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      💳 Alternative payment method for users (UPI ID or Phone Number)
                    </p>
                  </div>
                </div>

                {/* Current QR Code Preview */}
                {settings?.qrCode && !isEditingSettings && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current QR Code Preview
                    </label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                          <QrCodeIcon className="h-16 w-16 text-gray-400" />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">QR Code configured</p>
                      </div>
                    </div>
                  </div>
                )}

                {isEditingSettings && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingSettings(false)
                        settingsFormik.resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateQrCodeMutation.isPending || updateUpiNumberMutation.isPending}
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {(updateQrCodeMutation.isPending || updateUpiNumberMutation.isPending) ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Read-only account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {profile?.status || 'Unknown'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{profile?.id || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}