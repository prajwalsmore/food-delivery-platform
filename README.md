# Food Delivery Platform

A full-stack monorepo food delivery platform built with Node.js, Express, React, and SQLite.

## 🚀 Features

### Customer Features
- ✅ User registration and authentication
- ✅ Browse approved restaurants
- ✅ View restaurant menus
- ✅ Add items to cart
- ✅ Place orders with delivery details
- ✅ Track order status
- ✅ View order history
- ✅ Profile management

### Restaurant Features
- ✅ Restaurant owner registration
- ✅ Restaurant profile management
- ✅ Menu item management (CRUD)
- ✅ View and manage incoming orders
- ✅ Update order status
- ✅ Order analytics

### Admin Features
- ✅ User management
- ✅ Restaurant approval system
- ✅ Order management and analytics
- ✅ Platform statistics dashboard
- ✅ System health monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS & Helmet** - Security middleware

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📁 Project Structure

```
food-delivery-platform/
├── package.json                 # Root package.json with scripts
├── src/
│   ├── backend/                 # Backend application
│   │   ├── server.js           # Main server file
│   │   ├── config/
│   │   │   └── database.js     # Database configuration
│   │   ├── middleware/
│   │   │   └── auth.js         # Authentication middleware
│   │   └── routes/
│   │       ├── auth.js         # Authentication routes
│   │       ├── users.js        # User/customer routes
│   │       ├── restaurants.js  # Restaurant routes
│   │       ├── orders.js       # Order routes
│   │       └── admin.js        # Admin routes
│   └── frontend/               # Frontend application
│       ├── package.json        # Frontend dependencies
│       ├── vite.config.js      # Vite configuration
│       ├── index.html          # HTML template
│       └── src/
│           ├── main.jsx        # React entry point
│           ├── App.jsx         # Main app component
│           ├── index.css       # Global styles
│           ├── contexts/       # React contexts
│           ├── components/     # Reusable components
│           └── pages/          # Page components
├── database/                   # SQLite database files
└── dist/                      # Built frontend files (production)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-delivery-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd src/frontend
   npm install
   cd ../..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start both backend and frontend in development mode
   npm run dev
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only with nodemon
npm run dev:frontend     # Start frontend only with Vite

# Production
npm run build            # Build frontend and prepare backend
npm start                # Start production server

# Installation
npm run install:all      # Install all dependencies
npm run setup            # Install dependencies and setup database
```

## 🌐 Development URLs

- **Frontend (Development)**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Frontend (Production)**: http://localhost:3000

## 🔐 Authentication

The platform uses JWT-based authentication with role-based access control:

- **Customer**: Can browse restaurants, place orders, view history
- **Restaurant**: Can manage restaurants, menus, and orders
- **Admin**: Can manage users, approve restaurants, view analytics

### Demo Accounts

- **Admin**: admin@fooddelivery.com / admin123
- **Customer**: customer@example.com / password123
- **Restaurant**: restaurant@example.com / password123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users (Customers)
- `GET /api/users/restaurants` - Get approved restaurants
- `GET /api/users/restaurants/:id/menu` - Get restaurant menu
- `GET /api/users/cart` - Get user cart
- `POST /api/users/cart` - Add item to cart
- `PUT /api/users/cart/:id` - Update cart item
- `DELETE /api/users/cart/:id` - Remove cart item
- `POST /api/users/orders` - Place order
- `GET /api/users/orders` - Get order history
- `GET /api/users/orders/:id` - Get order details

### Restaurants
- `GET /api/restaurants/my-restaurants` - Get owner's restaurants
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `GET /api/restaurants/:id/menu` - Get restaurant menu
- `POST /api/restaurants/:id/menu` - Add menu item
- `PUT /api/restaurants/:id/menu/:itemId` - Update menu item
- `DELETE /api/restaurants/:id/menu/:itemId` - Delete menu item
- `GET /api/restaurants/:id/orders` - Get restaurant orders
- `PUT /api/restaurants/:id/orders/:orderId/status` - Update order status

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/restaurants/pending` - Get pending restaurants
- `PUT /api/admin/restaurants/:id/approval` - Approve/reject restaurant
- `GET /api/admin/analytics/dashboard` - Get dashboard stats
- `GET /api/admin/analytics/revenue` - Get revenue analytics

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users** - User accounts and profiles
- **restaurants** - Restaurant information
- **menu_items** - Restaurant menu items
- **orders** - Customer orders
- **order_items** - Items in each order
- **cart_items** - Shopping cart items

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database/food_delivery.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Frontend Configuration
VITE_API_URL=http://localhost:3000/api

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Deployment

### Local Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

The production server will serve the built React app from the `dist/` directory on port 3000.

### Render Deployment

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Set the following environment variables:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=your-super-secret-jwt-key-change-in-production
     JWT_EXPIRES_IN=24h
     DB_PATH=./database/food_delivery.db
     CORS_ORIGIN=https://your-app-name.onrender.com
     ```

2. **Build Command**
   ```bash
   npm run build
   ```

3. **Start Command**
   ```bash
   npm start
   ```

4. **Auto-Deploy Settings**
   - Branch: `main`
   - Auto-Deploy: Yes

### Environment Variables for Production

Create a `.env` file in the root directory with:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_PATH=./database/food_delivery.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Frontend Configuration
VITE_API_URL=https://your-app-name.onrender.com/api

# CORS Configuration
CORS_ORIGIN=https://your-app-name.onrender.com
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, React, and SQLite** 