'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentPlansApi } from '@/lib/api-functions'
import { PaymentPlan } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { toast } from 'react-hot-toast'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PaymentPlanFormData {
    durationMonths: number
    durationLabel: string
    amount: number
    isActive: boolean
    sortOrder: number
}

interface SortableRowProps {
    plan: PaymentPlan
    onEdit: (plan: PaymentPlan) => void
    onDelete: (id: string) => void
}

function SortableRow({ plan, onEdit, onDelete }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: String(plan.id) })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? 'bg-gray-100 dark:bg-gray-700 shadow-lg' : ''} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                    <div
                        className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        {...attributes}
                        {...listeners}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
                        </svg>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {plan.durationLabel}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                ₹{plan.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${plan.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {plan.sortOrder}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        onEdit(plan)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        onDelete(plan.id)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white border-0"
                >
                    Delete
                </Button>
            </td>
        </tr>
    )
}

export default function PaymentPlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null)
    const [formData, setFormData] = useState<PaymentPlanFormData>({
        durationMonths: 1,
        durationLabel: '',
        amount: 0,
        isActive: true,
        sortOrder: 0,
    })

    const queryClient = useQueryClient()



    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const { data: paymentPlansData, isLoading, error } = useQuery({
        queryKey: ['payment-plans'],
        queryFn: paymentPlansApi.getAll,
        retry: 3,
        retryDelay: 1000,
    })

    const createMutation = useMutation({
        mutationFn: paymentPlansApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
            toast.success('Payment plan created successfully')
            handleCloseModal()
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as any).response?.data?.message
                : 'Failed to create payment plan'
            toast.error(errorMessage)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PaymentPlan> }) =>
            paymentPlansApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
            toast.success('Payment plan updated successfully')
            handleCloseModal()
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as any).response?.data?.message
                : 'Failed to update payment plan'
            toast.error(errorMessage)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: paymentPlansApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
            toast.success('Payment plan deleted successfully')
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as any).response?.data?.message
                : 'Failed to delete payment plan'
            toast.error(errorMessage)
        },
    })

    const reorderMutation = useMutation({
        mutationFn: (reorderData: { id: string; sortOrder: number }[]) =>
            paymentPlansApi.reorder(reorderData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
            toast.success('Payment plans reordered successfully')
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error && 'response' in error
                ? (error as any).response?.data?.message
                : 'Failed to reorder payment plans'
            toast.error(errorMessage)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form data
        if (!formData.durationLabel.trim()) {
            toast.error('Duration label is required')
            return
        }

        if (formData.durationMonths < 1) {
            toast.error('Duration must be at least 1 month')
            return
        }

        if (formData.amount < 0) {
            toast.error('Amount must be 0 or greater')
            return
        }

        if (formData.sortOrder < 0) {
            toast.error('Sort order must be 0 or greater')
            return
        }

        // Ensure proper data types and validation
        const cleanedData = {
            durationMonths: parseInt(formData.durationMonths.toString()) || 1,
            durationLabel: formData.durationLabel.trim(),
            amount: parseFloat(formData.amount.toString()) || 0,
            isActive: Boolean(formData.isActive),
            sortOrder: parseInt(formData.sortOrder.toString()) || 0,
        }

        // Debug logging
        console.log('🔍 Form Data Before Cleaning:', formData)
        console.log('🔍 Cleaned Data:', cleanedData)
        console.log('🔍 Data Types:', {
            durationMonths: typeof cleanedData.durationMonths,
            amount: typeof cleanedData.amount,
            sortOrder: typeof cleanedData.sortOrder,
            isActive: typeof cleanedData.isActive
        })

        // Additional validation
        if (isNaN(cleanedData.amount) || cleanedData.amount < 0) {
            toast.error('Amount must be a valid number greater than or equal to 0')
            return
        }

        if (isNaN(cleanedData.durationMonths) || cleanedData.durationMonths < 1) {
            toast.error('Duration must be a valid number greater than 0')
            return
        }



        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, data: cleanedData })
        } else {
            createMutation.mutate(cleanedData)
        }
    }

    const handleEdit = (plan: PaymentPlan) => {
        setEditingPlan(plan)
        setFormData({
            durationMonths: plan.durationMonths,
            durationLabel: plan.durationLabel,
            amount: plan.amount,
            isActive: plan.isActive,
            sortOrder: plan.sortOrder,
        })
        setIsModalOpen(true)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this payment plan?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPlan(null)
        setFormData({
            durationMonths: 1,
            durationLabel: '',
            amount: 0,
            isActive: true,
            sortOrder: 0,
        })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || !active || active.id === over.id) {
            return
        }

        const activeId = String(active.id)
        const overId = String(over.id)

        const oldIndex = paymentPlans.findIndex((plan) => plan.id === activeId)
        const newIndex = paymentPlans.findIndex((plan) => plan.id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedPlans = arrayMove(paymentPlans, oldIndex, newIndex)

            // Update sort orders based on new positions
            const reorderData = reorderedPlans.map((plan, index) => ({
                id: plan.id,
                sortOrder: index + 1,
            }))

            reorderMutation.mutate(reorderData)
        }
    }

    const paymentPlans = paymentPlansData?.paymentPlans || []



    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading payment plans...</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Error Loading Payment Plans</h3>
                        <p className="text-red-600 dark:text-red-400 text-sm">
                            {error instanceof Error ? error.message : 'Failed to load payment plans. Please try again.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Payment Plans Management</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage duration and pricing options for your WiFi service plans
                        </p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        Add Payment Plan
                    </Button>
                </div>

                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 <strong>Tip:</strong> Drag and drop the rows using the grip handle (⋮⋮) to reorder payment plans. The sort order will be automatically updated.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Sort Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <SortableContext
                                items={paymentPlans.map(plan => String(plan.id))}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody className="bg-white !text-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {paymentPlans.map((plan) => (
                                        <SortableRow
                                            key={plan.id}
                                            plan={plan}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </table>
                    </DndContext>

                    {paymentPlans.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No payment plans found. Create your first payment plan.
                        </div>
                    )}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingPlan ? 'Edit Payment Plan' : 'Create Payment Plan'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (Months)
                            </label>
                            <Input
                                type="number"
                                min="1"
                                step="1"
                                value={formData.durationMonths.toString()}
                                onChange={(e) => {
                                    const value = e.target.value
                                    const numValue = value === '' ? 1 : parseInt(value, 10)
                                    setFormData({
                                        ...formData,
                                        durationMonths: isNaN(numValue) ? 1 : Math.max(1, numValue)
                                    })
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration Label
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., 1 Month, 3 Months"
                                value={formData.durationLabel}
                                onChange={(e) => setFormData({ ...formData, durationLabel: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (₹)
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                value={formData.amount}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '') {
                                        setFormData({ ...formData, amount: 0 })
                                        return
                                    }
                                    const numValue = parseFloat(value)
                                    if (!isNaN(numValue) && numValue >= 0) {
                                        setFormData({ ...formData, amount: numValue })
                                    }
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort Order
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                value={formData.sortOrder.toString()}
                                onChange={(e) => {
                                    const value = e.target.value
                                    const numValue = value === '' ? 0 : parseInt(value, 10)
                                    setFormData({
                                        ...formData,
                                        sortOrder: isNaN(numValue) ? 0 : Math.max(0, numValue)
                                    })
                                }}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                Active
                            </label>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {editingPlan ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    )
}