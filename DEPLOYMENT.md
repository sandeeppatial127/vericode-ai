# Deployment

This project deploys as two services:

- Frontend: Vercel, using the `frontend` directory.
- Backend: Render, using the `backend` directory.
- Database: MongoDB Atlas or another hosted MongoDB provider.

## 1. Rotate the exposed API key

The old OpenRouter key was previously present in frontend source and must be revoked. Create a new key in OpenRouter and add it only to Render as `OPENROUTER_API_KEY`. Never add it to frontend code or a `VITE_` variable.

## 2. Deploy the backend to Render

Create a new Render Web Service from the repository, or use the root `render.yaml` Blueprint.

For a manual service, use:

- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/health`

Set these Render environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret>
JWT_EXPIRE=7d
OPENROUTER_API_KEY=<new-openrouter-key>
OPENROUTER_MODEL=openai/gpt-oss-20b:free
FRONTEND_URL=https://<your-vercel-project>.vercel.app
```

Render supplies `PORT` automatically. Do not hard-code a production port in the application.

## 3. Deploy the frontend to Vercel

Import the repository into Vercel and configure:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Add this Vercel environment variable for the production environment:

```env
VITE_API_URL=https://<your-render-service>.onrender.com/api
```

The `frontend/vercel.json` file handles React client-side routes. The Vite development proxy is only used locally and is not needed on Vercel.

## 4. Final checks

After both services are deployed:

1. Open `https://<your-render-service>.onrender.com/health` and confirm the health response.
2. Open the Vercel URL and register a test account.
3. Test login, Analyze Code, Explain Code, Fix Code, history, and download.
4. Confirm Render logs do not show MongoDB or OpenRouter errors.
5. Confirm `FRONTEND_URL` exactly matches the Vercel origin, without a trailing slash.

Do not upload `backend/.env`. Store all production secrets in Render and Vercel project settings.
