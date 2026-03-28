# 🛍️ Clothify - E-Commerce Platform

A full-stack e-commerce application built with Spring Boot and React, featuring product management, shopping cart with variant support, order processing, and comprehensive admin dashboard.

### ScreenShots

-  Home Page
<p align="center">
  <img src="ecommerce-frontend/frontend/public/ss/1.png" width="550"/>
    <img src="ecommerce-frontend/frontend/public/ss/22.png" width="550"/>

  <img src="ecommerce-frontend/frontend/public/ss/2.png" width="550"/>
  
</p>

-  Login and Register

<p align="center">
  <img src="ecommerce-frontend/frontend/public/ss/3.png" width="450"/>
  <img src="ecommerce-frontend/frontend/public/ss/4.png" width="450"/>
</p>

- Admin dashboard
        - Add product and Edit Product

<p align="center">
  <img src="ecommerce-frontend/frontend/public/ss/5.png" width="450"/>
  <img src="ecommerce-frontend/frontend/public/ss/6.png" width="450"/>
</p>

<p align="center">
    <img src="ecommerce-frontend/frontend/public/ss/13.png" width="550"/>
  
- Add category

  <img src="ecommerce-frontend/frontend/public/ss/7.png" width="550"/>
  </p>
  
- Order Dashboard

<p>
  <img src="ecommerce-frontend/frontend/public/ss/21.png" width="450"/>
    <img src="ecommerce-frontend/frontend/public/ss/9.png" width="450"/>

      


</p>


<p align="center">
    <img src="ecommerce-frontend/frontend/public/ss/8.png" width="450"/>

</p>
- User Dashboard

<p align="center">
    <img src="ecommerce-frontend/frontend/public/ss/10.png" width="450"/>

  <img src="ecommerce-frontend/frontend/public/ss/11.png" width="450"/>
</p>

  - User Cart


<p align="center">
    <img src="ecommerce-frontend/frontend/public/ss/12.png" width="550"/>

  <img src="ecommerce-frontend/frontend/public/ss/14.png" width="550"/>
</p>

<p align="center">
  <img src="ecommerce-frontend/frontend/public/ss/15.png" width="550"/>
  <img src="ecommerce-frontend/frontend/public/ss/16.png" width="550"/>
</p><p align="center">
  <img src="ecommerce-frontend/frontend/public/ss/17.png" width="550"/>
  <img src="ecommerce-frontend/frontend/public/ss/18.png" width="550"/>
</p>

<p align="center">
  <img src="ecommerce-frontend/frontend/public/ss/19.png" width="550"/>
  <img src="ecommerce-frontend/frontend/public/ss/20.png" width="550"/>
</p>
<p align="center">
</p>



![Screenshot](frontend/public/ss/1.png)
## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Key Features Guide](#key-features-guide)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Customer Features
- 🔐 **User Authentication** - Secure login and registration
- 🛒 **Shopping Cart** - Add products with size/color variants
- 📦 **Product Variants** - Full support for product variations (colors, sizes)
- 💳 **Checkout Process** - Complete order placement with delivery options
- 📱 **Order Tracking** - Track orders with shipping information
- 📧 **Email Notifications** - Order confirmations and updates
- 📱 **SMS Notifications** - Real-time order status updates

### Admin Features
- 📊 **Dashboard** - Comprehensive admin control panel
- 📦 **Product Management** - CRUD operations with variant support
- 🏷️ **Category Management** - Organize products by categories
- 🌳 **Sub-Category Management** - Nested categorization
- 📮 **Order Management** - View and update order statuses
- 🚚 **Shipping Tracking** - Add tracking numbers and carrier info
- 📸 **Image Upload** - Multi-image upload for products
- 📊 **Purchase Orders** - Inventory procurement management

### Technical Features
- ✅ **Variant Tracking** - Case-insensitive color/size matching
- ✅ **Stock Management** - Real-time inventory validation
- ✅ **Cart Persistence** - Session-based cart storage
- ✅ **Responsive Design** - Mobile-first UI/UX
- ✅ **RESTful API** - Clean API architecture
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access** - Admin and Customer roles

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.3.0**
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - ORM
- **MySQL** - Database
- **JWT (JJWT 0.12.3)** - Token generation
- **Lombok** - Code reduction
- **Maven** - Build tool
- **JavaMailSender** - Email service
- **SpringDoc OpenAPI** - API documentation

### Frontend
- **React 18**
- **React Router** - Navigation
- **Material-UI (MUI)** - UI components
- **Axios** - HTTP client
- **Google Fonts** - Typography (Playfair Display, IBM Plex Mono)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 17+**
- **Node.js 16+** and **npm 8+**
- **MySQL 8.0+**
- **Maven 3.8+**
- **Git**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/clothify-ecommerce.git
cd clothify-ecommerce
```

### 2. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

Navigate to backend directory:
```bash
cd backend
```

Update `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=ecommerce_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
app.jwt.secret=your-secret-key-here-make-it-at-least-32-characters-long-for-hs512-algorithm
app.jwt.expiration=86400000

# File Upload
app.upload.dir=uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Email Configuration (Optional)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# SMS Configuration (Optional)
sms.api.key=your-sms-api-key
sms.api.url=https://api.sms-provider.com/send
```

Build the backend:
```bash
mvn clean install
```

### 4. Frontend Setup

Navigate to frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Update API URL in service files if needed (default: `http://localhost:8080`).

## ⚙️ Configuration

### Backend Configuration Files

#### application.properties
Located at `backend/src/main/resources/application.properties`

Key configurations:
- Database connection
- JWT secret and expiration
- File upload settings
- Email/SMS settings
- Server port (default: 8080)

#### Security Configuration
JWT-based authentication with role-based access control:
- **ADMIN**: Full access to all endpoints
- **CUSTOMER**: Access to customer-specific endpoints

### Frontend Configuration

#### Environment Variables
Create `.env` file in frontend root (optional):
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_UPLOAD_DIR=/uploads
```

## 🏃 Running the Application

### Start Backend
```bash
cd backend
mvn spring-boot:run
```

Backend will start on: `http://localhost:8080`

API Documentation (Swagger): `http://localhost:8080/swagger-ui.html`

### Start Frontend
```bash
cd frontend
npm start
```

Frontend will start on: `http://localhost:3000`

### Default Admin Credentials
```
Username: admin
Password: admin123
```

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          - Register new customer
POST   /api/auth/login             - User login
```

### Product Endpoints
```
GET    /api/products               - Get all products
GET    /api/products/{id}          - Get product by ID
POST   /api/products               - Create product (Admin)
PUT    /api/products/{id}          - Update product (Admin)
DELETE /api/products/{id}          - Delete product (Admin)
GET    /api/products/category/{id} - Get products by category
```

### Cart Endpoints
```
GET    /api/cart/customer/{customerId}           - Get customer cart
POST   /api/cart/customer/{customerId}/add       - Add item to cart
PUT    /api/cart/customer/{customerId}/item/{id} - Update cart item
DELETE /api/cart/customer/{customerId}/item/{id} - Remove cart item
DELETE /api/cart/customer/{customerId}/clear     - Clear cart
```

### Order Endpoints
```
POST   /api/orders/checkout        - Create order from cart
GET    /api/orders                 - Get all orders (Admin)
GET    /api/orders/{id}            - Get order by ID
GET    /api/orders/customer/{id}   - Get customer orders
PATCH  /api/orders/{id}/status     - Update order status (Admin)
PUT    /api/orders/{id}/tracking   - Add tracking details (Admin)
POST   /api/orders/{id}/cancel     - Cancel order
```

### Category Endpoints
```
GET    /api/categories             - Get all categories
POST   /api/categories             - Create category (Admin)
PUT    /api/categories/{id}        - Update category (Admin)
DELETE /api/categories/{id}        - Delete category (Admin)
```

### File Upload
```
POST   /api/upload                 - Upload single file
POST   /api/upload/multiple        - Upload multiple files
```

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/main/java/com/ecommerce/
│   ├── config/              # Configuration classes
│   │   ├── DataInitializer.java
│   │   ├── SecurityConfig.java
│   │   └── WebConfig.java
│   ├── controller/          # REST controllers
│   │   ├── AuthController.java
│   │   ├── CartController.java
│   │   ├── CategoryController.java
│   │   ├── OrderController.java
│   │   ├── ProductController.java
│   │   └── FileUploadController.java
│   ├── dto/                 # Data Transfer Objects
│   ├── entity/              # JPA entities
│   │   ├── Cart.java
│   │   ├── CartItem.java
│   │   ├── Category.java
│   │   ├── City.java
│   │   ├── Customer.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── Payment.java
│   │   ├── Product.java
│   │   ├── Role.java
│   │   └── UserAccount.java
│   ├── exception/           # Custom exceptions
│   ├── mapper/              # Entity-DTO mappers
│   ├── repository/          # JPA repositories
│   ├── security/            # Security components
│   │   ├── CustomUserDetailsService.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtTokenProvider.java
│   │   └── UserPrincipal.java
│   └── service/             # Business logic
│       └── impl/
└── src/main/resources/
    └── application.properties
```

### Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CategoryManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── PurchaseOrder.jsx
│   │   │   └── SubCategoryManagement.jsx
│   │   ├── home/
│   │   │   └── ProductSection.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── ProductDetails.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── cartService.js
│   │   ├── categoryService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   └── subCategoryService.js
│   ├── App.js
│   └── index.js
└── package.json
```

## 🎯 Key Features Guide

### 1. Product Variants System

Products can have multiple variants (color + size combinations):

**Backend:**
- Each variant has independent stock tracking
- Variants stored in `Product.variants` collection
- Case-insensitive matching for variant lookup

**Frontend:**
- Visual color selector with hex colors
- Size selection with availability indication
- Real-time stock status display
- Cart tracks specific variant quantities

### 2. Cart Management

**Smart Variant Tracking:**
```javascript
// Each cart item tracks:
{
  productId: 123,
  color: "RED",
  size: "M",
  quantity: 2
}
```

**Features:**
- Prevents adding more than available stock
- Shows "X in cart, Y more available"
- Auto-adjusts quantity on stock changes
- Variant-specific quantity controls

### 3. Order Processing

**Workflow:**
1. Customer adds items to cart
2. Proceeds to checkout
3. Selects delivery method (pickup/delivery)
4. Chooses payment method
5. Order created, inventory reduced
6. Email & SMS notifications sent
7. Admin can add tracking details

### 4. Admin Dashboard

**Five Main Sections:**

1. **Products** - Manage inventory with variants
2. **Categories** - Top-level organization
3. **Sub-Categories** - Nested categorization
4. **Orders** - View, update status, add tracking
5. **Purchase Orders** - Procurement management

**Order Management Features:**
- Search by order ID, customer, tracking
- Filter by status
- View complete order details
- Update order status
- Add tracking information
- View customer info and items

