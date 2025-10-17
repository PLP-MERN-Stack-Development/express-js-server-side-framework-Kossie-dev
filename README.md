# Products API - Express.js REST API

A comprehensive RESTful API built with Express.js for managing products with advanced features including filtering, pagination, search, and statistics.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Testing with Postman](#testing-with-postman)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

## ✨ Features

- ✅ Full CRUD operations for products
- ✅ API key authentication
- ✅ Request validation with custom error handling
- ✅ Advanced filtering (by category, price, stock status)
- ✅ Pagination with metadata
- ✅ Search functionality
- ✅ Sorting (ascending/descending)
- ✅ Product statistics and analytics
- ✅ Custom logger middleware
- ✅ Comprehensive error handling
- ✅ RESTful API design principles

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Postman** (optional, for testing) - [Download](https://www.postman.com/downloads/)

## 🚀 Installation

1. **Clone or download the project**
```bash
cd express-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Edit the `.env` file with your configurations (or use the defaults).

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `API_KEY_1` | First valid API key | `your-secret-api-key-123` |
| `API_KEY_2` | Second valid API key | `another-valid-key-456` |
| `MAX_ITEMS_PER_PAGE` | Maximum items per page | `100` |
| `DEFAULT_PAGE_SIZE` | Default pagination size | `10` |
| `LOG_LEVEL` | Logging level | `info` |

See `.env.example` for a complete template.

## 🏃 Running the Server

### Development Mode
```bash
npm start
```

### With Nodemon (Auto-restart on changes)
```bash
npm run dev
```

The server will start on `http://localhost:3000`

You should see output like:
```
Server is running on http://localhost:3000
Environment: development

API Endpoints:
  📚 Documentation:     GET  /api
  📦 All Products:      GET  /api/products
  🔍 Search Products:   GET  /api/products/search?q=laptop
  📊 Statistics:        GET  /api/products/stats
  ...
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

All `/api/*` endpoints require an API key in the request headers:
```
x-api-key: your-secret-api-key-123
```

---

## 🔐 Public Endpoints

### 1. Root Endpoint

**GET** `/`

Returns a simple "Hello World" message.

**Response:**
```
Hello World
```

---

### 2. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-17T10:30:00.000Z",
  "environment": "development"
}
```

---

### 3. API Documentation

**GET** `/api`

Get complete API documentation.

**Response:**
```json
{
  "success": true,
  "message": "Products API Documentation",
  "version": "1.0.0",
  "endpoints": {
    "products": {
      "listAll": "GET /api/products",
      "getOne": "GET /api/products/:id",
      "create": "POST /api/products",
      "update": "PUT /api/products/:id",
      "delete": "DELETE /api/products/:id",
      "search": "GET /api/products/search",
      "statistics": "GET /api/products/stats"
    }
  }
}
```

---

## 🔒 Protected Endpoints

All endpoints below require authentication via `x-api-key` header.

### 4. List All Products (with Filtering, Pagination, Sorting)

**GET** `/api/products`

Retrieve a list of products with optional filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=5` |
| `category` | string | Filter by category | `?category=Electronics` |
| `inStock` | boolean | Filter by stock status | `?inStock=true` |
| `minPrice` | number | Minimum price filter | `?minPrice=50` |
| `maxPrice` | number | Maximum price filter | `?maxPrice=500` |
| `sort` | string | Sort field (prefix with `-` for descending) | `?sort=-price` |
| `q` | string | Search query | `?q=laptop` |

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/products?category=Electronics&inStock=true&page=1&limit=5&sort=-price" \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**
```json
{
  "success": true,
  "filters": {
    "category": "Electronics",
    "inStock": "true",
    "minPrice": null,
    "maxPrice": null,
    "search": null
  },
  "sort": {
    "field": "price",
    "order": "desc"
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "itemsPerPage": 5,
    "hasNextPage": false,
    "hasPrevPage": false,
    "nextPage": null,
    "prevPage": null
  },
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop for professionals",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```

---

### 5. Get Single Product

**GET** `/api/products/:id`

Retrieve a specific product by ID.

**URL Parameters:**
- `id` (required): Product ID

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/products/1" \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop for professionals",
    "price": 1299.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "status": "fail",
  "message": "Product with ID 999 not found"
}
```

---

### 6. Create Product

**POST** `/api/products`

Create a new product.

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key-123
```

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling wireless headphones",
  "price": 199.99,
  "category": "Electronics",
  "inStock": true
}
```

**Validation Rules:**
- `name`: Required, non-empty string, max 100 characters
- `description`: Required, non-empty string, max 500 characters
- `price`: Required, positive number
- `category`: Required, non-empty string
- `inStock`: Required, boolean

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "name": "Wireless Headphones",
    "description": "Noise-cancelling wireless headphones",
    "price": 199.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Example Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 11,
    "name": "Wireless Headphones",
    "description": "Noise-cancelling wireless headphones",
    "price": 199.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

**Error Response (422 - Validation Error):**
```json
{
  "success": false,
  "status": "fail",
  "message": "Product validation failed",
  "errors": [
    "Name is required and must be a non-empty string",
    "Price must be a positive number"
  ]
}
```

**Error Response (409 - Conflict):**
```json
{
  "success": false,
  "status": "fail",
  "message": "Product with name \"Laptop\" already exists"
}
```

---

### 7. Update Product

**PUT** `/api/products/:id`

Update an existing product. Only provided fields will be updated.

**URL Parameters:**
- `id` (required): Product ID

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key-123
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Product Name",
  "price": 299.99,
  "inStock": false
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/products/1" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "price": 1199.99,
    "inStock": false
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop for professionals",
    "price": 1199.99,
    "category": "Electronics",
    "inStock": false
  }
}
```

---

### 8. Delete Product

**DELETE** `/api/products/:id`

Delete a product by ID.

**URL Parameters:**
- `id` (required): Product ID

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/products/1" \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop for professionals",
    "price": 1299.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

---

### 9. Search Products

**GET** `/api/products/search`

Search for products by name or description.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `category` | string | No | Filter by category |
| `inStock` | boolean | No | Filter by stock status |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/products/search?q=keyboard&category=Electronics" \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**
```json
{
  "success": true,
  "query": "keyboard",
  "filters": {
    "category": "Electronics",
    "inStock": null
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false,
    "nextPage": null,
    "prevPage": null
  },
  "resultsCount": 1,
  "data": [
    {
      "id": 5,
      "name": "Mechanical Keyboard",
      "description": "RGB mechanical keyboard with Cherry MX switches",
      "price": 149.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```

---

### 10. Product Statistics

**GET** `/api/products/stats`

Get statistical analysis of products.

**Query Parameters:**
- `category` (optional): Filter statistics by category

**Example Request (Overall Stats):**
```bash
curl -X GET "http://localhost:3000/api/products/stats" \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**
```json
{
  "success": true,
  "filter": null,
  "statistics": {
    "overall": {
      "totalProducts": 10,
      "totalValue": 2684.89,
      "averagePrice": 268.49,
      "inStockCount": 6,
      "outOfStockCount": 4,
      "priceRange": {
        "min": 29.99,
        "max": 1299.99
      }
    },
    "byCategory": {
      "Electronics": {
        "count": 5,
        "totalValue": 1619.94,
        "averagePrice": 323.99,
        "inStock": 3,
        "outOfStock": 2
      },
      "Furniture": {
        "count": 5,
        "totalValue": 1064.95,
        "averagePrice": 212.99,
        "inStock": 3,
        "outOfStock": 2
      }
    },
    "categories": ["Electronics", "Furniture"]
  }
}
```

**Example Request (Category-Specific Stats):**
```bash
curl -X GET "http://localhost:3000/api/products/stats?category=Electronics" \
  -H "x-api-key: your-secret-api-key-123"
```

---

## ⚠️ Error Handling

The API uses standard HTTP status codes and returns consistent error responses.

### Error Response Format
```json
{
  "success": false,
  "status": "fail", // or "error"
  "message": "Error description",
  "errors": [] // Optional array of detailed errors
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Common Error Examples

**401 - Missing API Key:**
```json
{
  "success": false,
  "status": "fail",
  "message": "API key is required. Please provide x-api-key header."
}
```

**403 - Invalid API Key:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Invalid API key. Access denied."
}
```

**404 - Resource Not Found:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Product with ID 999 not found"
}
```

**422 - Validation Error:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Product validation failed",
  "errors": [
    "Name is required and must be a non-empty string",
    "Price must be a positive number"
  ]
}
```

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Create requests for each endpoint
4. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `api_key`: `your-secret-api-key-123`

### Quick Test Sequence

1. **Health Check**: `GET /health`
2. **Get All Products**: `GET /api/products` (with API key)
3. **Get Single Product**: `GET /api/products/1` (with API key)
4. **Create Product**: `POST /api/products` (with API key + body)
5. **Update Product**: `PUT /api/products/1` (with API key + body)
6. **Search Products**: `GET /api/products/search?q=laptop` (with API key)
7. **Get Statistics**: `GET /api/products/stats` (with API key)
8. **Delete Product**: `DELETE /api/products/1` (with API key)

---

## 📁 Project Structure
```
express-app/
├── middleware/
│   ├── logger.js              # Custom request logger
│   ├── auth.js                # API key authentication
│   ├── validation.js          # Request validation
│   └── errorHandler.js        # Global error handler
├── utils/
│   ├── errors.js              # Custom error classes
│   ├── asyncHandler.js        # Async error wrapper
│   ├── queryHelpers.js        # Query parsing utilities
│   └── productHelpers.js      # Product operations
├── node_modules/              # Dependencies
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── index.js                   # Main application file
├── package.json               # Project dependencies
├── package-lock.json          # Dependency lock file
└── README.md                  # This file
```

---

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **dotenv** - Environment variable management

---

## 📝 API Design Principles

This API follows REST conventions:

- **Resources** are nouns (products)
- **HTTP methods** indicate actions (GET, POST, PUT, DELETE)
- **Status codes** indicate results
- **Responses** are consistent JSON format
- **Errors** are descriptive and actionable

---

## 🔄 Example Use Cases

### Use Case 1: Get All Electronics Under $200
```bash
curl -X GET "http://localhost:3000/api/products?category=Electronics&maxPrice=200" \
  -H "x-api-key: your-secret-api-key-123"
```

### Use Case 2: Search and Sort
```bash
curl -X GET "http://localhost:3000/api/products?q=desk&sort=-price&limit=5" \
  -H "x-api-key: your-secret-api-key-123"
```

### Use Case 3: Get In-Stock Furniture
```bash
curl -X GET "http://localhost:3000/api/products?category=Furniture&inStock=true" \
  -H "x-api-key: your-secret-api-key-123"
```

### Use Case 4: Paginate Through Products
```bash
# Page 1
curl -X GET "http://localhost:3000/api/products?page=1&limit=5" \
  -H "x-api-key: your-secret-api-key-123"

# Page 2
curl -X GET "http://localhost:3000/api/products?page=2&limit=5" \
  -H "x-api-key: your-secret-api-key-123"
```

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

Your Name

---

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Email: your.email@example.com

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

**Happy Coding! 🚀**