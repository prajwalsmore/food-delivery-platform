# Netlify Deployment Guide

This guide will help you deploy the food delivery platform frontend to Netlify.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Netlify account (free tier available)
3. Your backend deployed (you can use Render, Railway, or any other platform)

## Step 1: Deploy Backend First

Before deploying the frontend, you need to deploy your backend API. You can use:

- **Render**: Follow the existing `RENDER_DEPLOYMENT.md` guide
- **Railway**: Similar to Render, supports Node.js apps
- **Heroku**: Traditional platform for Node.js apps
- **DigitalOcean App Platform**: Simple container deployment

## Step 2: Deploy Frontend to Netlify

### Option A: Deploy via Netlify UI (Recommended)

1. **Go to Netlify Dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Sign up/login with your GitHub account

2. **Connect Your Repository**
   - Click "New site from Git"
   - Choose GitHub as your Git provider
   - Select your food delivery repository

3. **Configure Build Settings**
   - **Base directory**: `src/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or latest LTS)

4. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`
   - Replace `your-backend-url.com` with your actual backend URL

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd src/frontend
   netlify deploy --prod --dir=dist
   ```

## Step 3: Configure Domain and Redirects

1. **Custom Domain (Optional)**
   - Go to Site settings > Domain management
   - Add your custom domain
   - Follow Netlify's DNS instructions

2. **Environment Variables**
   - Set `VITE_API_URL` to your backend URL
   - Example: `https://your-app.onrender.com`

## Step 4: Update API Configuration

The frontend needs to know where your backend API is located. Update the environment variable:

1. **In Netlify Dashboard**
   - Go to Site settings > Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`

2. **Update netlify.toml**
   - Replace `https://your-backend-url.com` in the redirects section
   - This handles API calls during development

## Step 5: Test Your Deployment

1. **Check Frontend**
   - Visit your Netlify URL
   - Test user registration/login
   - Browse restaurants
   - Test cart functionality

2. **Check API Integration**
   - Ensure API calls work
   - Test authentication flow
   - Verify data loading

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18+ in Netlify
- Check that all dependencies are in `package.json`
- Verify build command is correct

### API Connection Issues
- Verify `VITE_API_URL` environment variable is set
- Check that backend is deployed and accessible
- Ensure CORS is configured on backend

### Routing Issues
- The `netlify.toml` includes SPA redirects
- All routes should redirect to `index.html`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-app.onrender.com` |

## File Structure for Netlify

```
src/frontend/
├── dist/           # Built files (publish directory)
├── src/            # Source code
├── package.json    # Dependencies
├── vite.config.js  # Build configuration
└── index.html      # Entry point
```

## Next Steps

1. **Monitor Performance**
   - Use Netlify Analytics
   - Check build logs for issues

2. **Set up CI/CD**
   - Netlify automatically deploys on Git pushes
   - Configure branch deployments

3. **Add Custom Domain**
   - Configure DNS settings
   - Enable HTTPS

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment) 