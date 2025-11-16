# ZNHS AIMS - Production Deployment Guide

This guide will help you deploy the ZNHS Academic Information Management System to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A MongoDB database (MongoDB Atlas recommended for production)
3. Git repository with your code

## Deployment Steps

### 1. Prepare MongoDB Database

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is available)
3. Create a database user with read/write permissions
4. Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs - less secure but easier)
5. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/znhs_aims?retryWrites=true&w=majority`)

### 2. Deploy Backend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your Git repository
3. Configure the service:
   - **Name**: `znhs-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter (or higher for production)

4. Set Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/znhs_aims?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_generate_a_strong_random_string_here
   FRONTEND_URL=https://your-frontend-app.onrender.com
   API_URL=https://your-backend-app.onrender.com
   ```

   **Important**: 
   - Generate a strong JWT_SECRET (you can use: `openssl rand -base64 32`)
   - Replace `your-frontend-app.onrender.com` with your actual frontend URL (set this after deploying frontend)
   - Replace `your-backend-app.onrender.com` with your actual backend URL

5. Click "Create Web Service"
6. Wait for deployment to complete
7. Note your backend URL (e.g., `https://znhs-backend.onrender.com`)

### 3. Deploy Frontend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your Git repository
3. Configure the service:
   - **Name**: `znhs-frontend`
   - **Environment**: `Node`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter (or higher for production)

4. Set Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com/api
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-app.onrender.com
   ```

   **Important**: Replace `your-backend-app.onrender.com` with your actual backend URL from step 2.

5. Click "Create Web Service"
6. Wait for deployment to complete
7. Note your frontend URL (e.g., `https://znhs-frontend.onrender.com`)

### 4. Update Backend CORS Configuration

1. Go back to your backend service in Render
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL:
   ```
   FRONTEND_URL=https://znhs-frontend.onrender.com
   ```
3. Save and redeploy (or the service will auto-redeploy)

### 5. Seed Initial Data (Optional)

If you need to seed initial data:

1. You can temporarily add a seed script to your backend service
2. Or use MongoDB Compass/Atlas UI to import data
3. Or create an admin user manually through the registration endpoint

### 6. Verify Deployment

1. Visit your frontend URL
2. Try to register/login
3. Check browser console for any errors
4. Verify API calls are working

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Render sets this automatically) | `10000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://znhs-frontend.onrender.com` |
| `API_URL` | Backend API URL | `https://znhs-backend.onrender.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://znhs-backend.onrender.com/api` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend base URL for file serving | `https://znhs-backend.onrender.com` |

## Important Notes

1. **File Storage**: Render's file system is ephemeral. Uploaded files (avatars, materials, submissions) will be lost on redeploy. Consider using:
   - AWS S3
   - Cloudinary
   - Render Disk (persistent storage addon)

2. **Database**: Use MongoDB Atlas for production. The free tier is sufficient for small to medium applications.

3. **Auto-Deploy**: Render automatically deploys on every push to your main branch. You can disable this in settings.

4. **Custom Domain**: You can add a custom domain in Render settings.

5. **SSL/HTTPS**: Render provides free SSL certificates automatically.

6. **Sleep Mode**: Free tier services sleep after 15 minutes of inactivity. Consider upgrading to a paid plan for production.

## Troubleshooting

### Backend Issues

- **Connection refused**: Check MongoDB URI and network access
- **CORS errors**: Verify `FRONTEND_URL` matches your frontend URL exactly
- **JWT errors**: Ensure `JWT_SECRET` is set and consistent

### Frontend Issues

- **API calls failing**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Images not loading**: Check `NEXT_PUBLIC_BACKEND_URL` and CORS settings
- **Build errors**: Check Node version compatibility (Render uses Node 18 by default)

### Common Solutions

1. **Clear build cache**: In Render dashboard → Settings → Clear build cache
2. **Check logs**: View deployment and runtime logs in Render dashboard
3. **Redeploy**: Sometimes a redeploy fixes issues

## Security Checklist

- [ ] Use strong JWT_SECRET (at least 32 characters, random)
- [ ] Use MongoDB Atlas with proper authentication
- [ ] Restrict MongoDB network access to Render IPs (if possible)
- [ ] Enable HTTPS only (Render does this automatically)
- [ ] Review and update CORS settings
- [ ] Set up proper file storage (S3/Cloudinary) for production
- [ ] Regular backups of MongoDB database
- [ ] Monitor logs for suspicious activity

## Support

For issues specific to:
- **Render**: Check Render documentation or support
- **MongoDB**: Check MongoDB Atlas documentation
- **Application**: Check application logs and error messages

