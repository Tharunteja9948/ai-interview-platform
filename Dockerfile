# ==============================================================================
# Multi-Stage Dockerfile for Self-Learning AI Interview Platform
# Stage 1: Build React Production Static Bundle
# Stage 2: Serve Unified FastAPI + React Web Application
# ==============================================================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# Stage 2: Production Python Backend & Web Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and dataset seeds
COPY backend ./backend
COPY seed_roles.py check_db_roles.py ./

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Initialize/seed database if needed
RUN python seed_roles.py

# Set dynamic port environment variable (Render / Cloud Run / Railway)
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port "]
