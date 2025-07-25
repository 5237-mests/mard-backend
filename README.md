# MARD - Multi-role Access Resource Dashboard

## Overview
MARD is a backend application built with Express.js and MongoDB, designed to manage user access and resources with role-based access control. This application allows users to register, log in, and manage their roles while ensuring secure access to resources.

## Features
- User registration and login
- Role-based access control
- JWT authentication
- Modular folder structure for easy maintenance

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- TypeScript
- CORS
- Morgan
- Helmet

## Project Structure
```
MARD
├── src
│   ├── app.ts
│   ├── config
│   │   └── db.ts
│   ├── controllers
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware
│   │   ├── authMiddleware.ts
│   │   └── roleMiddleware.ts
│   ├── models
│   │   └── user.ts
│   ├── routes
│   │   ├── authRoutes.ts
│   │   └── userRoutes.ts
│   ├── services
│   │   └── userService.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd MARD
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```

4. Run the application:
   ```
   npm start
   ```

## API Endpoints
### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in a user
- `POST /api/auth/logout`: Log out a user

### User Management
- `GET /api/users`: Retrieve all users
- `GET /api/users/:id`: Retrieve user details by ID
- `PUT /api/users/:id`: Update user roles

## Testing
A Postman collection is included for testing all routes. Import the collection into Postman to explore the API.

## Docker
To run the application in a Docker container, use the provided `Dockerfile` and `docker-compose.yml`. Build and run the container with:
```
docker-compose up --build
```

## Seed Data
Dummy seed data can be created using a separate script or included in the initial setup. Refer to the documentation for details on how to seed the database.

## License
This project is licensed under the MIT License.