# Environment Variables Reference

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/znhs_aims
# For production (MongoDB Atlas or Render MongoDB):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/znhs_aims?retryWrites=true&w=majority

# JWT Secret (generate a strong random string for production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
# For production:
# FRONTEND_URL=https://your-frontend-app.onrender.com

# API Base URL (for file serving)
API_URL=http://localhost:5000
# For production:
# API_URL=https://your-backend-app.onrender.com
```

## Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# For production:
# NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com/api

# Backend Base URL (for file serving - avatars, materials, etc.)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
# For production:
# NEXT_PUBLIC_BACKEND_URL=https://your-backend-app.onrender.com
```

## Production Deployment on Render

When deploying to Render, set these environment variables in the Render dashboard:

### Backend Service
- `NODE_ENV=production`
- `PORT=10000` (Render sets this automatically)
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong random string (use `openssl rand -base64 32` to generate)
- `FRONTEND_URL` - Your frontend Render URL (e.g., `https://znhs-frontend.onrender.com`)
- `API_URL` - Your backend Render URL (e.g., `https://znhs-backend.onrender.com`)

### Frontend Service
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL` - Your backend API URL with `/api` suffix (e.g., `https://znhs-backend.onrender.com/api`)
- `NEXT_PUBLIC_BACKEND_URL` - Your backend base URL (e.g., `https://znhs-backend.onrender.com`)

## Security Notes

1. **Never commit `.env` or `.env.local` files to Git**
2. **Use strong, random JWT_SECRET** (minimum 32 characters)
3. **Use MongoDB Atlas with proper authentication** for production
4. **Restrict MongoDB network access** to known IPs when possible

