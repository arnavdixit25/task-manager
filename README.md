# 📋 TaskManager

> A full-stack project management web application with Kanban boards, real-time task tracking, and team collaboration.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend (Railway) | https://dynamic-renewal-production-5759.up.railway.app |
| ⚙️ Backend API (Railway) | https://task-manager-production-2788.up.railway.app |
| 🔍 Health Check | https://task-manager-production-2788.up.railway.app/api/health |

### 🔑 Demo Login Credentials
```
Email:    admin@demo.com
Password: password123
```

---

## 👤 Author & Credits

**Arnav Dixit**
- 🐙 GitHub: [@arnavdixit25](https://github.com/arnavdixit25)
- 💼 Project Repository: [github.com/arnavdixit25/task-manager](https://github.com/arnavdixit25/task-manager)

> This project was independently designed, developed, and deployed by **Arnav Dixit** from scratch.
> Every line of code, every design decision, and every feature was built by Arnav Dixit.
> Copying or reproducing this project without credit is strictly prohibited.

---

## ✨ Features

### 🔐 Authentication System
- Secure JWT-based login and signup
- Passwords hashed with bcrypt (10 salt rounds)
- Token stored in localStorage and restored on page refresh
- Auto logout when token expires or is invalid
- Protected routes — unauthenticated users are redirected to login
- Global auth state managed with Zustand

### 📊 Dashboard
- 4 real-time stat cards: Total Projects, Total Tasks, Completed Tasks, Overdue Tasks
- Recent Tasks feed showing last 5 tasks with priority and status badges
- Active Projects panel with color-coded progress bars
- All data fetched live from API using React Query with caching

### 📁 Project Management
- Create projects with custom name, description, and color
- Color-coded project cards with top border accent
- Status badges: Active, Archived, On Hold
- Member count and task count displayed per card
- Delete project with confirmation modal
- Hover animation — cards lift on mouse over

### 🗂️ Kanban Board
- 4 columns: To Do ⚡ In Progress 👁 In Review ✅ Done
- Full drag and drop between columns using @hello-pangea/dnd
- Optimistic UI updates — instant feedback before server confirms
- Card rotation and scale animation while dragging
- Hover lift effect on task cards
- Color-coded priority badges per card
- Red overdue indicator on past-due tasks
- Assignee avatar circle on each card
- Comment count shown on each card

### ✅ Task Management
- Create tasks with title, description, priority, status, due date, assignee
- Update status via dropdown directly on task detail page
- Full task detail page with all information
- Assign tasks to project members

### 💬 Comments System
- Add comments on any task
- Delete your own comments (trash icon)
- Relative timestamps — "2m ago", "3h ago", "1d ago"
- Author name and colored avatar on each comment

### 👥 Team Management
- View all members across all projects
- Role badges: Admin (purple) and Member (blue)
- Project count shown per member
- Colored gradient avatars based on name

### 🎨 UI / UX Design
- Deep navy dark theme throughout
- Inline styles for guaranteed cross-browser consistency
- Hover animations on all interactive elements
- Loading skeleton screens while data fetches
- Toast notifications for every action (success and error)
- Custom dark scrollbar
- Empty states with emoji and helpful messages
- Fully responsive layout

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | v4 | Utility styling |
| React Router | v6 | Client-side routing |
| @tanstack/react-query | v5 | Server state and caching |
| Zustand | v5 | Global auth state |
| Axios | v1 | HTTP client with interceptors |
| @hello-pangea/dnd | latest | Drag and drop Kanban |
| react-hot-toast | v2 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | v24 | Runtime |
| Express.js | v5 | Web framework |
| Prisma ORM | v5 | Database queries and schema |
| PostgreSQL | latest | Production database |
| JWT (jsonwebtoken) | v9 | Auth tokens |
| bcryptjs | v3 | Password hashing |
| Joi | v17 | Request body validation |
| Morgan | v1 | HTTP request logging |
| Helmet | v8 | Security headers |
| CORS | v2 | Cross-origin request handling |
| dotenv | v17 | Environment variable loading |

### Infrastructure & Deployment
| Service | Purpose |
|---|---|
| Railway | Frontend hosting (free tier) |
| Railway | Backend hosting (free tier) |
| Neon | Serverless PostgreSQL (free tier) |
| GitHub | Version control |

---

## 📁 Project Structure

```
task-manager/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── api/                     # API call modules
│   │   │   ├── axios.js             # Axios instance with interceptors
│   │   │   ├── auth.js              # Signup, login, getMe
│   │   │   ├── projects.js          # Project CRUD
│   │   │   ├── tasks.js             # Task CRUD + comments
│   │   │   └── dashboard.js         # Dashboard stats
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── Navbar.jsx           # Top navbar with page title
│   │   │   ├── ProtectedRoute.jsx   # Auth guard for routes
│   │   │   ├── CreateProjectModal.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   ├── StatusBadge.jsx      # Colored status pill
│   │   │   ├── PriorityBadge.jsx    # Colored priority pill
│   │   │   └── LoadingSpinner.jsx   # Fullscreen spinner
│   │   ├── pages/                   # Page-level components
│   │   │   ├── LoginPage.jsx        # Split-panel login
│   │   │   ├── SignupPage.jsx       # Split-panel signup
│   │   │   ├── DashboardPage.jsx    # Stats + recent tasks
│   │   │   ├── ProjectsPage.jsx     # Projects grid
│   │   │   ├── ProjectBoardPage.jsx # Kanban board
│   │   │   ├── TaskDetailPage.jsx   # Task detail + comments
│   │   │   ├── TeamPage.jsx         # Team members grid
│   │   │   └── NotFoundPage.jsx     # 404 page
│   │   ├── store/
│   │   │   └── authStore.js         # Zustand auth store
│   │   ├── App.jsx                  # Route definitions
│   │   └── main.jsx                 # App entry point
│   └── .env                         # VITE_API_URL
│
└── server/                          # Node.js + Express backend
    ├── src/
    │   ├── controllers/             # Business logic
    │   │   ├── authController.js    # signup, login, getMe
    │   │   ├── projectController.js # CRUD + member management
    │   │   ├── taskController.js    # CRUD + status update
    │   │   ├── commentController.js # add + delete comments
    │   │   └── dashboardController.js # stats aggregation
    │   ├── middleware/
    │   │   ├── auth.js              # JWT verification middleware
    │   │   └── validate.js          # Joi validation middleware
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── projects.js
    │   │   ├── tasks.js
    │   │   └── dashboard.js
    │   ├── utils/
    │   │   ├── jwt.js               # generateToken, verifyToken
    │   │   └── errors.js            # AppError class + global handler
    │   ├── app.js                   # Express app + middleware setup
    │   └── index.js                 # Server start
    ├── prisma/
    │   ├── schema.prisma            # Database models
    │   └── seed.js                  # Demo data seeder
    └── .env                         # Server environment variables
```

---

## 🗄️ Database Schema

```
User
├── id (cuid), email (unique), password, name, role
├── → projects       (OwnedProjects relation)
├── → projectMembers (ProjectMember[])
├── → tasks          (AssignedTasks relation)
└── → comments       (Comment[])

Project
├── id, name, description, color, status, ownerId, createdAt, updatedAt
├── → owner   (User)
├── → members (ProjectMember[])
└── → tasks   (Task[])

ProjectMember
├── id, userId, projectId, role, joinedAt
├── → user    (User)
└── → project (Project)
       Unique constraint: [userId, projectId]

Task
├── id, title, description, status, priority, dueDate
├── projectId, assigneeId, createdAt, updatedAt
├── → project  (Project)
├── → assignee (User, optional)
└── → comments (Comment[])

Comment
├── id, content, taskId, authorId, createdAt, updatedAt
├── → task   (Task)
└── → author (User)
```

---

## 🔌 API Reference

### Auth Routes
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /api/auth/signup | ❌ No | Create new account |
| POST | /api/auth/login | ❌ No | Login and get token |
| GET | /api/auth/me | ✅ Yes | Get logged in user |

### Project Routes
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/projects | ✅ Yes | Get all user projects |
| POST | /api/projects | ✅ Yes | Create new project |
| GET | /api/projects/:id | ✅ Yes | Get single project with members and tasks |
| PUT | /api/projects/:id | ✅ Yes | Update project (Owner/Editor only) |
| DELETE | /api/projects/:id | ✅ Yes | Delete project (Owner only) |
| POST | /api/projects/:id/members | ✅ Yes | Add member by email (Owner only) |

### Task Routes
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/tasks?projectId= | ✅ Yes | Get all tasks for a project |
| POST | /api/tasks | ✅ Yes | Create new task |
| GET | /api/tasks/:id | ✅ Yes | Get single task with comments |
| PUT | /api/tasks/:id | ✅ Yes | Update task fields |
| DELETE | /api/tasks/:id | ✅ Yes | Delete task |
| PATCH | /api/tasks/:id/status | ✅ Yes | Update task status only |
| POST | /api/tasks/:id/comments | ✅ Yes | Add comment to task |
| DELETE | /api/tasks/:taskId/comments/:id | ✅ Yes | Delete own comment |

### Dashboard Routes
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/dashboard | ✅ Yes | Get all stats for logged in user |

---

## 🧪 API Tests (Thunder Client)

All APIs were tested using Thunder Client inside VS Code.

### POST /api/auth/signup — 201 Created


![Signup API Test](screenshots/api-signup.png)



### POST /api/auth/login — 200 OK


![Login API Test](screenshots/api-login.png)



### GET /api/auth/me — 401 Unauthorized (no token)


![Get Me No Token](screenshots/api-me-no-token.png)



### GET /api/auth/me — 200 OK (with token)


![Get Me With Token](screenshots/api-me-with-token.png)



### GET /api/projects — 200 OK


![Get Projects](screenshots/api-get-projects.png)



### POST /api/projects — 201 Created


![Create Project](screenshots/api-create-project.png)



### GET /api/projects/:id — 200 OK


![Get Single Project](screenshots/api-get-single-project.png)



### POST /api/tasks — 201 Created


![Create Task](screenshots/api-create-task.png)



### GET /api/dashboard — 200 OK


![Dashboard Stats](screenshots/api-dashboard.png)



---

## 🚀 Local Setup Guide

### Prerequisites
- Node.js v18 or higher
- Git
- A PostgreSQL database (Neon free tier recommended)

### Step by Step

```bash
# Step 1 — Clone the repository
git clone https://github.com/arnavdixit25/task-manager.git
cd task-manager

# Step 2 — Install server dependencies
cd server
npm install

# Step 3 — Create server/.env file
# Add these variables:
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
NODE_ENV="development"

# Step 4 — Push database schema
npx prisma db push

# Step 5 — Seed demo data
node prisma/seed.js

# Step 6 — Start backend server
npm run dev
# Server runs on http://localhost:5000

# Step 7 — Open new terminal and install client dependencies
cd ../client
npm install

# Step 8 — Create client/.env file
VITE_API_URL=http://localhost:5000/api

# Step 9 — Start frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Demo Accounts After Seeding
```
Admin:  admin@demo.com  / password123
Alice:  alice@demo.com  / password123
Bob:    bob@demo.com    / password123
```

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (10 salt rounds) — never stored as plain text
- **JWT tokens** signed with secret key, expire after 7 days
- **Helmet.js** sets secure HTTP headers on all responses
- **CORS** configured to only allow trusted frontend origins
- **Joi validation** on all POST/PUT request bodies
- **Role-based access control** — only project owners can delete, only editors can update
- Token verified on every protected API call via middleware
- 401 response on missing or invalid tokens, 403 on insufficient permissions

---

## 🚀 Deployment Guide

### Database — Neon (Free)
1. Create account at neon.tech
2. Create new project
3. Copy the PostgreSQL connection string
4. Run `npx prisma db push` with that connection string

### Backend — Railway (Free)
1. Create a new railway service
2. Connect GitHub repo
3. Root Directory: `server`
4. Build Command: `npm install && npx prisma generate`
5. Start Command: `node src/index.js`
6. Add environment variables: DATABASE_URL, JWT_SECRET, NODE_ENV, PORT

### Frontend — Railway (Free)
1. Create a new railway service
2. Connect GitHub repo
3. Root Directory: `client`
4. Build Command: `npm install && npm run build`
5. Start Command: `serve -s dist -l$PORT`
6. Framework: Vite
7. Add environment variable: VITE_API_URL = your Render URL + /api

---

## 📝 License & Copyright

```
Copyright © 2026 Arnav Dixit (@arnavdixit25)
All Rights Reserved.

This project and its source code are the intellectual property of Arnav Dixit.
You may view and reference this project for learning purposes only.

The following are strictly prohibited without written permission:
- Copying or reproducing the source code
- Modifying and redistributing this project
- Claiming ownership or authorship of this project
- Using this project for commercial purposes

GitHub: https://github.com/arnavdixit25
Project: https://github.com/arnavdixit25/task-manager
```

---

Built with ❤️ by Arnav Dixit(arnavdixit25)

🚀 Live Frontend:
https://dynamic-renewal-production-5759.up.railway.app

⚙️ Live Backend:
https://task-manager-production-2788.up.railway.app