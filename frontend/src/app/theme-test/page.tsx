'use client'

import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { useState } from 'react'
import Logo from '@/components/ui/logo'

export default function ThemeTestPage() {
    const { theme, toggleTheme } = useTheme()
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <Logo size="lg" variant="stacked" />
                    <h1 className="text-4xl font-bold text-foreground">Theme Test Page</h1>
                    <p className="text-muted-foreground">
                        Current theme: <span className="font-semibold text-primary capitalize">{theme}</span>
                    </p>
                    <Button onClick={toggleTheme}>
                        Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                    </Button>
                </div>

                {/* Text Elements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Text Elements</CardTitle>
                        <CardDescription>Testing text visibility in both themes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h1 className="text-2xl font-bold">Heading 1</h1>
                        <h2 className="text-xl font-semibold">Heading 2</h2>
                        <h3 className="text-lg font-medium">Heading 3</h3>
                        <p className="text-foreground">Regular paragraph text</p>
                        <p className="text-muted-foreground">Muted text</p>
                        <p className="text-primary">Primary colored text</p>
                    </CardContent>
                </Card>

                {/* Form Elements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Elements</CardTitle>
                        <CardDescription>Testing input visibility and functionality</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input placeholder="Enter some text here..." />
                        <Textarea placeholder="Enter a longer message here..." />
                        <div className="flex gap-4">
                            <Button variant="default">Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal Test */}
                <Card>
                    <CardHeader>
                        <CardTitle>Modal Test</CardTitle>
                        <CardDescription>Testing modal visibility and theming</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                    </CardContent>
                </Card>

                {/* Color Swatches */}
                <Card>
                    <CardHeader>
                        <CardTitle>Color System</CardTitle>
                        <CardDescription>Theme color variables</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <div className="w-full h-16 bg-background border border-border rounded"></div>
                                <p className="text-sm">Background</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-16 bg-card border border-border rounded"></div>
                                <p className="text-sm">Card</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-16 bg-primary rounded"></div>
                                <p className="text-sm">Primary</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-16 bg-muted rounded"></div>
                                <p className="text-sm">Muted</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Test Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Test Modal">
                <div className="space-y-4">
                    <p className="text-foreground">This is a test modal to check theme visibility.</p>
                    <Input placeholder="Test input in modal..." />
                    <Textarea placeholder="Test textarea in modal..." />
                    <div className="flex gap-2">
                        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                        <Button variant="outline">Test Button</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}