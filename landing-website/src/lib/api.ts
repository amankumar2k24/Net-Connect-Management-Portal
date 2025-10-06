import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5510'

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Contact form submission
export const submitContactForm = async (data: {
    fullName: string
    email: string
    phone?: string
    subject: string
    message: string
    company?: string
}) => {
    const response = await api.post('/contact-queries', data)
    return response.data
}

// Get payment plans for landing page
export const getPaymentPlans = async () => {
    const response = await api.get('/payment-plans/public')
    return response.data
}