'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

interface DebugInfo {
    timestamp: string
    message: string
    type: 'info' | 'warning' | 'error'
}

export default function AuthDebug() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const [debugLogs, setDebugLogs] = useState<DebugInfo[]>([])
    const [isExpanded, setIsExpanded] = useState(false)

    const addLog = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
        setDebugLogs(prev => [
            ...prev.slice(-9), // Keep only last 9 logs
            {
                timestamp: new Date().toLocaleTimeString(),
                message,
                type
            }
        ])
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        addLog(`Auth State: ${isAuthenticated ? '✅' : '❌'} | Loading: ${isLoading ? '⏳' : '✅'}`, 'info')
        addLog(`Token: ${token ? 'Present' : 'Missing'} | User: ${user ? user.email : 'None'}`,
            token && user ? 'info' : 'warning')

        if (token && !user) {
            addLog('Token exists but no user data - potential auth issue', 'error')
        }

        if (!token && user) {
            addLog('User data exists but no token - potential auth issue', 'error')
        }

        console.log('🔍 Auth Debug Component:', {
            isAuthenticated,
            isLoading,
            user: user ? { id: user.id, email: user.email, role: user.role } : null,
            token: token ? 'exists' : 'missing'
        })
    }, [user, isAuthenticated, isLoading])

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`bg-black/90 text-white text-xs rounded font-mono transition-all duration-200 ${isExpanded ? 'w-96 max-h-96' : 'w-48'
                }`}>
                <div
                    className="p-2 cursor-pointer hover:bg-white/10 border-b border-white/20"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <span>🔧 Auth Debug</span>
                        <span>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                    <div className="mt-1 text-[10px] opacity-75">
                        <div>Auth: {isAuthenticated ? '✅' : '❌'} | Loading: {isLoading ? '⏳' : '✅'}</div>
                        <div>User: {user ? user.email : 'None'}</div>
                        <div>Token: {localStorage.getItem('token') ? '🔑' : '❌'}</div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-2 max-h-64 overflow-y-auto">
                        <div className="space-y-1">
                            {debugLogs.length === 0 ? (
                                <div className="text-muted-foreground">No logs yet...</div>
                            ) : (
                                debugLogs.map((log, index) => (
                                    <div key={index} className={`text-[10px] ${log.type === 'error' ? 'text-red-400' :
                                        log.type === 'warning' ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                        <span className="opacity-50">{log.timestamp}</span>
                                        <div>{log.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => setDebugLogs([])}
                            className="mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-[10px]"
                        >
                            Clear Logs
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}