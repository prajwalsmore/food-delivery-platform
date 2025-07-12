# 🚀 Deployment Guide

## GitHub Setup

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Food Delivery Platform"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/food-delivery-platform.git
   git branch -M main
   git push -u origin main
   ```

## Render Deployment

### 1. Create Render Account
- Sign up at [render.com](https://render.com)
- Connect your GitHub account

### 2. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:

### 3. Service Configuration
- **Name**: `food-delivery-platform`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 4. Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
DB_PATH=./database/food_delivery.db
CORS_ORIGIN=https://your-app-name.onrender.com
```

### 5. Auto-Deploy Settings
- **Auto-Deploy**: Yes
- **Branch**: `main`

## Environment Variables

### Development (.env)
```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/food_delivery.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
VITE_API_URL=http://localhost:3000/api
CORS_ORIGIN=http://localhost:5173
```

### Production (Render)
```env
PORT=3000
NODE_ENV=production
DB_PATH=./database/food_delivery.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
VITE_API_URL=https://your-app-name.onrender.com/api
CORS_ORIGIN=https://your-app-name.onrender.com
```

## Database Setup

The application uses SQLite which is perfect for Render deployment:
- Database file is created automatically
- No external database setup required
- Sample data is included

## Build Process

1. **Frontend Build**: Vite builds React app to `dist/` directory
2. **Backend**: Express server serves static files from `dist/`
3. **Single Port**: Everything runs on port 3000 in production

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 16+)
   - Ensure all dependencies are installed
   - Check for syntax errors

2. **Environment Variables**
   - Verify all required env vars are set in Render
   - Check JWT_SECRET is properly set
   - Ensure CORS_ORIGIN matches your domain

3. **Database Issues**
   - SQLite file is created automatically
   - Sample data is included in the setup

4. **CORS Errors**
   - Update CORS_ORIGIN to match your Render URL
   - Check frontend API calls use correct base URL

### Render Logs
- Check Render dashboard for build logs
- Monitor application logs for runtime errors
- Verify environment variables are loaded

## Security Notes

1. **JWT Secret**: Change the default JWT secret in production
2. **Environment Variables**: Never commit sensitive data to Git
3. **CORS**: Configure CORS properly for your domain
4. **HTTPS**: Render provides HTTPS automatically

## Performance

1. **Caching**: Static files are served efficiently
2. **Database**: SQLite is fast for small to medium applications
3. **Build Optimization**: Vite optimizes the frontend build
4. **CDN**: Render provides global CDN

## Monitoring

1. **Render Dashboard**: Monitor uptime and performance
2. **Application Logs**: Check for errors and issues
3. **Database**: Monitor SQLite file size and performance
4. **User Analytics**: Consider adding analytics tools

## Updates

To update your deployed application:
1. Push changes to GitHub
2. Render will automatically rebuild and deploy
3. Monitor the deployment logs
4. Test the updated application

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **GitHub Issues**: Report bugs in your repository
- **Community**: Check Render community forums 