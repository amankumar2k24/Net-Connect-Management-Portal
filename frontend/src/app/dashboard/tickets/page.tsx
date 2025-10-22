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
    PlusIcon,
    TicketIcon,
    ClockIcon,
    CogIcon,
    CheckIcon,
    XMarkIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Ticket {
    id: string
    title: string
    description: string
    category: 'technical' | 'billing' | 'general' | 'complaint'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    userId: string
    assignedToId?: string
    adminResponse?: string
    resolvedAt?: string
    createdAt: string
    updatedAt: string
    user?: {
        id: string
        name: string
        email: string
    }
    assignedTo?: {
        id: string
        name: string
        email: string
    }
}

interface TicketStats {
    total: number
    open: number
    inProgress: number
    resolved: number
    closed: number
}

const statusColors = {
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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

export default function TicketsPage() {
    const { user } = useAuth()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [stats, setStats] = useState<TicketStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Form state for creating tickets
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        category: 'technical',
        priority: 'medium'
    })

    // Form state for editing tickets (admin only)
    const [editForm, setEditForm] = useState({
        status: '',
        priority: '',
        adminResponse: '',
        assignedToId: ''
    })

    useEffect(() => {
        fetchTickets()
        if (user?.role === 'admin') {
            fetchStats()
        }
    }, [user, currentPage, statusFilter])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10'
            })

            if (statusFilter) {
                params.append('status', statusFilter)
            }

            const endpoint = user?.role === 'admin' ? '/tickets' : '/tickets/my-tickets'
            const response = await api.get(`${endpoint}?${params}`)
            setTickets(response.data.tickets)
            setTotalPages(response.data.totalPages)
        } catch (error) {
            console.error('Failed to fetch tickets:', error)
            toast.error('Failed to load tickets')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await api.get('/tickets/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsViewModalOpen(true)
    }

    const handleEditTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setEditForm({
            status: ticket.status,
            priority: ticket.priority,
            adminResponse: ticket.adminResponse || '',
            assignedToId: ticket.assignedToId || ''
        })
        setIsEditModalOpen(true)
    }

    const handleCreateTicket = async () => {
        try {
            await api.post('/tickets', createForm)
            toast.success('Ticket created successfully')
            setIsCreateModalOpen(false)
            setCreateForm({
                title: '',
                description: '',
                category: 'technical',
                priority: 'medium'
            })
            fetchTickets()
            if (user?.role === 'admin') {
                fetchStats()
            }
        } catch (error) {
            console.error('Failed to create ticket:', error)
            toast.error('Failed to create ticket')
        }
    }

    const handleUpdateTicket = async () => {
        if (!selectedTicket) return

        try {
            const updateData: any = {
                status: editForm.status,
                priority: editForm.priority,
                adminResponse: editForm.adminResponse || undefined
            }

            if (editForm.assignedToId) {
                updateData.assignedToId = editForm.assignedToId
            }

            await api.patch(`/tickets/${selectedTicket.id}`, updateData)
            toast.success('Ticket updated successfully')
            setIsEditModalOpen(false)
            fetchTickets()
            if (user?.role === 'admin') {
                fetchStats()
            }
        } catch (error) {
            console.error('Failed to update ticket:', error)
            toast.error('Failed to update ticket')
        }
    }

    const handleDeleteTicket = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ticket?')) return

        try {
            await api.delete(`/tickets/${id}`)
            toast.success('Ticket deleted successfully')
            fetchTickets()
            if (user?.role === 'admin') {
                fetchStats()
            }
        } catch (error) {
            console.error('Failed to delete ticket:', error)
            toast.error('Failed to delete ticket')
        }
    }

    const filteredTickets = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
                        <p className="text-muted-foreground">
                            {user?.role === 'admin'
                                ? 'Manage all support tickets and customer requests'
                                : 'Create and track your support requests'
                            }
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        New Ticket
                    </Button>
                </div>

                {/* Stats Cards - Admin Only */}
                {user?.role === 'admin' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Total Tickets - Blue */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.total}</div>
                                    <div className="text-blue-100 text-sm font-medium">Total Tickets</div>
                                </div>
                                <div className="bg-white/20 rounded-full p-3">
                                    <TicketIcon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-20">
                                <TicketIcon className="h-20 w-20" />
                            </div>
                        </div>

                        {/* Open - Orange */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold mb-1">{stats.open}</div>
                                    <div className="text-orange-100 text-sm font-medium">Open</div>
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
                            placeholder="Search tickets..."
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
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </Select>
                </div>

                {/* Tickets Table */}
                <div className="card-enhanced rounded-lg border border-border overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-2">Loading tickets...</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="p-8 text-center">
                            <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No tickets found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Ticket
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Category
                                        </th>
                                        {user?.role === 'admin' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                User
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-foreground">{ticket.title}</div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {ticket.description}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        #{ticket.id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status]}`}>
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[ticket.priority]}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-foreground flex items-center">
                                                    <TagIcon className="h-3 w-3 mr-1" />
                                                    {ticket.category}
                                                </div>
                                            </td>
                                            {user?.role === 'admin' && (
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-foreground flex items-center">
                                                        <UserIcon className="h-3 w-3 mr-1" />
                                                        {ticket.user?.name || ticket.user?.email || 'Unknown'}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-foreground flex items-center">
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(ticket.createdAt).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewTicket(ticket)}
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    {user?.role === 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditTicket(ticket)}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteTicket(ticket.id)}
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
                    title="Ticket Details"
                >
                    {selectedTicket && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                                    <p className="text-sm text-muted-foreground">{selectedTicket.title}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">ID</label>
                                    <p className="text-sm text-muted-foreground">#{selectedTicket.id}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                                    <p className="text-sm text-muted-foreground">{selectedTicket.category}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[selectedTicket.priority]}`}>
                                        {selectedTicket.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedTicket.status]}`}>
                                        {selectedTicket.status.replace('_', ' ')}
                                    </span>
                                </div>
                                {selectedTicket.assignedTo && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Assigned To</label>
                                        <p className="text-sm text-muted-foreground">{selectedTicket.assignedTo.name}</p>
                                    </div>
                                )}
                            </div>

                            {selectedTicket.adminResponse && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Admin Response</label>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.adminResponse}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Created</label>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {selectedTicket.resolvedAt && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Resolved</label>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedTicket.resolvedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Edit Modal - Admin Only */}
                {user?.role === 'admin' && (
                    <Modal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        title="Update Ticket"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                                    <Select
                                        value={editForm.status}
                                        onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                                    >
                                        <option value="open">Open</option>
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
                                <label className="block text-sm font-medium text-foreground mb-2">Admin Response</label>
                                <Textarea
                                    value={editForm.adminResponse}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, adminResponse: e.target.value }))}
                                    placeholder="Add your response to the ticket..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateTicket}>
                                    Update Ticket
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Create Ticket Modal */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create New Ticket"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Title *
                            </label>
                            <Input
                                value={createForm.title}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Brief description of the issue"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Description *
                            </label>
                            <Textarea
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Detailed description of the issue"
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Category
                                </label>
                                <Select
                                    value={createForm.category}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}
                                >
                                    <option value="technical">Technical</option>
                                    <option value="billing">Billing</option>
                                    <option value="general">General</option>
                                    <option value="complaint">Complaint</option>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Priority
                                </label>
                                <Select
                                    value={createForm.priority}
                                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: value }))}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTicket}>
                                Create Ticket
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    )
}