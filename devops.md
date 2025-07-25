**Docker commands** and file setup you'll need to containerize your **MARD backend (Express + MongoDB + Mongoose)** app:

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
      - MONGO_URI=mongodb://mongo:27017/marddb
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo
    volumes:
      - .:/usr/src/app
    restart: unless-stopped

  mongo:
    image: mongo:6
    container_name: mard_mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

### ✅ 3. `.env` (used by Express)

```
PORT=5000
MONGO_URI=mongodb://mongo:27017/marddb
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

## To connect **MongoDB Compass** to your MongoDB running inside Docker, follow these steps:

---

### ✅ Step 1: Make sure your Mongo container exposes the port

In your `docker-compose.yml`, you already have this:

```yaml
mongo:
  image: mongo:6
  container_name: mard_mongo
  ports:
    - "27017:27017"
```

This exposes MongoDB on your **localhost:27017**, making it accessible to Compass.

---

### ✅ Step 2: Open MongoDB Compass

1. Launch **MongoDB Compass**.

2. In the **Connection String** field, enter:

   ```
   mongodb://localhost:27017
   ```

3. Click **Connect**.

---

### ✅ Step 3: Verify database name

If your app uses:

```env
MONGO_URI=mongodb://mongo:27017/marddb
```

Then in Compass, once connected:

- You should see a database named `marddb`.
- Inside it, you'll see collections once your app creates them (e.g., `users`, `projects`, etc.).

---

### ✅ Troubleshooting

- If Compass can’t connect:

  - Ensure Docker is running.
  - Check that `docker-compose up` is running.
  - Run `docker ps` to confirm the `mongo` container is up.
  - Try connecting to `127.0.0.1:27017` instead of `localhost`.

Let me know if you'd like to secure MongoDB with a username and password.
