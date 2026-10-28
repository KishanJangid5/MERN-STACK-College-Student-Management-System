# College Student Management System (MERN Stack)

A full-stack, enterprise-grade Student Management System developed using MongoDB, Express.js, React.js (with Vite), and Node.js.

Designed for university and college administrations to manage student registrations, degree courses, academic standing, and institutional statistics.

---

## 1. System Architecture & Tech Stack

* **Frontend:** React 19, Vite 8, Axios, Custom Responsive CSS Design System
* **Backend:** Node.js, Express 5, RESTful APIs, JWT Authentication, Bcrypt password hashing
* **Database:** MongoDB (`collegeDB`), Mongoose 9 ODM (`students` collection)
* **Architecture:** Decoupled Client-Server architecture with centralized API communication

---

## 2. Directory Structure

```text
FSD Project/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, login & profile
│   │   └── studentController.js  # Complete Student CRUD & aggregation stats
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── errorMiddleware.js    # Mongoose CastError & validation handler
│   ├── models/
│   │   ├── Student.js            # Student schema, indexes & validation
│   │   └── User.js               # Admin/staff user schema with bcrypt hashing
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── studentRoutes.js      # /api/students & /students routes
│   ├── .env                      # Active backend environment variables
│   ├── .env.example              # Example environment template
│   ├── package.json              # Backend dependencies & npm scripts
│   └── server.js                 # Express server entry point & CORS
├── frontend/
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx  # Deletion confirmation modal
│   │   │   ├── CourseDistributionChart.jsx # Enrollment visual bar chart
│   │   │   ├── Icons.jsx         # Clean SVG vector icons
│   │   │   ├── Navbar.jsx        # Navigation bar & auth pill
│   │   │   ├── StatsCards.jsx    # Metric cards for database analytics
│   │   │   ├── StudentDetailModal.jsx # Detailed student profile modal
│   │   │   ├── StudentFormModal.jsx   # Add/Edit student form dialog
│   │   │   ├── StudentTable.jsx  # Searchable & sortable data table
│   │   │   └── Toast.jsx         # Non-blocking notification toasts
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global authentication state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Executive statistics & enrollment metrics
│   │   │   ├── LoginPage.jsx     # Admin login with quick demo filler
│   │   │   ├── RegisterPage.jsx  # Admin registration page
│   │   │   └── StudentsPage.jsx  # Student directory with search & filters
│   │   ├── services/
│   │   │   └── api.js            # Centralized Axios client & interceptors
│   │   ├── App.jsx               # Main application container & modal router
│   │   ├── App.css               # Comprehensive UI styles
│   │   ├── index.css             # Design tokens & global typography
│   │   └── main.jsx              # React DOM root entry
│   ├── .env                      # Active frontend environment variables
│   ├── .env.example              # Example environment template
│   ├── index.html                # HTML document
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration
├── .gitignore                    # Git exclusions
└── README.md                     # Documentation & usage manual
```

---

## 3. Getting Started & Running Locally

### Step 1: Verify MongoDB is Running
Make sure MongoDB is running locally on port `27017` or prepare your MongoDB Atlas connection string:
```powershell
# Check Windows MongoDB service status
Get-Service MongoDB
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/collegeDB
JWT_SECRET=super_secret_jwt_key_college_student_management_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (`frontend/.env`):**
```ini
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start the Backend Server
In a terminal window:
```powershell
cd backend
npm run dev
# or
node server.js
```
* **Backend URL:** `http://localhost:5000`
* **Health Check:** `http://localhost:5000/api/health`

### Step 4: Start the Frontend Application
In a second terminal window:
```powershell
cd frontend
npm run dev
```
* **Frontend Application URL:** `http://localhost:5173`

---

## 4. Default Demo Administrator Credentials

For immediate testing, use the built-in quick test button on the Login page or use:
* **Email:** `admin@college.edu`
* **Password:** `password123`

---

## 5. REST API Documentation

Base URL: `http://localhost:5000/api`

### A. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new administrator or staff | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password to receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | Bearer Token |

### B. Student Management Endpoints (`/api/students`)
| Method | Endpoint | Query Parameters / Body | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/students/stats` | None | Returns aggregated totals, course distribution, and recent students | Public |
| `GET` | `/api/students` | `?search=...&course=...&status=...&sortBy=...&order=...` | Retrieve students with search & filtering | Public |
| `GET` | `/api/students/:id` | None | Retrieve single student by MongoDB ObjectId | Public |
| `POST` | `/api/students` | `{ name, email, course, age, rollNumber, phone, department, semester, gpa, status }` | Create a new student record (prevents duplicate emails) | Bearer Token |
| `PUT` | `/api/students/:id` | Fields to update | Update existing student record | Bearer Token |
| `DELETE`| `/api/students/:id` | None | Permanently delete student record | Bearer Token |

---

## 6. Testing with Postman or Curl

### 1. Test Server Health
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Login to get JWT Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password123"}'
```

### 3. Create a Student Record
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "name": "Kishan Jangid",
    "email": "kishan@college.edu",
    "course": "Computer Science",
    "age": 21,
    "rollNumber": "CS-1004",
    "phone": "+91 9876500000",
    "department": "Computer Science & Engineering",
    "semester": 5,
    "gpa": 9.4,
    "status": "Active"
  }'
```

---

## 7. Deployment Preparation

### Frontend Deployment (Vercel / Netlify / Render)
1. Build the production bundle: `npm run build` inside `frontend/`.
2. Configure the environment variable in your hosting provider:
   * `VITE_API_URL`: `https://your-backend-domain.com/api`
3. Output directory: `dist`.

### Backend Deployment (Render / Railway / Heroku)
1. Set environment variables on the cloud platform:
   * `PORT`: `5000` (or host provided port)
   * `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/collegeDB?retryWrites=true&w=majority`
   * `JWT_SECRET`: A secure 64-character random string
   * `CLIENT_URL`: `https://your-frontend-domain.com`
   * `NODE_ENV`: `production`
2. Start command: `node server.js`
