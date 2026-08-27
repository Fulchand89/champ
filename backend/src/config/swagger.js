const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz App API',
      version: '1.0.0',
      description: 'A comprehensive quiz App API',
      contact: {
        name: 'API Support',
        email: 'support@quizapp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://darkorchid-fox-475592.hostingersite.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            uuid: { type: 'string', example: 'USR-550E8400' },
            firebaseUid: { type: 'string', nullable: true, example: 'firebase-uid-123' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            mobile: { type: 'string', nullable: true, example: '9876543210' },
            role: { type: 'string', enum: ['user', 'admin', 'super_admin'], example: 'user' },
            city: { type: 'string', nullable: true, example: 'New Delhi' },
            adharNumber: { type: 'string', nullable: true, example: '123456789012' },
            adharImages: { 
              type: 'array', 
              items: { type: 'string' }, 
              nullable: true,
              example: ['/uploads/others/adhar-front.jpg', '/uploads/others/adhar-back.jpg'] 
            },
            profilePicUrl: { type: 'string', nullable: true, example: '/uploads/profile_pics/pic-123.jpg' },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
            isTermAccpeted: { type: 'boolean', example: false },
            authProvider: { type: 'string', enum: ['local', 'google'], example: 'local' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: { 
              type: 'array',
              items: { type: 'object' },
            },
            pagination: {
              type: 'object',
              properties: {
                totalItems: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 10 },
                currentPage: { type: 'integer', example: 1 },
                itemsPerPage: { type: 'integer', example: 10 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Email is required' },
                },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'mobile', 'city', 'adharNumber', 'adharImages'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            mobile: { type: 'string', example: '9876543210' },
            password: { type: 'string', format: 'password', example: 'password123' },
            city: { type: 'string', example: 'New Delhi' },
            role: { type: 'string', enum: ['user', 'admin', 'super_admin'], example: 'user' },
            isTermAccpeted: { type: 'boolean', example: true, description: 'Terms and conditions accepted status (true/false)' },
            adharNumber: { type: 'string', example: '123456789012' },
            adharImages: {
              type: 'array',
              items: { type: 'string' },
              example: ['/uploads/adhar_images/adhar-front.jpg', '/uploads/adhar_images/adhar-back.jpg']
            },
          },
        },
        GoogleAuthRequest: {
          type: 'object',
          required: ['idToken'],
          properties: {
            idToken: { type: 'string', description: 'Firebase Google ID Token', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...' },
            role: { type: 'string', enum: ['user', 'admin', 'super_admin'], example: 'user', description: 'Role for registration (default is user)' },
            mobile: { type: 'string', example: '9876543210', description: 'Mobile number (Mandatory for first-time registration)' },
            city: { type: 'string', example: 'New Delhi', description: 'City (Mandatory for first-time registration)' },
            adharNumber: { type: 'string', example: '123456789012', description: '12-digit Aadhaar number (Mandatory for first-time registration)' },
            adharImages: {
              type: 'array',
              items: { type: 'string' },
              example: ['/uploads/adhar_images/front.jpg', '/uploads/adhar_images/back.jpg'],
              description: 'Aadhaar images (front and back) or uploaded via multipart'
            },
            isTermAccpeted: { type: 'boolean', example: true, description: 'Terms and conditions accepted status' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Super Admin Privacy Policy',
        description: 'Super Admin Privacy Policy management',
      },
      {
        name: 'Super Admin Terms & Conditions',
        description: 'Super Admin Terms & Conditions management',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/docs/**/*.js'], 
};

let swaggerSpec = null;

const getSwaggerSpec = () => {
  if (!swaggerSpec) {
    swaggerSpec = swaggerJsdoc(options);
  }
  return swaggerSpec;
};

module.exports = getSwaggerSpec;