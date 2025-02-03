# Multilingual FAQ Management System

A robust FAQ management system with multilingual support, built with Node.js, Express, PostgreSQL, and Redis. The system provides dynamic translation capabilities for English, Hindi, and Bengali languages.

## Features

- ✨ Multilingual FAQ management with dynamic translation support
- 🚀 High-performance caching with Redis
- 🔒 Secure API endpoints with rate limiting
- 📝 Rich text editor (CKEditor) for FAQ answers
- 🌐 Automatic translation using Google Translate API
- 🗄️ PostgreSQL database with Sequelize ORM
- 🔍 PgAdmin interface for database management
- 🐳 Docker and Docker Compose support
- ✅ Comprehensive test coverage with Mocha and Chai
- 📚 API documentation with Swagger UI

## Tech Stack

- Backend: Node.js, Express
- Database: PostgreSQL
- Cache: Redis
- ORM: Sequelize
- Template Engine: EJS
- Translation: Google Translate API
- Rich Text Editor: CKEditor 4
- Containerization: Docker & Docker Compose
- Testing: Mocha, Chai, Supertest

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd multilingual-faq-system
   ```

2. Environment Setup:
   ```bash
   cp .env.example .env
   # Update .env with your configurations
   ```

3. Start with Docker:
   ```bash
   docker-compose up
   ```

   Or start without Docker:
   ```bash
   npm install
   npm run dev
   ```

4. Access the applications:
   - FAQ System: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin/dashboard
   - PgAdmin: http://localhost:5050
   - API Documentation: http://localhost:3000/api-docs

## API Endpoints

### FAQ Management

#### Get FAQs
```bash
# Get all FAQs
GET /api/faqs

# Get FAQs in specific language
GET /api/faqs?lang=hi  # Hindi
GET /api/faqs?lang=bn  # Bengali
```

#### Create FAQ
```bash
POST /api/faqs
Content-Type: application/json

{
  "question": "What is this service?",
  "answer": "This is a multilingual FAQ management system."
}
```

#### Update FAQ
```bash
PUT /api/faqs/:id
Content-Type: application/json

{
  "question": "Updated question",
  "answer": "Updated answer"
}
```

#### Delete FAQ
```bash
DELETE /api/faqs/:id
```

## Development

### Project Structure
```
src/
├── config/         # Configuration files
├── models/         # Database models
├── routes/         # Route handlers
├── middleware/     # Custom middleware
├── public/         # Static files
├── utils/          # Utility functions
├── tests/          # Test files
└── views/          # EJS templates
```

### Available Scripts

```bash
# Development with nodemon
npm run dev

# Production start
npm start

# Run tests
npm test

# Run linting
npm run lint
```

## Docker Support

The application is containerized with Docker and includes:
- Node.js application container
- PostgreSQL database
- Redis cache
- PgAdmin interface

### Container Management

```bash
# Start all services
docker-compose up

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 