# Servo Campus Service Marketplace: Deployment Guide

This guide details the step-by-step instructions for deploying the **Servo** web application to production.

---

## Deployment Option A: Self-Hosted Docker Compose (Recommended for VPS)

This is the easiest path for hosting on a single Virtual Private Server (VPS) (e.g., DigitalOcean, AWS EC2, Linode, Hetzner) running Linux (Ubuntu recommended).

### Prerequisites
* A VPS instance with Docker and Docker Compose installed.
* A domain name pointing to your VPS IP address (e.g., `servo.yourdomain.com`).
* Ports `80` and `443` open in your server firewall.

### Step-by-Step Instructions

1. **Clone the Repository on the VPS**:
   ```bash
   git clone <your-repository-url> /var/www/servo
   cd /var/www/servo
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (or update the backend environment block in `docker-compose.yml`):
   ```env
   # Database connection string (points to the 'db' container name in the compose network)
   DATABASE_URL=postgresql://postgres:postgres@db:5432/servo
   
   # JWT Config
   JWT_SECRET=generate-a-strong-random-key-here-123456
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=120
   
   # Gemini AI API Key (from Google AI Studio)
   GEMINI_API_KEY=AIzaSy...
   
   # Supabase Storage Configuration (optional, falls back to local storage)
   SUPABASE_URL=
   SUPABASE_KEY=
   SUPABASE_BUCKET=servo-storage
   ```

3. **Start the Docker Containers**:
   Execute the build and run daemon command:
   ```bash
   docker compose up -d --build
   ```
   This builds:
   * **`servo_db`**: Postgres database container with persistent volume storage.
   * **`servo_backend`**: FastAPI backend exposing API endpoints on container port `8000`.
   * **`servo_frontend`**: Nginx web server containing the pre-compiled React SPA assets. Nginx intercepts incoming port `80` requests, routes requests under `/` to static React files, and proxies `/api/` and WebSockets upgrades `/api/chat/ws/` to the backend container.

4. **Configuring SSL (HTTPS) via Let's Encrypt**:
   To secure your site with HTTPS, you can configure Nginx on the host server or install **Certbot** and configure a reverse proxy from the host machine to port `3000` (where the frontend container is exposed).
   
   On Ubuntu:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```
   Set up a virtual host config on the host system to route requests to the Docker container on port `3000`, and then run:
   ```bash
   sudo certbot --nginx -d servo.yourdomain.com
   ```

---

## Deployment Option B: Managed Cloud Platforms (Serverless & Free-Tiers)

If you do not want to manage a server, you can deploy each part of the stack to completely free and managed cloud services.

### 1. Database Setup (Supabase)
1. Go to [Supabase](https://supabase.com) and create a free project.
2. Under **Project Settings** -> **Database**, copy the **Transaction Connection String** (URI format starting with `postgresql://`).
3. Set the password and replace `[YOUR-PASSWORD]` in the connection string.

### 2. Backend API Setup (Render / Fly.io / Railway)
We will use **Render** as an example:
1. Go to [Render](https://render.com) and sign up/log in.
2. Click **New** -> **Web Service** and connect your GitHub repository.
3. Configure the following parameters:
   * **Root Directory**: `backend`
   * **Runtime**: `Python`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Go to the **Environment** tab and add the following Environment Variables:
   * `DATABASE_URL`: *(Your Supabase connection URI)*
   * `JWT_SECRET`: *(A random secure string)*
   * `JWT_ALGORITHM`: `HS256`
   * `GEMINI_API_KEY`: *(Your Google Studio API key)*
5. Click **Deploy Web Service**.
6. Once deployed, copy your backend's public HTTPS URL (e.g., `https://servo-api.onrender.com`).

### 3. Frontend Web Hosting (Vercel / Netlify)
We will use **Vercel** as an example:
1. Go to [Vercel](https://vercel.com) and connect your GitHub repository.
2. Click **Import** on the project.
3. Configure the project parameters:
   * **Framework Preset**: `Vite` (or `Other`)
   * **Root Directory**: `frontend`
4. Go to **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: *(Your backend Render URL, e.g., `https://servo-api.onrender.com`)*
5. Click **Deploy**. Vercel will build your React bundle and provide a free `.vercel.app` domain.

---

## Seeding & Initial Database Setup

* **Auto-Initialization**: The FastAPI backend includes automatic table creation and data seeding logic in its startup sequence. Upon launching, it queries the database: if the database has zero users, it automatically runs schema creations and inserts sample students (Rahul, Priya, Amit), skills, and example services.
* **Testing / Validation**: You can access `/docs` on the backend API URL (e.g. `https://servo-api.onrender.com/docs`) to interact with the Swagger UI documentation and test endpoints.
