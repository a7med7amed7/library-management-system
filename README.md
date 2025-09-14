# Library Management System

A comprehensive library management system built with Node.js, Express, and MySQL. This system provides a complete solution for managing books, borrowers, borrowing operations, and generating detailed reports with analytics.

## Features

### Core Functionality
- **Book Management**: Complete CRUD operations for books with inventory tracking
- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Borrowing System**: Advanced book checkout/return system with due date tracking
- **Comprehensive Reporting**: Multiple report types with CSV/XLSX export capabilities
- **Analytics Dashboard**: Detailed statistics and trend analysis
- **Search & Filter**: Advanced book search functionality
- **Rate Limiting**: Built-in API rate limiting for security
- **Docker Support**: Complete containerization with Docker Compose

### Advanced Features
- **Multi-format Export**: Support for both CSV and XLSX report formats
- **Real-time Statistics**: Live analytics with borrowing trends and patterns
- **Overdue Management**: Automated overdue book tracking and reporting
- **Inventory Management**: Stock tracking with low-stock alerts
- **Period Analytics**: Custom date range analytics and reporting
- **Interactive API Documentation**: Swagger UI with comprehensive API docs
- **Comprehensive Testing**: Unit tests with Jest framework
- **Database Migrations**: Knex.js-based database schema management

## ERD

![ERD](https://private-user-images.githubusercontent.com/75615698/489280418-a5f04f32-107e-4e77-a76f-4fe174e2ea80.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTc4NTc5MDEsIm5iZiI6MTc1Nzg1NzYwMSwicGF0aCI6Ii83NTYxNTY5OC80ODkyODA0MTgtYTVmMDRmMzItMTA3ZS00ZTc3LWE3NmYtNGZlMTc0ZTJlYTgwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA5MTQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwOTE0VDEzNDY0MVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWQzMzU4OWJlNTg2NDI1ZWMyMDdhNmFkNjg1Y2E1Y2ZjNDVlMzQwNzc4YmJlZjhjNjExMjQ2OTFkYzkxYzFhMzYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.6KqpFAaNgGYp_-76pEwfM3cV7vEm4IrmP80yrvCMBqo)

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── modules/
│   ├── auth/           # Authentication & authorization
│   ├── books/          # Book management
│   ├── borrowers/      # User/borrower management
│   ├── borrowing/      # Borrowing operations
│   └── reporting/      # Reports & analytics
├── shared/
│   ├── config/         # Configuration files
│   ├── middleware/     # Custom middleware
│   └── utils/          # Utility functions
└── tests/              # Test files
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi schema validation
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest with Supertest
- **Export**: XLSX and CSV support
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Knex.js

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-main
   ```

2. **Start with Docker Compose**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Access the application**
   - API: `http://localhost:3030`
   - API Documentation: `http://localhost:3030/api-docs`
   - Database: `localhost:3304`

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your_jwt_secret_key
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=library_management
   DB_HOST=localhost
   DB_PORT=3306
   PORT=3030
   ```

3. **Run database migrations**
   ```bash
   npm run migrate:init
   npm run migrate
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the application**
   ```bash
   npm start
   ```

## API Documentation

Visit `http://localhost:3030/api-docs` for interactive API documentation with Swagger UI.

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

**Example Registration Request:**
```bash
curl -X POST http://localhost:3030/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Books Management
- `GET /api/books` - List all books
- `POST /api/books` - Add new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)
- `GET /api/books/search` - Search books by title, author, or ISBN

**Example Book Search:**
```bash
curl -X GET "http://localhost:3030/api/books/search?title=Gatsby&author=Fitzgerald"
```

#### Borrowers Management
- `GET /api/borrowers/profile` - Get user profile
- `PUT /api/borrowers/profile` - Update profile
- `GET /api/borrowers/history` - Get borrowing history
- `GET /api/borrowers` - List all borrowers (Admin only)
- `GET /api/borrowers/:id` - Get borrower details (Admin only)
- `DELETE /api/borrowers/:id` - Delete borrower (Admin only)

#### Borrowing Operations
- `POST /api/borrowing/checkout` - Borrow a book
- `POST /api/borrowing/return` - Return a book
- `GET /api/borrowing/checked-out` - Get checked out books
- `GET /api/borrowing/overdue` - Get overdue books

**Example Book Checkout:**
```bash
curl -X POST http://localhost:3030/api/borrowing/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "book_id": 1,
    "return_date": "2024-12-31"
  }'
```

#### Reports & Analytics
- `POST /api/reports/generate` - Generate custom reports
- `GET /api/reports/statistics` - Get comprehensive library statistics
- `POST /api/reports/analytics` - Get period-based analytics
- `GET /api/reports/export/last-month-overdue` - Export last month's overdue books
- `GET /api/reports/export/last-month-borrowing` - Export last month's borrowing data

**Example Report Generation:**
```bash
curl -X POST http://localhost:3030/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "report_type": "borrowing",
    "format": "xlsx"
  }'
```

## Reporting Features

### Report Types
1. **Borrowing Reports**: Complete borrowing history with book and borrower details
2. **Overdue Reports**: Books that are past their return date
3. **Inventory Reports**: Book stock levels and availability
4. **Last Month Reports**: Pre-configured reports for previous month data

### Export Formats
- **XLSX**: Excel-compatible format with formatting
- **CSV**: Comma-separated values for data analysis

### Analytics Features
- **General Statistics**: Total books, borrowers, active borrowings, overdue books
- **Trend Analysis**: 6-month borrowing trends and patterns
- **Popular Books**: Most borrowed books ranking
- **Top Borrowers**: Most active users
- **Return Rate Analysis**: On-time vs late return statistics
- **Overdue Analysis**: Detailed overdue book breakdown
- **Inventory Statistics**: Stock levels, low-stock alerts, unique authors

## Testing

Run the test suite:
```bash
npm test
```

The application includes comprehensive unit tests covering:
- Book management operations
- Reporting service functionality
- Data validation and error handling
- API endpoint testing

## Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT token generation
- `DB_USERNAME`: MySQL database username
- `DB_PASSWORD`: MySQL database password
- `DB_NAME`: Database name
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `PORT`: Application port (default: 3030)

**Example .env file:**
```env
JWT_SECRET=your_super_secret_jwt_key_here
DB_USERNAME=root
DB_PASSWORD=secure_password
DB_NAME=library_management
DB_HOST=localhost
DB_PORT=3306
PORT=3030
NODE_ENV=development
```

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window
- **Message**: Custom error message for rate limit exceeded

## Docker Configuration

The application includes complete Docker support:

- **App Container**: Node.js application with hot reload
- **MySQL Container**: MySQL 8.0 with health checks
- **Networking**: Custom bridge network for container communication
- **Volumes**: Persistent data storage for MySQL
- **Port Mapping**: 
  - Application: `3030:3030`
  - Database: `3304:3306`

**Docker Compose Configuration:**
```yaml
services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: library_management_app
    environment:
      PORT: 3030
      JWT_SECRET: secret_eeeh
      DB_USERNAME: root
      DB_PASSWORD: root
      DB_NAME: library_management
      DB_HOST: mysql
    ports:
      - "3030:3030"
    depends_on:
      mysql:
        condition: service_healthy

  mysql:
    image: mysql:8.0.35
    container_name: mysql-server
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: library_management
    ports:
      - "3304:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 10s
      retries: 10
```

## Database Schema

### Books Table
- `id` (Primary Key)
- `title` (String, Required)
- `author` (String, Required)
- `ISBN` (String, Unique, Required)
- `description` (Text, Optional)
- `available_quantity` (Integer, Default: 1)
- `shelf_location` (String, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Example Book Record:**
```sql
INSERT INTO books (title, author, ISBN, description, available_quantity, shelf_location) 
VALUES (
  'The Great Gatsby', 
  'F. Scott Fitzgerald', 
  '978-0-7432-7356-5', 
  'A classic American novel set in the Jazz Age', 
  5, 
  'A1-B2-C3'
);
```

### Borrowers Table
- `id` (Primary Key)
- `name` (String, Required)
- `email` (String, Unique, Required)
- `password_hash` (String, Required)
- `is_admin` (Boolean, Default: false)
- `verification_token` (String, Optional)
- `is_verified` (Boolean, Default: false)
- `registered_at` (Timestamp)

**Example Borrower Record:**
```sql
INSERT INTO borrowers (name, email, password_hash, is_admin, is_verified) 
VALUES (
  'John Doe', 
  'john@example.com', 
  '$2b$10$hashedpassword', 
  false, 
  true
);
```

### Borrowing History Table
- `id` (Primary Key)
- `book_id` (Foreign Key → Books)
- `borrower_id` (Foreign Key → Borrowers)
- `checkout_date` (Timestamp, Required)
- `return_date` (Timestamp, Required)
- `returned_date` (Timestamp, Optional)
- `is_returned` (Boolean, Default: false)

**Example Borrowing Record:**
```sql
INSERT INTO borrowing_history (book_id, borrower_id, checkout_date, return_date, is_returned) 
VALUES (
  1, 
  1, 
  '2024-01-15 10:30:00', 
  '2024-02-15 10:30:00', 
  false
);
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Joi schema validation for all inputs
- **CORS Support**: Configurable cross-origin resource sharing
- **Error Handling**: Comprehensive error handling and logging

## Deployment

### Production Considerations
1. Set strong JWT secrets
2. Configure proper database credentials
3. Set up SSL/TLS certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging
6. Configure backup strategies

### Health Check
The application includes a health check endpoint:
```
GET /health
```
## Author

**Ahmed Hamed** - Library Management System
