# ZNHS Academic Information Management System (AIMS)

Simple, lightweight school management system for Zaragoza National High School. This repository contains a Node/Express backend (API) and a Next.js frontend.

Getting started (quick):

- Backend:
    - cd backend
    - copy `.env.example` (or create `.env`) and set `MONGODB_URI` and `JWT_SECRET`
    - npm install
    - npm run dev

- Frontend:
    - cd frontend
    - npm install
    - create `.env.local` and set `NEXT_PUBLIC_API_URL` (e.g. http://localhost:5000/api)
    - npm run dev

Notes:
- Seed scripts are available in `backend/` (e.g. `seed.js`, `seed-updated.js`, `seed-minimal.js`) for demo data. The admin/demo password used by the seed scripts may differ depending on which script was run.
- Do not store production secrets in the repository. Use environment variables or your deployment platform's secret manager.

That's it — this README is intentionally brief. For detailed backend API docs, check the `backend` folder source and the route files.

Contact: project maintainer

