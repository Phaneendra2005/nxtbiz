# 🚀 NxtBiz

### AI-Powered Business Operations Automation Platform

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Express](https://img.shields.io/badge/Express-4-black) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![License](https://img.shields.io/badge/License-MIT-yellow)

NxtBiz is a full-stack AI business operations platform that lets internal teams manage customers, process emails with AI intent analysis, orchestrate autonomous agents, generate PDF invoices and reports, automate workflows, and receive live notifications — all from a single React operations console.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend (Vercel) | [https://nxtbiz-client.vercel.app](https://nxtbiz-client.vercel.app) |
| ⚙️ Backend API (Render) | [https://nxtbiz-api.onrender.com](https://nxtbiz-api.onrender.com) |
| 🏥 API Health Check | [https://nxtbiz-api.onrender.com/health](https://nxtbiz-api.onrender.com/health) |

> **Note:** Backend is hosted on Render free plan. First request may take 30-60 seconds to wake up.

### 🔐 Demo Login
```
Email:    admin@nxtbiz.com
Password: Admin@12345
Role:     Admin
```

---

## 📸 Screenshots

| | |
|---|---|
| **Login Page** | **Executive Dashboard** |
| ![Login](screenshots/01-login.png) | ![Dashboard](screenshots/02-dashboard.png) |
| **Email AI Analysis** | **AI Control Center** |
| ![Email AI](screenshots/03-email-ai.png) | ![AI Agents](screenshots/04-ai-agents.png) |
| **Invoice PDF** | **Live Notifications** |
| ![Invoice](screenshots/05-invoice-pdf.png) | ![Notifications](screenshots/06-notifications.png) |
| **Workflow Builder** | **Dark Mode** |
| ![Workflows](screenshots/07-workflows.png) | ![Dark Mode](screenshots/08-dark-mode.png) |

---

## ✨ Features

- 🔐 **JWT Authentication** with refresh token rotation and HTTP-only cookies
- 👥 **Role-Based Access Control** — Admin, Manager, Employee, Viewer
- 🏢 **Customer Management** with 360 profile view and health scoring
- 📧 **Email Intelligence** — sentiment, intent, urgency, auto-response generation
- 🤖 **8 AI Agent Orchestration System:**
  - Intent Agent — classifies email intent and sentiment
  - Task Planner Agent — builds execution plan from intent
  - CRM Agent — logs activity and writes memory entries
  - Meeting Agent — auto-creates follow-up meetings
  - Invoice Agent — auto-creates draft invoices
  - Email Agent — drafts customer responses
  - Customer Support Agent — auto-creates support tickets
  - Chief Of Staff Agent — reviews and prioritizes all outputs
- 📋 **CRM Activity Timeline** per customer
- 📅 **Meeting Scheduling** with attendee management
- 🧾 **Invoice Generation** with PDF download via PDFKit
- 🎫 **Support Ticket Management** with resolution tracking
- 📊 **Weekly and Executive Report PDF Generation**
- ⚙️ **Workflow Automation Builder** with trigger, condition, action, and logs
- 🔔 **Real-time Notifications** via Socket.IO with live badge updates
- 🧠 **Long-term Memory Search** across customer and agent memory
- 📈 **Business Health Score Dashboard** with Recharts visualizations
- 🌙 **Dark Mode** support throughout

---

## 🛠️ Tech Stack

| Frontend | Backend |
|---|---|
| Vite 6 + React 18 | Node.js ES Modules |
| React Router DOM 7 | Express 4 |
| Tailwind CSS 3 | MongoDB + Mongoose 8 |
| TanStack React Query 5 | Zod Validation |
| Zustand 5 | JWT + bcryptjs |
| Axios | BullMQ + ioredis |
| Framer Motion | Socket.IO |
| Recharts | PDFKit |
| Socket.IO Client | UUID |
| react-hot-toast | helmet + compression + morgan |
| lucide-react | cookie-parser + CORS |

---

## 📁 Project Structure

```
NxtBiz/
├── client/                   # Vite React Frontend
│   ├── src/
│   │   ├── api/              # Axios client with interceptors
│   │   ├── components/       # Shared UI components
│   │   ├── pages/            # All 15 page components
│   │   ├── store/            # Zustand auth store
│   │   └── App.jsx           # Routes and layout
│   ├── .env                  # Frontend environment variables
│   └── vite.config.js
│
├── server/                   # Express Backend
│   ├── src/
│   │   ├── agents/           # 8 AI agent definitions
│   │   ├── config/           # DB, Redis, Socket.IO, env
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth, authorize, errors
│   │   ├── models/           # 14 Mongoose models
│   │   ├── routes/           # All API routes
│   │   ├── services/         # Orchestration, PDF, health
│   │   └── server.js         # Entry point
│   ├── storage/
│   │   └── pdfs/             # Generated PDF files
│   └── .env                  # Backend environment variables
│
├── screenshots/              # README screenshots
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB Atlas account or local MongoDB
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/phaneendra2005/nxtbiz.git
cd nxtbiz
```

**2. Setup the backend**
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
```

**3. Setup the frontend**
```bash
cd ../client
npm install
cp .env.example .env
# Fill in your .env values
```

**4. Start both servers**
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

**5. Open the app**
```
http://localhost:5173
```

---

## 🔑 Environment Variables

### server/.env
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nxtbiz
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

### client/.env
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login | Public |
| POST | /api/auth/refresh | Refresh token | Public |
| POST | /api/auth/logout | Logout | Required |
| GET | /api/users | List users | Admin/Manager |
| POST | /api/users | Create user | Admin only |
| PUT | /api/users/:id | Update user | Admin/Manager |
| DELETE | /api/users/:id | Delete user | Admin only |
| GET | /api/customers | List customers | Required |
| POST | /api/customers | Create customer | Required |
| GET | /api/customers/:id | Get customer | Required |
| PUT | /api/customers/:id | Update customer | Required |
| DELETE | /api/customers/:id | Delete customer | Admin only |
| POST | /api/emails/process | Process email + agents | Required |
| GET | /api/emails | List emails | Required |
| GET | /api/meetings | List meetings | Required |
| POST | /api/meetings | Create meeting | Required |
| PUT | /api/meetings/:id | Update meeting | Required |
| DELETE | /api/meetings/:id | Delete meeting | Admin only |
| GET | /api/invoices | List invoices | Required |
| POST | /api/invoices | Create invoice + PDF | Required |
| PUT | /api/invoices/:id | Update invoice | Required |
| DELETE | /api/invoices/:id | Delete invoice | Admin only |
| GET | /api/tickets | List tickets | Required |
| POST | /api/tickets | Create ticket | Required |
| PUT | /api/tickets/:id | Update ticket | Required |
| DELETE | /api/tickets/:id | Delete ticket | Admin/Manager |
| POST | /api/reports/generate | Generate report PDF | Required |
| GET | /api/reports | List reports | Required |
| GET | /api/agents | List agents | Required |
| GET | /api/agents/executions | Execution history | Required |
| POST | /api/agents/run | Manual run | Admin/Manager |
| GET | /api/workflows | List workflows | Required |
| POST | /api/workflows | Create workflow | Required |
| PUT | /api/workflows/:id | Update workflow | Required |
| DELETE | /api/workflows/:id | Delete workflow | Required |
| POST | /api/workflows/:id/execute | Execute workflow | Required |
| GET | /api/memory/search | Search memory | Required |
| GET | /api/notifications | List notifications | Required |
| PUT | /api/notifications/:id | Mark read | Required |

---

## 🤖 AI Agent Pipeline

When an email is processed via `POST /api/emails/process`, the system runs this pipeline automatically:

```
Email Received
     ↓
Intent Agent          → Analyzes sentiment, intent, urgency
     ↓
Task Planner Agent    → Builds execution plan based on intent
     ↓
Domain Agents (based on intent):
  schedule_meeting   → Meeting Agent creates follow-up meeting
  invoice_request    → Invoice Agent creates draft invoice
  support_request    → Customer Support Agent creates ticket
  sales_opportunity  → Email Agent drafts customer response
     ↓
CRM Agent             → Always runs — logs activity + memory
     ↓
Chief Of Staff Agent  → Always runs — reviews and prioritizes
     ↓
Socket.IO Notification emitted to all connected clients
```

### Intent Categories

| Intent | Triggered Agent |
|---|---|
| `schedule_meeting` | Meeting Agent |
| `invoice_request` | Invoice Agent |
| `support_request` | Customer Support Agent |
| `sales_opportunity` | Email Agent |
| `general_inquiry` | No domain agent |

---

## 🚢 Deployment

### Backend → Render

1. Go to [render.com](https://render.com) and create a Web Service
2. Connect your GitHub repository
3. Set these values:
```
Root Directory:  server
Build Command:   npm install
Start Command:   npm start
```
4. Add all environment variables from server/.env
5. Set `CLIENT_ORIGIN` to your Vercel frontend URL
6. Go to MongoDB Atlas → Network Access → Add `0.0.0.0/0`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Set these values:
```
Framework:        Vite
Build Command:    npm run build --prefix client
Output Directory: client/dist
Install Command:  npm install
```
3. Add environment variables:
```
VITE_API_URL    = https://nxtbiz-api.onrender.com
VITE_SOCKET_URL = https://nxtbiz-api.onrender.com
```

---

## 👥 Roles and Permissions

| Feature | Admin | Manager | Employee | Viewer |
|---|---|---|---|---|
| Create User | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ |
| Delete Customer | ✅ | ❌ | ❌ | ❌ |
| Delete Invoice | ✅ | ❌ | ❌ | ❌ |
| Delete Meeting | ✅ | ❌ | ❌ | ❌ |
| Delete Ticket | ✅ | ✅ | ❌ | ❌ |
| Run Agents | ✅ | ✅ | ❌ | ❌ |
| Generate Report | ✅ | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## 📄 License

MIT License — Copyright 2026 NxtBiz

---

## 👨‍💻 Author

**Phaneendra Kanduri**

- 🐙 GitHub: [@phaneendra2005](https://github.com/phaneendra2005)
- 📧 Email: kphaneendra2005@gmail.com
- 🌐 Live App: [https://nxtbiz-client.vercel.app](https://nxtbiz-client.vercel.app)

---

> Designed and developed using **Spec Driven Development** —
> a methodology where the full specification is written 
> before any code is produced.
>
> *Spec first. Code second. Ship confidently.* 🚀