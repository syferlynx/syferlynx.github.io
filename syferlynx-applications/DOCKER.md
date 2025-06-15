# Docker Setup for Syferlynx Applications

This document provides instructions for running the Syferlynx React application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

### Production Build

To build and run the production version of the application:

```bash
# Build and run using docker-compose
docker-compose up --build

# Or build and run manually
docker build -t syferlynx-app .
docker run -p 3000:80 syferlynx-app
```

The application will be available at `http://localhost:3000`

### Development Build

To run the development version with hot reloading:

```bash
# Run development version
docker-compose --profile dev up --build syferlynx-dev
```

The development server will be available at `http://localhost:3001`

## Docker Files Overview

### `Dockerfile` (Production)
- Multi-stage build for optimized production image
- Uses Node.js to build the React application
- Serves the built application using nginx
- Includes security headers and gzip compression
- Final image size is significantly smaller due to multi-stage build

### `Dockerfile.dev` (Development)
- Single-stage build for development
- Includes hot reloading support
- Mounts source code as volume for live updates
- Includes all development dependencies

### `nginx.conf`
- Custom nginx configuration for serving the React SPA
- Handles client-side routing (React Router)
- Includes performance optimizations (gzip, caching)
- Security headers for production deployment

### `docker-compose.yml`
- Orchestrates both production and development containers
- Production service runs on port 3000
- Development service runs on port 3001
- Uses profiles to separate dev and prod environments

## Available Commands

### Build Commands
```bash
# Build production image
docker build -t syferlynx-app .

# Build development image
docker build -f Dockerfile.dev -t syferlynx-app-dev .

# Build using docker-compose
docker-compose build
```

### Run Commands
```bash
# Run production container
docker run -p 3000:80 syferlynx-app

# Run development container
docker run -p 3001:3000 -v $(pwd):/app -v /app/node_modules syferlynx-app-dev

# Run using docker-compose (production)
docker-compose up

# Run using docker-compose (development)
docker-compose --profile dev up
```

### Management Commands
```bash
# Stop all containers
docker-compose down

# Remove containers and images
docker-compose down --rmi all

# View logs
docker-compose logs

# Execute commands in running container
docker-compose exec syferlynx-app sh
```

## Environment Variables

The application supports the following environment variables:

- `NODE_ENV`: Set to 'production' or 'development'
- `REACT_APP_*`: Any React environment variables (must start with REACT_APP_)

To use environment variables, create a `.env` file in the project root:

```env
REACT_APP_API_URL=https://api.example.com
REACT_APP_VERSION=1.0.0
```

## Production Deployment

### Using Docker Hub

1. Build and tag the image:
```bash
docker build -t your-username/syferlynx-app:latest .
```

2. Push to Docker Hub:
```bash
docker push your-username/syferlynx-app:latest
```

3. Deploy on server:
```bash
docker pull your-username/syferlynx-app:latest
docker run -d -p 80:80 --name syferlynx-prod your-username/syferlynx-app:latest
```

### Using Docker Compose in Production

1. Copy `docker-compose.yml` to your server
2. Run:
```bash
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port mapping in docker-compose.yml or use different ports

2. **Permission denied errors**
   - Ensure Docker has proper permissions
   - On Linux, you might need to use `sudo` or add your user to the docker group

3. **Build failures**
   - Clear Docker cache: `docker system prune -a`
   - Ensure all dependencies are properly listed in package.json

4. **Hot reloading not working in development**
   - Ensure `CHOKIDAR_USEPOLLING=true` is set in the environment
   - Check that volumes are properly mounted

### Debugging

To debug issues, you can:

1. Check container logs:
```bash
docker-compose logs syferlynx-app
```

2. Execute shell in container:
```bash
docker-compose exec syferlynx-app sh
```

3. Inspect the built image:
```bash
docker run -it --entrypoint sh syferlynx-app
```

## Performance Optimization

The production Docker setup includes several optimizations:

- Multi-stage build reduces final image size
- nginx serves static files efficiently
- Gzip compression enabled
- Static asset caching configured
- Security headers included

## Security Considerations

- The production container runs nginx as a non-root user
- Security headers are configured in nginx
- Sensitive files are excluded via .dockerignore
- Environment variables should be used for sensitive configuration

## Next Steps

- Set up CI/CD pipeline for automated builds
- Configure health checks for production deployment
- Set up monitoring and logging
- Consider using Docker secrets for sensitive data 