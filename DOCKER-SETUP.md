# Docker Self-Hosting Guide for Cut & Track MRP

This guide explains how to run the MRP application locally using Docker, providing a complete self-hosted solution with Supabase.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose installed
- Git (to clone the repository)

## Quick Start

1. Start the application stack:

```bash
docker-compose up -d
```

2. Initialize the database (first time only):

```bash
docker-compose exec app sh -c "npm run supabase:init"
```

3. Access the application:
   - Web App: http://localhost:8080
   - Supabase Studio: http://localhost:54326

## Services

The Docker setup includes:

| Service | Description | Port |
|---------|-------------|------|
| app | React application | 8080 |
| supabase-db | PostgreSQL database | 54322 |
| supabase-api | Postgres Meta API | 54323 |
| supabase-auth | Authentication service | 54324 |
| supabase-rest | RESTful API | 54321 |
| supabase-storage | Storage service | 54325 |
| supabase-studio | Admin interface | 54326 |

## Switching Between Lovable and Local Development

### Using Lovable AI
No changes needed - the application automatically detects your environment. When accessed via Lovable, it will use the Lovable Supabase instance.

### Using Local Docker Setup
When running locally with Docker, the application will automatically connect to your local Supabase instance.

## Troubleshooting

### Vector Extension Issues
If you encounter issues with the vector extension:

1. Access the PostgreSQL container:
```bash
docker-compose exec supabase-db bash
```

2. Connect to the database:
```bash
psql -U postgres
```

3. Enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Database Reset

If you need to reset the database:

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app sh -c "npm run supabase:init"
```

## Data Migration

To move data between Lovable and your local instance:

1. Export data from source:
```bash
npx supabase db dump -f data_dump.sql
```

2. Import into target:
```bash
cat data_dump.sql | docker-compose exec -T supabase-db psql -U postgres
```

## Production Deployment

This Docker setup is intended for local development. For production, consider:

1. Using managed Supabase
2. Configuring proper authentication
3. Setting up backups
4. Using a reverse proxy (Nginx/Traefik)
5. Adding SSL certificates
