# Docker Setup for Kodero

This project includes Docker configurations for both development and production environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Production Build

1. Build and run the production container:
```bash
docker-compose up -d
```

2. Access the application at: http://localhost:8080

3. Stop the container:
```bash
docker-compose down
```

### Development Mode

1. Run the development container with hot-reload:
```bash
docker-compose -f docker-compose.dev.yml up
```

2. Access the application at: http://localhost:5173

3. The source code is mounted as volumes, so changes will be reflected immediately.

## Available Commands

### Production Commands

```bash
# Build the image
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Development Commands

```bash
# Start development server
docker-compose -f docker-compose.dev.yml up

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Run with specific service
docker-compose -f docker-compose.dev.yml run --rm kodero-dev npm install
```

## Configuration Details

### Production Setup
- Uses multi-stage build for optimal image size
- Nginx serves static files
- Gzip compression enabled
- Security headers configured
- Health checks included

### Development Setup
- Hot-reload enabled
- Source code mounted as volumes
- Node modules preserved in container
- Port 5173 exposed for Vite

## Customization

### Change Ports

Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Change 3000 to your desired port
```

### Environment Variables

Add environment variables in `docker-compose.yml`:
```yaml
environment:
  - API_URL=https://api.example.com
  - FEATURE_FLAG=enabled
```

## Troubleshooting

### Container won't start
- Check if ports 8080 (production) or 5173 (development) are already in use
- Run `docker-compose logs` to see error messages

### Changes not reflecting in development
- Make sure you're editing files in the mounted directories
- Check if the file watchers are working: `docker-compose -f docker-compose.dev.yml logs`

### Build failures
- Clear Docker cache: `docker-compose build --no-cache`
- Ensure all dependencies are listed in package.json

## Production Deployment

For production deployment, you can:

1. Build the image locally and push to a registry:
```bash
docker build -t kodero:latest .
docker tag kodero:latest your-registry/kodero:latest
docker push your-registry/kodero:latest
```

2. Or use the docker-compose file with modifications for your environment.

## Security Considerations

- The nginx configuration includes security headers
- Only port 80 is exposed in the container
- No sensitive data is included in the image
- Consider using secrets management for any API keys or sensitive configuration