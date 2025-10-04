'use client'

// This file showcases all the unique loaders implemented across the application
// It serves as a reference and can be used for testing/demonstration purposes

import {
    WiFiSignalLoader,
    FloatingParticlesLoader,
    DNAHelixLoader,
    MorphingShapesLoader
} from './unique-loader'

export default function LoaderShowcase() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Unique Loader Collection
                    </h1>
                    <p className="text-lg text-gray-600">
                        Custom animated loaders implemented across the WiFi Dashboard application
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* WiFi Signal Loader */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">WiFi Signal Loader</h2>
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            Used in: Dashboard Layout, Main Page, User Dashboard Stats
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <WiFiSignalLoader message="Connecting to network..." />
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Features: Animated WiFi bars, pulsing icon, typewriter effect
                        </div>
                    </div>

                    {/* Floating Particles Loader */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Floating Particles Loader</h2>
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            Used in: Recent Activity, Notifications, Next Payments
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <FloatingParticlesLoader message="Processing data..." />
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Features: 20 floating particles, triple rotating rings, central glow
                        </div>
                    </div>

                    {/* DNA Helix Loader */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">DNA Helix Loader</h2>
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            Used in: Payments Page, Payment History
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <DNAHelixLoader message="Analyzing transactions..." />
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Features: 3D rotating helix, alternating colors, progress bar
                        </div>
                    </div>

                    {/* Morphing Shapes Loader */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Morphing Shapes Loader</h2>
                        <p className="text-sm text-gray-600 mb-6 text-center">
                            Used in: Users Page, Next Payments History
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <MorphingShapesLoader message="Loading user data..." />
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Features: Shape morphing, orbiting dots, smooth transitions
                        </div>
                    </div>
                </div>

                {/* Implementation Summary */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Implementation Summary</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-600 mb-4">Pages Updated</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>✅ Admin Dashboard - Stats & Activity</li>
                                <li>✅ User Dashboard - Stats & Payments</li>
                                <li>✅ Users Page - Table Loading</li>
                                <li>✅ Payments Page - Transaction Loading</li>
                                <li>✅ Payment History - History Loading</li>
                                <li>✅ Next Payments - Multiple Sections</li>
                                <li>✅ Notifications - List Loading</li>
                                <li>✅ Dashboard Layout - Auth Loading</li>
                                <li>✅ Main Page - App Initialization</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-purple-600 mb-4">Loader Features</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>🎨 Unique animations for each context</li>
                                <li>📱 Fully responsive design</li>
                                <li>⚡ Lightweight and performant</li>
                                <li>🎯 Context-aware messaging</li>
                                <li>🌈 Gradient and color coordination</li>
                                <li>⏱️ Staggered timing effects</li>
                                <li>🔄 Smooth transitions</li>
                                <li>📡 WiFi/Network themed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}