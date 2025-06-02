# Docker Setup for Cut-and-Track MRP

This directory contains all Docker-related files for the ITAR-compliant Cut-and-Track MRP application.

## File Organization

- `Dockerfile` - Base Dockerfile for the application
- `Dockerfile.client` - Dockerfile for the client application
- `Dockerfile.dev.client` - Development Dockerfile for the client
- `docker-compose.yml` - Production Docker Compose configuration
- `docker-compose.dev.yml` - Development Docker Compose configuration

## Running Docker Commands

All Docker commands have been updated in package.json to use the new file paths. Use the following npm scripts:

```bash
# Production environment
npm run docker:build   # Build all Docker images
npm run docker:up      # Start all containers
npm run docker:down    # Stop all containers
npm run docker:logs    # View logs from all containers

# Development environment
npm run docker:dev:up        # Start dev containers
npm run docker:dev:down      # Stop dev containers
npm run docker:dev:logs      # View dev container logs
npm run docker:dev:rebuild   # Rebuild and start dev containers
```

## Important Notes

1. This Docker setup is designed for ITAR compliance with no external/cloud dependencies
2. All services are configured to run locally with no data leaving the network
3. Tailwind CSS build process is automatically run during Docker build
4. The application uses local PostgreSQL database instead of Supabase

## Troubleshooting

If you encounter styling issues:
1. Check that '@tailwindcss/postcss' is properly installed and configured
2. Verify both postcss.config.js and postcss.config.cjs exist
3. Ensure the tailwind.build.js script is running correctly

For authentication issues:
1. Ensure the local auth system is properly initialized with `npm run auth:init`
2. Check database connection parameters in the Docker Compose files
