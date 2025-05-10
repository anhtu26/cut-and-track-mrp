@echo off
echo ===================================================
echo Cut-and-Track MRP Local ITAR-Compliant Deployment
echo ===================================================
echo.
echo This script will deploy the Cut-and-Track MRP application
echo to your local environment for ITAR compliance.
echo.
echo Steps:
echo 1. Stop any running containers
echo 2. Rebuild all containers with latest changes
echo 3. Start the application stack
echo 4. Verify the deployment
echo.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

echo.
echo Stopping any running containers...
docker-compose down -v

echo.
echo Rebuilding containers with latest changes...
docker-compose build

echo.
echo Starting the application stack...
docker-compose up -d

echo.
echo Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak > nul

echo.
echo Checking service status...
docker-compose ps

echo.
echo Verifying database connection...
docker-compose exec api-server node -e "const db = require('./db'); db.testConnection().then(connected => { console.log('Database connection:', connected ? 'SUCCESS' : 'FAILED'); process.exit(connected ? 0 : 1); });"

echo.
echo Deployment complete! The application should be available at:
echo.
echo   Frontend: http://localhost:8081
echo   API Server: http://localhost:3002
echo.
echo For logs, use: docker-compose logs -f
echo To stop the application, use: docker-compose down
echo.
echo ===================================================
