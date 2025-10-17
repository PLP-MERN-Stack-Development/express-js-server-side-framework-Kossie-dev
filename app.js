// 1. Import the Express module
const express = require('express');

//Import middlewares
const logger = require('./middleware/logger');
const authenticateApiKey = require('./middleware/auth');
const { validateProductCreation, validateProductUpdate } = require('./middleware/validation');
const errorHandler = require('./middleware/errorHandler');

//Ipmort utilities
const asyncHandler = require('./utils/asyncHandler');
const {NotFoundError, BadRequestError, ConflictError} = require('./utils/errors');
const { parsePagination, parseSort, createPaginationMeta } = require('./utils/queryHelpers');
const {
  filterByCategory,
  filterByStock,
  filterByPriceRange,
  searchByName,
  sortProducts,
  paginateProducts,
  calculateStatistics
} = require('./utils/productHelpers');

// 2. Create an Express application instance
const app = express();

// 3. Define the port the server will listen on
const port = 3000;

//Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//Middleware to parse JSON bodies
app.use(express.json());

//Custom middleware for logging
app.use(logger);

//In-memory storage for products
let products = [
    { id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 1299.99, category: 'Electronics', inStock: true },
    { id: 2, name: 'Wireless Mouse', description: 'Ergonomic mouse', price: 24.50, category: 'Accessories', inStock: true },
    { id: 3, name: 'Coffee Maker', description: '12-cup automatic brewer', price: 85.00, category: 'Home Goods', inStock: false },
];
let nextId = 4; // To automatically assign IDs for new products

//Helper Functions
const findProductById = (id) => {
  const product = products.find(p => p.id === id);
  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  return product;
};

const findProductIndexById = (id) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  return index;
};

// 4. Implement the "Hello World" route at the root endpoint ('/')
// This is a simple GET request handler
app.get('/', (req, res) => {
  // Send the "Hello World!" text as the response
  res.send('Hello World');
});

//Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Products API Documentation',
    version: '1.0.0',
    endpoints: {
      products: {
        listAll: 'GET /api/products',
        getOne: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        search: 'GET /api/products/search',
        statistics: 'GET /api/products/stats'
      },
      queryParameters: {
        pagination: '?page=1&limit=10',
        filtering: '?category=Electronics&inStock=true&minPrice=50&maxPrice=500',
        sorting: '?sort=price (or ?sort=-price for descending)',
        search: '?q=laptop'
      }
    },
    authentication: 'Required: x-api-key header'
  });
});

// Simulate an error endpoint (for testing)
app.get('/test-error', asyncHandler(async (req, res) => {
  // Simulate async operation that fails
  throw new Error('This is a test error');
}));

// GET /api/products: List all products- with filtering, sorting, and pagination
app.get('/api/products', 
  authenticateApiKey, 
  asyncHandler(async(req, res) => {
     const { category, inStock, minPrice, maxPrice, q } = req.query;
  
  // Start with all products
  let filteredProducts = [...products];
  
  // Apply search if provided
  if (q) {
    filteredProducts = searchByName(filteredProducts, q);
  }
  
  // Apply filters
  filteredProducts = filterByCategory(filteredProducts, category);
  filteredProducts = filterByStock(filteredProducts, inStock);
  filteredProducts = filterByPriceRange(filteredProducts, minPrice, maxPrice);
  
  // Apply sorting
  const sortParams = parseSort(req.query);
  if (sortParams) {
    filteredProducts = sortProducts(filteredProducts, sortParams.field, sortParams.order);
  }
  
  // Get total count before pagination
  const totalCount = filteredProducts.length;
  
  // Apply pagination
  const { page, limit, skip } = parsePagination(req.query);
  const paginatedProducts = paginateProducts(filteredProducts, skip, limit);

   // Create pagination metadata
  const pagination = createPaginationMeta(totalCount, page, limit);
  
  // Simulate async database operation
  await new Promise(resolve => setTimeout(resolve, 10));
  
  res.json({
    success: true,
    filters: {
      category: category || null,
      inStock: inStock || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      search: q || null
    },
    sort: sortParams || null,
    pagination,
    data: paginatedProducts
  });
}));

// GET /api/products/search - Search products by name (dedicated search endpoint)
app.get('/api/products/search', authenticateApiKey, asyncHandler(async (req, res) => {
  const { q, category, inStock } = req.query;
  
  if (!q || q.trim() === '') {
    throw new BadRequestError('Search query parameter "q" is required');
  }
  
  // Start with search
  let results = searchByName(products, q);
  
  // Apply additional filters if provided
  if (category) {
    results = filterByCategory(results, category);
  }
  
  if (inStock !== undefined) {
    results = filterByStock(results, inStock);
  }
  
  // Apply pagination
  const { page, limit, skip } = parsePagination(req.query);
  const totalCount = results.length;
  const paginatedResults = paginateProducts(results, skip, limit);
  const pagination = createPaginationMeta(totalCount, page, limit);
  
  // Simulate async database operation
  await new Promise(resolve => setTimeout(resolve, 10));

   res.json({
    success: true,
    query: q,
    filters: {
      category: category || null,
      inStock: inStock || null
    },
    pagination,
    resultsCount: totalCount,
    data: paginatedResults
  });
}));

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', authenticateApiKey, asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  // Filter by category if provided
  let productsToAnalyze = category 
    ? filterByCategory(products, category)
    : products;
  
  // Calculate statistics
  const stats = calculateStatistics(productsToAnalyze);
  
  // Simulate async database operation
  await new Promise(resolve => setTimeout(resolve, 10));

  res.json({
    success: true,
    filter: category ? { category } : null,
    statistics: stats
  });
}));

// GET /api/products/:id: Get a specific product by ID
app.get('/api/products/:id', authenticateApiKey, asyncHandler(async(req, res) => {
    // 1. Get the ID from the URL parameters (it comes as a string)
    const id = parseInt(req.params.id);

    // Validate ID format
  if (isNaN(id)) {
    throw new BadRequestError('Product ID must be a valid number');
  }
  
  // Simulate async database operation
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const product = findProductById(id);

    //Send the product data
    res.json(product);
}));

// POST /api/products - Create a new product( with valiadtaion)
app.post('/api/products', 
  authenticateApiKey, 
  validateProductCreation, 
  asyncHandler(async(req, res) => {
  //1. Extract product data from the request body
  const { name, description, price, category, inStock } = req.body;

  // Check for duplicate product name
    const duplicate = products.find(p => 
      p.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (duplicate) {
      throw new ConflictError(`Product with name "${name}" already exists`);
    }

    // Simulate async database operation
    await new Promise(resolve => setTimeout(resolve, 10));
  
  //2. Create new product
  const newProduct = {
    id: nextId++,
    name: name.trim(),
    description: description.trim(),
    price: parseFloat(price),
    category: category.trim(),
    inStock: Boolean(inStock)
  };
  
  //3. Add to products array 
  products.push(newProduct);

  //4. Respond with the created product
  res.status(201).json({message: 'Product created successfully', data: newProduct});
}));

// PUT /api/products/:id - Update an existing product (with validation)
app.put('/api/products/:id', 
  authenticateApiKey, 
  validateProductUpdate, 
  asyncHandler(async(req, res) => {
  const id = parseInt(req.params.id);
  
  // Validate ID format
    if (isNaN(id)) {
      throw new BadRequestError('Product ID must be a valid number');
    }
    
    const productIndex = findProductIndexById(id);
    const { name, description, price, category, inStock } = req.body;
    
    // Check for duplicate name (if updating name)
    if (name) {
      const duplicate = products.find(p => 
        p.id !== id && p.name.toLowerCase() === name.trim().toLowerCase()
      );
      
      if (duplicate) {
        throw new ConflictError(`Product with name "${name}" already exists`);
      }
    }
    
    // Simulate async database operation
    await new Promise(resolve => setTimeout(resolve, 10));

  // Update product (only update provided fields)
  if (name !== undefined) products[productIndex].name = name;
  if (description !== undefined) products[productIndex].description = description;
  if (price !== undefined) products[productIndex].price = parseFloat(price);
  if (category !== undefined) products[productIndex].category = category;
  if (inStock !== undefined) products[productIndex].inStock = Boolean(inStock);
  
  //4. Respond with the updated product
  res.json({message: 'Product update succesfully', data:products[productIndex]});
}));

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id',
  authenticateApiKey,
  asyncHandler(async(req, res) => {
  const id = parseInt(req.params.id);

  // Validate ID format
    if (isNaN(id)) {
      throw new BadRequestError('Product ID must be a valid number');
    }
    
    const productIndex = findProductIndexById(id);
    
    // Simulate async database operation
    await new Promise(resolve => setTimeout(resolve, 10));

  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({message: 'Product deleted successfully',data:deletedProduct});
}));

//Error handling middleware
//404 handler
app.use((req, res, next) => {
throw new NotFoundError('Cannot ${req.method} ${req.url} - Resource not found');
});

//Global error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// 5. Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
   console.log(`Environment: ${process.env.NODE_ENV}`);
  //Additional deatails
  console.log(`API Documentation:`);
  console.log(`  - GET    /api/products (requires API key)`);
  console.log(`  - GET    /api/products/:id (requires API key)`);
  console.log(`  - POST   /api/products (requires API key + validation)`);
  console.log(`  - PUT    /api/products/:id (requires API key + validation)`);
  console.log(`  - DELETE /api/products/:id (requires API key)`);
   console.log(`\nAPI Endpoints:`);
  console.log(`  Documentation:     GET  /api`);
  console.log(`  All Products:      GET  /api/products`);
  console.log(`  Search Products:   GET  /api/products/search?q=laptop`);
  console.log(`  Statistics:        GET  /api/products/stats`);
  console.log(`  Single Product:    GET  /api/products/:id`);
  console.log(`  Create Product:    POST /api/products`);
  console.log(`  Update Product:    PUT  /api/products/:id`);
  console.log(`  Delete Product:    DELETE /api/products/:id`);
  console.log(`\nQuery Parameters:`);
  console.log(`  Pagination:        ?page=1&limit=10`);
  console.log(`  Filter by Category: ?category=Electronics`);
  console.log(`  Filter by Stock:    ?inStock=true`);
  console.log(`  Filter by Price:    ?minPrice=50&maxPrice=500`);
  console.log(`  Sort:              ?sort=price (or -price)`);
  console.log(`  Search:            ?q=laptop`);
  console.log(`\nValid API Keys:`);
  console.log(`  - your-secret-api-key-123`);
  console.log(`  - another-valid-key-456`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated!');
  });
});

module.exports = app;