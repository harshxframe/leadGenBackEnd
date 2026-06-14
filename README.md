# AI Lead Generator Backend

A powerful, scalable Node.js backend application for generating and managing business leads using AI-driven web scraping, data extraction, and intelligent automation. Built with Express.js, MongoDB, Redis, and BullMQ for high-performance job queue management.

## Overview

The AI Lead Generator Backend is designed to help businesses automatically discover, extract, and manage potential customer leads from various online sources. It combines web scraping capabilities, AI-powered data extraction, and a robust job queue system to efficiently process large volumes of lead generation requests.

### Key Features

- **🚀 High-Performance Lead Generation**: Async job processing with BullMQ and Redis
- **📧 Multi-Channel Integration**: Support for Mailjet and Zepto Mail for email campaigns
- **💳 Payment Processing**: Integrated with Lemon Squeezy for subscription management
- **🔐 Secure Authentication**: JWT-based authentication with role-based access control
- **📊 Admin Dashboard**: Comprehensive admin panel for system management
- **🌐 Web Scraping**: Advanced web scraping using Playwright and Cheerio
- **⚙️ Job Queue Management**: Reliable async job processing with BullMQ
- **🏥 Health Monitoring**: System health checks and performance monitoring
- **📝 Comprehensive Logging**: Winston-based logging system
- **🐳 Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

### Core Framework
- **Express.js** (v5.2.1) - Web framework
- **Node.js** - Runtime environment (ES Modules)

### Database & Caching
- **MongoDB** (v9.6.2) - Primary database
- **Redis** (v5.12.1) - Caching and session management
- **Mongoose** - MongoDB ODM

### Job Queue & Workers
- **BullMQ** (v5.76.10) - Job queue management
- **Node Workers** - Background job processing

### Web Scraping & Data Extraction
- **Playwright** (v1.60.0) - Browser automation
- **Cheerio** (v1.2.0) - HTML parsing and extraction
- **Axios** - HTTP client

### Authentication & Security
- **JWT** - JSON Web Token authentication
- **CORS** - Cross-Origin Resource Sharing

### Email & Notifications
- **Mailjet** - Email service provider
- **Zepto Mail** - Alternative email service
- **Node Mailjet** (v6.0.11) - Mailjet SDK

### Payment & Subscriptions
- **Lemon Squeezy** - Subscription and payment processing

### Utilities & Tools
- **dotenv** - Environment variable management
- **Morgan** - HTTP request logging
- **Winston** - Logging library
- **Nodemon** - Development server
- **Ngrok** - Tunnel for local development
- **p-limit** - Concurrency control
- **System Information** (v5.31.6) - System metrics

## Project Structure

```
leadGenBackEnd/
├── src/
│   ├── app.js                    # Express app initialization
│   ├── config/                   # Configuration files
│   │   ├── databaseConnection.js # MongoDB setup
│   │   └── redisConfig.js        # Redis setup
│   ├── controllers/              # Route controllers
│   │   ├── admin.js              # Admin operations
│   │   ├── auth.js               # Authentication
│   │   ├── dashboard.js          # User dashboard
│   │   ├── generateLeads.js      # Lead generation
│   │   └── payment.js            # Payment handling
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Job.js
│   │   └── ...
│   ├── routes/                   # API routes
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── generateLeads.js
│   │   └── payment.js
│   ├── middlewares/              # Express middlewares
│   │   ├── authentification.js   # JWT verification
│   │   ├── accessValidator.js    # Access control
│   │   ├── apiAuthentification.js
│   │   ├── health.js             # Health checks
│   │   ├── globalError.js        # Error handling
│   │   └── invalidRoute.js       # 404 handling
│   ├── services/                 # Business logic
│   │   ├── leadExtractor.js
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   └── ...
│   ├── jobs/                     # Background jobs
│   │   └── worker/
│   │       └── leadsJobWorker.js # Lead generation worker
│   ├── lib/                      # Libraries & utilities
│   │   └── lemon.js              # Lemon Squeezy setup
│   ├── utils/                    # Utility functions
│   │   ├── logger.js             # Logging configuration
│   │   ├── constants.js
│   │   └── helpers.js
│   └── webhooks/                 # Webhook handlers
│       └── index.js              # Payment webhooks
├── test/                         # Test files
├── server.js                     # Server entry point
├── package.json                  # Dependencies
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose setup
├── nodemon.json                  # Nodemon configuration
└── env.example                   # Environment variables template
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- Redis instance (local or remote)
- Docker & Docker Compose (optional)

### Step 1: Clone the Repository

```bash
git clone https://github.com/harshxframe/aileadGenerator.git
cd leadGenBackEnd
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
MONGO_URI_PRIMARY=mongodb://your-mongo-connection-string

# Server
PORT=3000
ENVIRONTMENT=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Services
ZEPTO_MAIL_HOST=your-zepto-host
ZEPTO_MAIL_TOKEN=your-zepto-token
MAILJET_API_KEY=your-mailjet-key
MAILJET_SECRET_KEY=your-mailjet-secret

# Authentication
JWT_SECRET=your-jwt-secret
JSON_WEB_TOKEN_SCERET=your-jwt-secret

# Payment (Lemon Squeezy)
LEMON_SQUEEZY_API_KEY=your-lemon-api-key
LEMON_STORE_ID=your-store-id
LEMON_VARIANT_50=variant-id-for-50
LEMON_VARIANT_150=variant-id-for-150
LEMON_VARIANT_500=variant-id-for-500
LEMON_SQUEEZY_SIGNING_WEBHOOK_SECRET=your-webhook-secret

# Paths
HOST_SHARED_TEMP=/YOUR_PATH/shared-temp

# Ngrok (Development)
NGROK_AUTHTOKEN=your-ngrok-token
```

### Step 4: Start the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Worker Process:**
```bash
npm run worker:leads
```

The server will start on the configured PORT (default: 2000 for development, environment PORT for production).

## Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the application image
- Start MongoDB container
- Start Redis container
- Start the application container
- Set up networking between services

### Using Docker Manually

```bash
# Build the image
docker build -t aileadgenerator .

# Run the container
docker run -p 3000:3000 --env-file .env aileadgenerator
```

## API Endpoints

### Authentication (`/app/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - User logout

### Lead Generation (`/app/v1`)
- `POST /generate-leads` - Create lead generation job
- `GET /jobs/:jobId` - Get job status
- `GET /jobs` - Get running jobs

### Dashboard (`/app/v1/dashboard`)
- `GET /leads` - Get extracted leads
- `GET /leads/:jobId` - Get leads by job
- `GET /jobs` - Get job history
- `GET /stats` - Get dashboard statistics

### Payment (`/app/v1/payment`)
- `GET /plans` - Get available plans
- `POST /checkout` - Create payment session
- `GET /subscription` - Get user subscription

### Admin (`/admin`)
- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings
- `GET /users` - Get all users
- `POST /inquiry` - Send user inquiry

### Health & Webhooks
- `GET /health` - System health check
- `POST /webhooks/lemon-squeezy` - Payment webhook

## Core Functionality

### Lead Generation Pipeline

1. **Request Submission**: User submits lead generation parameters
2. **Job Creation**: Request queued in BullMQ
3. **Web Scraping**: Playwright and Cheerio extract data
4. **Data Processing**: AI-powered extraction and cleaning
5. **Storage**: Leads saved to MongoDB
6. **Notification**: User notified via email upon completion

### Authentication Flow

1. User registers/logs in
2. Server validates credentials
3. JWT token generated and returned
4. Client includes token in Authorization header
5. Middleware verifies token on protected routes

### Payment Integration

- Lemon Squeezy handles subscription management
- Webhook receives payment events
- User subscription status updated in MongoDB
- Access control based on subscription tier

## Background Jobs

### Leads Job Worker

Located at `src/jobs/worker/leadsJobWorker.js`

- Processes lead generation jobs from BullMQ queue
- Executes web scraping with Playwright
- Extracts structured data with Cheerio
- Stores results in MongoDB
- Handles job failures and retries

**Running the Worker:**
```bash
npm run worker:leads
```

## Error Handling

The application includes comprehensive error handling:

- **Global Error Handler**: Catches all unhandled errors
- **Route Validation**: Input validation on all endpoints
- **Custom Error Classes**: Specific error types for different scenarios
- **Error Logging**: All errors logged to Winston logger

## Logging

Winston logger provides structured logging:

- **Log Levels**: error, warn, info, debug
- **Log Output**: Console and file rotation
- **Request Logging**: Morgan logs HTTP requests
- **Job Logging**: Background job execution logged

View logs in the `logs/` directory.

## Development

### Development Server

```bash
npm run dev
```

Uses Nodemon to automatically restart on file changes.

### Project Guidelines

- Use ES Modules (import/export)
- Follow Express.js best practices
- Implement error handling on all async operations
- Add logging to critical operations
- Use environment variables for configuration
- Add input validation to all endpoints

## Database Models

Key Mongoose schemas:

- **User**: User accounts and authentication
- **Lead**: Extracted lead information
- **Job**: Lead generation job records
- **Subscription**: User subscription details
- **AdminSettings**: System configuration

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Different permission levels
- **CORS Protection**: Configured CORS headers
- **Input Validation**: Request validation middleware
- **Environment Secrets**: Sensitive data in .env
- **Raw Body Verification**: For webhook verification

## Monitoring & Health Checks

- **Health Endpoint**: `GET /health` returns system status
- **System Metrics**: CPU, memory, disk usage tracking
- **Request Logging**: Morgan HTTP logging
- **Error Tracking**: Winston error logs

## Performance Optimization

- **Redis Caching**: Cache frequently accessed data
- **Job Queue**: Async processing with BullMQ
- **Connection Pooling**: MongoDB connection optimization
- **Concurrency Control**: p-limit for parallel operations

## Troubleshooting

### MongoDB Connection Issues
- Check `MONGO_URI_PRIMARY` in `.env`
- Ensure MongoDB server is running
- Verify network connectivity

### Redis Connection Issues
- Check `REDIS_HOST` and `REDIS_PORT`
- Ensure Redis server is running
- Check firewall rules

### Email Sending Issues
- Verify Mailjet/Zepto Mail credentials
- Check email templates
- Review email service logs

### Job Processing Issues
- Check worker process is running
- Review BullMQ queue dashboard
- Check Redis for stuck jobs

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Push to the branch
5. Create a Pull Request

## License

ISC License - see LICENSE file for details

## Author

**Harsh Verma**

## Support

For issues and feature requests, please create an issue on GitHub.

## Roadmap

- [ ] Enhanced AI-powered lead scoring
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom scraping templates
- [ ] API rate limiting improvements
- [ ] Real-time WebSocket updates
- [ ] Mobile app integration
- [ ] Additional payment providers

---

**Last Updated**: June 2026

For more information, visit the [GitHub Repository](https://github.com/harshxframe/aileadGenerator)