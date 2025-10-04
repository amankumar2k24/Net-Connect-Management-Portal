'use client'

import { useState, useEffect } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'

interface SidebarToggleProps {
    className?: string
}

export default function SidebarToggle({ className }: SidebarToggleProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    // Check for saved sidebar state in localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarCollapsed')
        if (savedState) {
            setIsSidebarCollapsed(JSON.parse(savedState))
        }
    }, [])

    // Toggle sidebar and save state
    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed
        setIsSidebarCollapsed(newState)
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))

        // Dispatch custom event to notify sidebar component
        window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: newState }))
    }

    return (
        <button
            onClick={toggleSidebar}
            className={`items-center justify-center p-2 rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary shadow-lg cursor-pointer ${className}`}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isSidebarCollapsed ? (
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            )}
        </button>
    )
}