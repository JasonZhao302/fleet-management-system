# Fleet Management System

A full-stack web application for RedRoad Logistics to manage vehicles, drivers, and delivery trips.

## Tech Stack

- **Frontend:** React.js, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Deployment:** AWS EC2, Nginx, PM2
- **CI/CD:** GitHub Actions

## Features

- User authentication with role-based access (Admin/Driver)
- Admin panel: full CRUD for vehicles, drivers and trips
- Driver panel: view assigned trips and update trip status
- Responsive design for driver mobile view
- Automated testing with Mocha/Chai/Sinon
- CI/CD pipeline with GitHub Actions

## Project Setup (Local Development)

### Prerequisites
- Node.js v22+
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JasonZhao302/fleet-management-system.git
cd fleet-management-system
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create `.env` file in the `backend` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

4. Start the application:
```bash
npm start
```

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5001

## Public URL

http://3.24.134.60(may change when EC2 instance restarted)

## Test Credentials

**Admin account:**
- Email: admin1@test.com
- Password: 1234

**Driver account:**
- Email: test1@gmail.com
- Password: 1234

## Running Tests
```bash
cd backend
npm test
```

## CI/CD Pipeline

The CI/CD pipeline is configured using GitHub Actions. Every push to the `main` branch automatically:

1. Pulls latest code to EC2 runner
2. Installs backend and frontend dependencies
3. Builds the React frontend
4. Runs backend test cases
5. Deploys the updated app using PM2

## Project Structure
```
fleet-management-system/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # JWT authentication
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   └── test/           # Test cases
├── frontend/
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # Auth context
│       └── pages/      # Application pages
└── .github/
    └── workflows/      # CI/CD pipeline
```
