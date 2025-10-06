'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ClockIcon,
    CogIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface ContactQuery {
    id: number
    fullName: string
    email: string
    phone?: string
    subject: string
    message: string
    company?: string
    status: 'pending' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    adminNotes?: string
    assignedToUserId?: number
    resolvedAt?: string
    createdAt: string
    updatedAt: string
}

interface ContactQueryStats {
    total: number
    pending: number
    inProgress: number
    resolved: number
    closed: number
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
}

export default function ContactQueriesPage() {
    const { user } = useAuth()
    const [queries, setQueries] = useState<ContactQuery[]>([])
    const [stats, setStats] = useState<ContactQueryStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Form state for editing
    const [editForm, setEditForm] = useState({
        status: '',
        priority: '',
        adminNotes: '',
        assignedToUserId: ''
    })

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchQueries()
            fetchStats()
        }
    }, [user, currentPage, statusFilter])

    const fetchQueries = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10'
            })

            if (statusFilter) {
                params.append('status', statusFilter)
            }

            const response = await api.get(`/contact-queries?${params}`)
            setQueries(response.data.queries)
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error('Failed to fetch contact queries:', error)
            toast.error('Failed to load contact queries')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await api.get('/contact-queries/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const handleViewQuery = (query: ContactQuery) => {
        setSelectedQuery(query)
        setIsViewModalOpen(true)
    }

    const handleEditQuery = (query: ContactQuery) => {
        setSelectedQuery(query)
        setEditForm({
            status: query.status,
            priority: query.priority,
            adminNotes: query.adminNotes || '',
            assignedToUserId: query.assignedToUserId?.toString() || ''
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateQuery = async () => {
        if (!selectedQuery) return

        try {
            const updateData: any = {
                status: editForm.status,
                priority: editForm.priority,
                adminNotes: editForm.adminNotes || undefined
            }

            if (editForm.assignedToUserId) {
                updateData.assignedToUserId = parseInt(editForm.assignedToUserId)
            }

            await api.patch(`/contact-queries/${selectedQuery.id}`, updateData)
            toast.success('Contact query updated successfully')
            setIsEditModalOpen(false)
            fetchQueries()
            fetchStats()
        } catch (error) {
            console.error('Failed to update contact query:', error)
            toast.error('Failed to update contact query')
        }
    }

    const handleDeleteQuery = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contact query?')) return

        try {
            await api.delete(`/contact-queries/${id}`)
            toast.success('Contact query deleted successfully')
            fetchQueries()
            fetchStats()
        } catch (error) {
            console.error('Failed to delete contact query:', error)
            toast.error('Failed to delete contact query')
        }
    }

    const filteredQueries = queries.filter(query =>
        query.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (user?.role !== 'admin') {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">You don't have permission to view this page.</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Contact Queries</h1>
                        <p className="text-muted-foreground">Manage customer inquiries and support requests</p>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Total Queries - Blue */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.total}</div>
                                    <div className="text-blue-100 text-sm font-medium">Total Queries</div>
                                </div>
                                <div className="bg-white/20 rounded-full p-3">
                                    <EnvelopeIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <EnvelopeIcon className="h-20 w-20" />
                            </div>
                        </div>

                        {/* Pending - Orange */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.pending}</div>
                                    <div className="text-orange-100 text-sm font-medium">Pending</div>
                                </div>
                                <div className="bg-white/20 rounded-full p-3">
                                    <ClockIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <ClockIcon className="h-20 w-20" />
                            </div>
                        </div>

                        {/* In Progress - Purple */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.inProgress}</div>
                                    <div className="text-purple-100 text-sm font-medium">In Progress</div>
                                </div>
                                <div className="bg-white/20 rounded-full p-3">
                                    <CogIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <CogIcon className="h-20 w-20" />
                            </div>
                        </div>

                        {/* Resolved - Green */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.resolved}</div>
                                    <div className="text-green-100 text-sm font-medium">Resolved</div>
                                </div>
                                <div className="bg-white/20 rounded-full p-3">
                                    <CheckIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <CheckIcon className="h-20 w-20" />
                            </div>
                        </div>

                        {/* Closed - Gray */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.closed}</div>
                                    <div className="text-gray-100 text-sm font-medium">Closed</div>
                                </div>
                                <div className="bg-white/20 rounded-full p-3">
                                    <XMarkIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <XMarkIcon className="h-20 w-20" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search queries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        placeholder="Filter by status"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </Select>
                </div>

                {/* Queries Table */}
                <div className="card-enhanced rounded-lg border border-border overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-2">Loading queries...</p>
                        </div>
                    ) : filteredQueries.length === 0 ? (
                        <div className="p-8 text-center">
                            <EnvelopeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No contact queries found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredQueries.map((query) => (
                                        <tr key={query.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-foreground">{query.fullName}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                                                        {query.email}
                                                    </div>
                                                    {query.phone && (
                                                        <div className="text-sm text-muted-foreground flex items-center">
                                                            <PhoneIcon className="h-3 w-3 mr-1" />
                                                            {query.phone}
                                                        </div>
                                                    )}
                                                    {query.company && (
                                                        <div className="text-sm text-muted-foreground flex items-center">
                                                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                                            {query.company}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{query.subject}</div>
                                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                    {query.message}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[query.status]}`}>
                                                    {query.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[query.priority]}`}>
                                                    {query.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-foreground flex items-center">
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    {new Date(query.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(query.createdAt).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewQuery(query)}
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditQuery(query)}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteQuery(query.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {/* View Modal */}
                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title="Contact Query Details"
                >
                    {selectedQuery && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                                    <p className="text-sm text-muted-foreground">{selectedQuery.fullName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                                    <p className="text-sm text-muted-foreground">{selectedQuery.email}</p>
                                </div>
                            </div>

                            {selectedQuery.phone && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                                    <p className="text-sm text-muted-foreground">{selectedQuery.phone}</p>
                                </div>
                            )}

                            {selectedQuery.company && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                                    <p className="text-sm text-muted-foreground">{selectedQuery.company}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                                <p className="text-sm text-muted-foreground">{selectedQuery.subject}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedQuery.message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedQuery.status]}`}>
                                        {selectedQuery.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[selectedQuery.priority]}`}>
                                        {selectedQuery.priority}
                                    </span>
                                </div>
                            </div>

                            {selectedQuery.adminNotes && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Admin Notes</label>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedQuery.adminNotes}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Submitted</label>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(selectedQuery.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Edit Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Update Contact Query"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                                <Select
                                    value={editForm.status}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                                <Select
                                    value={editForm.priority}
                                    onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Admin Notes</label>
                            <Textarea
                                value={editForm.adminNotes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                                placeholder="Add internal notes..."
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateQuery}>
                                Update Query
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    )
}