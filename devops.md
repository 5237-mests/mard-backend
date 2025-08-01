**Docker commands** and file setup you'll need to containerize your **MARD backend (Express + MySQL + TypeORM)** app:

---

### ✅ 1. `Dockerfile` (for Node/Express app)

```Dockerfile
# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]
```

---

### ✅ 2. `docker-compose.yml`

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=password
      - DB_DATABASE=marddb
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mysql
    volumes:
      - .:/usr/src/app
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: mard_mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=marddb
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

### ✅ 3. `.env` (used by Express)

```
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=marddb
JWT_SECRET=your_jwt_secret
```

---

### ✅ 4. Docker Commands

#### Build & run containers

```bash
docker-compose up --build
```

#### Run in background

```bash
docker-compose up -d
```

#### Stop containers

```bash
docker-compose down
```

#### Rebuild the backend image

```bash
docker-compose up --build backend
```

#### Check logs

```bash
docker-compose logs -f
```

#### Clean up

```bash
docker system prune
```

---

## To connect **MySQL Workbench** to your MySQL running inside Docker, follow these steps:

---

### ✅ Step 1: Make sure your MySQL container exposes the port

In your `docker-compose.yml`, you already have this:

```yaml
mysql:
  image: mysql:8.0
  container_name: mard_mysql
  ports:
    - "3306:3306"
```

This exposes MySQL on your **localhost:3306**, making it accessible to MySQL Workbench.

---

### ✅ Step 2: Open MySQL Workbench

1. Launch **MySQL Workbench**.

2. Create a new connection with these settings:
   - **Connection Name**: MARD Local
   - **Hostname**: localhost
   - **Port**: 3306
   - **Username**: root
   - **Password**: password

3. Click **Test Connection** and then **OK**.

---

### ✅ Step 3: Verify database name

If your app uses:

```env
DB_DATABASE=marddb
```

Then in MySQL Workbench, once connected:

- You should see a schema named `marddb`.
- Inside it, you'll see tables once your app creates them (e.g., `users`, `items`, `shops`, etc.).

---

### ✅ Troubleshooting

- If MySQL Workbench can't connect:

  - Ensure Docker is running.
  - Check that `docker-compose up` is running.
  - Run `docker ps` to confirm the `mysql` container is up.
  - Try connecting to `127.0.0.1:3306` instead of `localhost`.

Note: MySQL is already secured with username and password as configured in docker-compose.yml.
