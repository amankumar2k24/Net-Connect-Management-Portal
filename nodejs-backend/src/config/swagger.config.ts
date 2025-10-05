import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export class SwaggerConfig {
    static setup(app: Express): void {
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'WiFi Dashboard API',
                    version: '1.0.0',
                    description: 'API documentation for WiFi Dashboard application',
                    contact: {
                        name: 'API Support',
                        email: 'support@wifidashboard.com',
                    },
                },
                servers: [
                    {
                        url: process.env.API_URL || 'http://localhost:5501',
                        description: 'Development server',
                    },
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                            description: 'Enter JWT token',
                        },
                    },
                    schemas: {
                        User: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                email: { type: 'string', format: 'email' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                role: { type: 'string', enum: ['user', 'admin'] },
                                isEmailVerified: { type: 'boolean' },
                                profilePicture: { type: 'string' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' },
                            },
                        },
                        Payment: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                userId: { type: 'string', format: 'uuid' },
                                amount: { type: 'number' },
                                status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
                                dueDate: { type: 'string', format: 'date' },
                                paidAt: { type: 'string', format: 'date-time' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' },
                            },
                        },
                        Notification: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                userId: { type: 'string', format: 'uuid' },
                                title: { type: 'string' },
                                message: { type: 'string' },
                                type: { type: 'string', enum: ['info', 'warning', 'error', 'success'] },
                                status: { type: 'string', enum: ['read', 'unread'] },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' },
                            },
                        },
                        Error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                                statusCode: { type: 'number' },
                                error: { type: 'string' },
                            },
                        },
                    },
                },
                tags: [
                    { name: 'Auth', description: 'Authentication endpoints' },
                    { name: 'Users', description: 'User management endpoints' },
                    { name: 'Payments', description: 'Payment management endpoints' },
                    { name: 'Notifications', description: 'Notification management endpoints' },
                    { name: 'Uploads', description: 'File upload endpoints' },
                ],
            },
            apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
        };

        const swaggerSpec = {
            ...swaggerOptions.definition,
            paths: {
                '/auth/register': {
                    post: {
                        tags: ['Auth'],
                        summary: 'Register a new user',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            email: { type: 'string', format: 'email' },
                                            password: { type: 'string', minLength: 6 },
                                            firstName: { type: 'string' },
                                            lastName: { type: 'string' },
                                        },
                                        required: ['email', 'password', 'firstName', 'lastName'],
                                    },
                                },
                            },
                        },
                        responses: {
                            201: {
                                description: 'User registered successfully',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                            400: {
                                description: 'Bad request',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Error' },
                                    },
                                },
                            },
                        },
                    },
                },
                '/auth/login': {
                    post: {
                        tags: ['Auth'],
                        summary: 'Login user',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            email: { type: 'string', format: 'email' },
                                            password: { type: 'string' },
                                        },
                                        required: ['email', 'password'],
                                    },
                                },
                            },
                        },
                        responses: {
                            200: {
                                description: 'Login successful',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                token: { type: 'string' },
                                                user: { $ref: '#/components/schemas/User' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        // Setup Swagger UI
        app.use('/api/docs', swaggerUi.serve);
        app.get('/api/docs', swaggerUi.setup(swaggerSpec, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        }));

        // Serve swagger.json
        app.get('/api/docs/swagger.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }
}