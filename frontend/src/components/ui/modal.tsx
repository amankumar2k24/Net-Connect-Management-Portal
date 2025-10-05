'use client'

import * as React from "react"
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const [mounted, setMounted] = React.useState(false)

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  }

  // Handle mounting
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const modalContent = (

    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className={cn(
        "relative w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all max-h-[90vh] overflow-y-auto mx-auto my-auto",
        sizeClasses[size]
      )}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
            {title && (
              <h3 className="text-xl font-semibold !text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="flex items-center justify-center h-10 w-10 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-gray-900 dark:text-white">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export { Modal }