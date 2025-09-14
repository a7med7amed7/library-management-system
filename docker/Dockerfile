FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd wait-for-it && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3030

COPY <<'EOF' /app/start.sh
#!/bin/bash
set -e

echo "Starting application initialization..."

# Wait for MySQL to be ready with more robust checking
echo "Waiting for MySQL to be ready..."
wait-for-it mysql:3306 --timeout=60 --strict -- echo "MySQL is ready"

# Additional wait to ensure MySQL is fully initialized
sleep 5

echo "Initializing database..."
node /app/migrations/init-db.js

if [ $? -eq 0 ]; then
  echo "Database initialized successfully"
  echo "Running migrations..."
  cd /app && npx knex migrate:latest
  
  echo "Running seeds..."
  cd /app && npx knex seed:run
  
  echo "Starting application server..."
  cd /app/src && node server.js
else
  echo "Database initialization failed"
  exit 1
fi
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]