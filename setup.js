#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Food Delivery Platform...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./database/food_delivery.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Frontend Configuration
VITE_API_URL=http://localhost:3000/api

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
}

// Create database directory
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  console.log('📁 Creating database directory...');
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Database directory created');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
  
  // Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd src/frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run "npm run dev" to start the development servers');
console.log('2. Open http://localhost:5173 in your browser');
console.log('3. Use the demo accounts to test the platform:');
console.log('   - Admin: admin@fooddelivery.com / admin123');
console.log('   - Customer: customer@example.com / password123');
console.log('   - Restaurant: restaurant@example.com / password123');
console.log('\n�� Happy coding!'); 