/**
 * Test script to create sample users and admin for development
 * Run this after the backend is started
 */

const API_BASE = 'http://localhost:5500'

const testUsers = [
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '9876543210'
    },
    {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '9876543211'
    },
    {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '9876543212'
    },
    {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        password: 'password123',
        phone: '9876543213'
    },
    {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@example.com',
        password: 'password123',
        phone: '9876543214'
    }
]

async function createTestUsers() {
    console.log('🚀 Creating test users...')

    for (const user of testUsers) {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            })

            if (response.ok) {
                console.log(`✅ Created user: ${user.email}`)
            } else {
                const error = await response.text()
                console.log(`❌ Failed to create ${user.email}: ${error}`)
            }
        } catch (error) {
            console.log(`❌ Error creating ${user.email}:`, error.message)
        }

        // Add small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('🎉 Finished creating test users!')
    console.log('')
    console.log('📋 Test Accounts:')
    testUsers.forEach(user => {
        console.log(`${user.email} - password: ${user.password}`)
    })
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
    createTestUsers()
} else {
    console.log('This script should be run in Node.js, not in the browser')
}

export { createTestUsers }