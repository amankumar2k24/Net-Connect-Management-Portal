'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitContactForm } from '@/lib/api'
import toast from 'react-hot-toast'
import {
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon
} from '@heroicons/react/24/outline'

interface ContactFormData {
    fullName: string
    email: string
    phone: string
    subject: string
    message: string
    company: string
}

const contactInfo = [
    {
        icon: MapPinIcon,
        title: 'Visit Us',
        details: ['123 Tech Street', 'Digital City, DC 12345'],
        color: 'text-blue-500'
    },
    {
        icon: PhoneIcon,
        title: 'Call Us',
        details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
        color: 'text-green-500'
    },
    {
        icon: EnvelopeIcon,
        title: 'Email Us',
        details: ['support@flowlink.com', 'sales@flowlink.com'],
        color: 'text-purple-500'
    },
    {
        icon: ClockIcon,
        title: 'Business Hours',
        details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat - Sun: 10:00 AM - 4:00 PM'],
        color: 'text-orange-500'
    }
]

export default function Contact() {
    const [formData, setFormData] = useState<ContactFormData>({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        company: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)

        try {
            await submitContactForm({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone || undefined,
                subject: formData.subject,
                message: formData.message,
                company: formData.company || undefined
            })

            toast.success('Thank you! Your message has been sent successfully. We\'ll get back to you soon.')

            // Reset form
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
                company: ''
            })
        } catch (error) {
            console.error('Contact form error:', error)
            toast.error('Sorry, there was an error sending your message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="contact" className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Get in Touch
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Ready to experience premium WiFi connectivity? Contact us today for a
                        personalized consultation and find the perfect plan for your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-foreground mb-6">
                                Let's Connect
                            </h3>
                            <p className="text-muted-foreground mb-8">
                                Have questions about our services? Need technical support?
                                Our team is here to help you get connected with the best internet solution.
                            </p>
                        </div>

                        {/* Contact Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {contactInfo.map((info, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${info.color.split('-')[1]}-100 to-${info.color.split('-')[1]}-200 dark:from-${info.color.split('-')[1]}-900/20 dark:to-${info.color.split('-')[1]}-800/20 flex items-center justify-center flex-shrink-0`}>
                                            <info.icon className={`w-5 h-5 ${info.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-2">{info.title}</h4>
                                            {info.details.map((detail, detailIndex) => (
                                                <p key={detailIndex} className="text-sm text-muted-foreground">
                                                    {detail}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Info */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                            <h4 className="font-semibold text-foreground mb-3">Quick Response Guarantee</h4>
                            <p className="text-sm text-muted-foreground">
                                We respond to all inquiries within 2 hours during business hours.
                                For urgent technical support, call our 24/7 hotline.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-card rounded-2xl p-8 border border-border">
                        <h3 className="text-2xl font-semibold text-foreground mb-6">
                            Send us a Message
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                                        Full Name *
                                    </label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                        Email Address *
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                                        Phone Number
                                    </label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                                        Company (Optional)
                                    </label>
                                    <Input
                                        id="company"
                                        name="company"
                                        type="text"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        placeholder="Your Company"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                                    Subject *
                                </label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="How can we help you?"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                                    Message *
                                </label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Tell us more about your requirements..."
                                    rows={5}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                size="lg"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}