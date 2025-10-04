'use client'

import { useState, useRef, ChangeEvent } from 'react'
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
  PencilIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'
import { AdminSettings } from '@/types' // Add this import

const profileSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits').required('Phone is required'),
  address: Yup.string().min(10, 'Address must be at least 10 characters').required('Address is required'),
})

const adminSettingsSchema = Yup.object({
  // qrCode is now a file, so we don't validate it as a string
  upiNumber: Yup.string().matches(/^[0-9]{10}@[a-zA-Z]+$/, 'Invalid UPI format (e.g., 9876543210@paytm)').required('UPI Number is required'),
})

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const updateQrCodeImageMutation = useMutation({
    mutationFn: (qrCodeImage: File) => adminApi.updateQrCodeImage(qrCodeImage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('QR Code updated successfully!')
      setQrCodeFile(null)
      setQrCodePreview(null)
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

  const profile = profileData?.user || user
  const settings: AdminSettings = adminSettings || { qrCodeUrl: '', upiNumber: '' }

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
      // qrCode is now handled as a file
      upiNumber: settings?.upiNumber || '',
    },
    validationSchema: adminSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Update UPI number
      await updateUpiNumberMutation.mutateAsync(values.upiNumber)

      // Update QR code image if a file was selected
      if (qrCodeFile) {
        await updateQrCodeImageMutation.mutateAsync(qrCodeFile)
      }

      setIsEditingSettings(false)
    },
  })

  const handleQrCodeFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrCodeFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
              Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your personal information and settings
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between flex-col sm:flex-row">
              <div className='w-full'>
                <CardTitle className="flex items-center text-foreground">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-muted-foreground pt-2">Update your personal details</CardDescription>
              </div>
              <div className='pt-4 sm:pt-0 w-full flex justify-end'>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Avatar */}
                <div className="md:col-span-2 flex items-center space-x-2 sm:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="h-10 sm:h-20 w-10 sm:w-20 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                      <span className="text-xs sm:text-2xl font-bold text-primary-foreground ">
                        {profile?.name ? (
                          profile.name === 'Aman Kumar' ? 'AK' : profile.name.charAt(0).toUpperCase()
                        ) : profile?.firstName && profile?.lastName ? (
                          `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
                        ) : (
                          'U'
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {profile?.name || (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : 'Unknown User')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile?.role} Account
                    </p>
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
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
                    className={`mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground ${!isEditing ? 'bg-muted/50' : ''} ${profileFormik.touched.name && profileFormik.errors.name ? 'border-destructive' : ''
                      }`}
                  />
                  {profileFormik.touched.name && profileFormik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{String(profileFormik.errors.name)}</p>
                  )}
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="mt-1 bg-muted/50 border-border text-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
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
                    className={`mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground ${!isEditing ? 'bg-muted/50' : ''} ${profileFormik.touched.phone && profileFormik.errors.phone ? 'border-destructive' : ''
                      }`}
                  />
                  {profileFormik.touched.phone && profileFormik.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{String(profileFormik.errors.phone)}</p>
                  )}
                </div>

                {/* Role Field (Read-only) */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-foreground">
                    Account Type
                  </label>
                  <Input
                    id="role"
                    name="role"
                    type="text"
                    value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
                    disabled
                    className="mt-1 bg-muted/50 border-border text-foreground capitalize"
                  />
                </div>

                {/* Address Field */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-foreground">
                    Address
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={profileFormik.values.address}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    disabled={!isEditing}
                    className={`mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground ${!isEditing ? 'bg-muted/50' : ''} ${profileFormik.touched.address && profileFormik.errors.address ? 'border-destructive' : ''
                      }`}
                  />
                  {profileFormik.touched.address && profileFormik.errors.address && (
                    <p className="mt-1 text-sm text-red-600">{profileFormik.errors.address as string}</p>
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
                    className="bg-background border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-foreground">
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription className="text-muted-foreground pt-2">Manage QR Code and UPI details for user payments</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingSettings(!isEditingSettings)}
                  className="bg-background border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {isEditingSettings ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={settingsFormik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <QrCodeIcon className="h-4 w-4 inline mr-1" />
                      QR Code Image
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleQrCodeFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={!isEditingSettings}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={triggerFileInput}
                        disabled={!isEditingSettings}
                        className="bg-background border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                        {qrCodeFile ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {qrCodeFile && (
                        <span className="ml-3 text-sm text-muted-foreground truncate max-w-xs">
                          {qrCodeFile.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      📱 Users will scan this QR code image to make payments
                    </p>

                    {/* QR Code Preview */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        QR Code Preview
                      </label>
                      <div className="border border-border rounded-lg p-4 bg-muted/20">
                        <div className="text-center">
                          {(qrCodePreview || settings?.qrCodeUrl) ? (
                            <div className="inline-flex items-center justify-center w-32 h-32 bg-background border border-border rounded-lg overflow-hidden">
                              <img
                                src={qrCodePreview || settings.qrCodeUrl}
                                alt="QR Code Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-32 h-32 bg-background border border-border rounded-lg">
                              <QrCodeIcon className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          <p className="mt-2 text-sm text-muted-foreground">
                            {qrCodePreview || settings?.qrCodeUrl ? 'Preview' : 'No QR code configured'}
                          </p>
                        </div>
                      </div>
                    </div>
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
                      className={`mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground ${!isEditingSettings ? 'bg-muted/50' : ''} ${settingsFormik.touched.upiNumber && settingsFormik.errors.upiNumber ? 'border-destructive' : ''
                        }`}
                    />
                    {settingsFormik.touched.upiNumber && settingsFormik.errors.upiNumber && (
                      <p className="mt-1 text-sm text-red-600">{String(settingsFormik.errors.upiNumber)}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      💳 Alternative payment method for users (UPI ID or Phone Number)
                    </p>
                  </div>
                </div>

                {isEditingSettings && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingSettings(false)
                        settingsFormik.resetForm()
                        setQrCodeFile(null)
                        setQrCodePreview(null)
                      }}
                      className="bg-background border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateQrCodeImageMutation.isPending || updateUpiNumberMutation.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {(updateQrCodeImageMutation.isPending || updateUpiNumberMutation.isPending) ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Account Information</CardTitle>
            <CardDescription className="text-muted-foreground">Read-only account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground">Member Since</label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Last Updated</label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Account Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${profile?.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {profile?.status || 'Unknown'}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">User ID</label>
                <p className="mt-1 text-sm text-muted-foreground font-mono">{profile?.id || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}