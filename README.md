# FlowWise AI – Intelligent Employee Workflow & HR Management System

FlowWise AI is a MERN Stack Enterprise SaaS platform designed to automate and streamline employee workflows, leave balances, expense claim approvals, corporate asset requests, and HR verification letters.

---

## Technical Architecture Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios, TanStack Query, Framer Motion, Recharts, React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose Schemas (User, Department, WorkflowTemplate, Request, Notification, AuditLog)
- **Real-Time Communication**: Socket.IO
- **Security Protocols**: JWT Access/Refresh tokens, Password hashing, Role-based route guard shields, Express Rate-Limiters

---

## Getting Started

### 1. Database & Environment Setup
Create a `.env` file in the `backend/` directory (you can copy values from `backend/.env.example` template):
```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/flowwise_ai
JWT_SECRET=super_secret_flowwise_access_token_key_2026_jwt_token
JWT_REFRESH_SECRET=super_secret_flowwise_refresh_token_key_2026_jwt_token
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

Ensure a local MongoDB server instance is active (`mongodb://127.0.0.1:27017`).

### 2. Populate Demo Accounts (Seeding)
To seed the database with departments, default multi-level workflow configurations, pending requests, comments, audit logs, and test credentials:
```bash
cd backend
npm run seed
```

**Evaluation Logins created by seed:**
1. **Role: Employee** | Email: `employee@flowwise.com` | Password: `employeepassword123`
2. **Role: Manager** | Email: `manager@flowwise.com` | Password: `managerpassword123`
3. **Role: HR**      | Email: `hr@flowwise.com`      | Password: `hrpassword123`
4. **Role: Admin**   | Email: `admin@flowwise.com`    | Password: `adminpassword123`

---

## Project Execution Guide

### Run Backend Server
```bash
cd backend
npm run dev
```
Starts Express API endpoints and launches Socket.IO server on Port `5000`.

### Run Frontend Client
```bash
cd frontend
npm run dev
```
Launches React app on Port `5173`. Vite server is configured with route proxies forwarding `/api` and `/uploads` requests directly to Port `5000`.

---

## Testing Guide

### Backend Unit and Integration Testing
We have built an automated test runner suite testing credential encryptions, role verifications, and workflows logic:
```bash
cd backend
npm test
```
Tests will print pass/fail results directly to the console.
## Live Demo
https://hrmangament.netlify.app

## Demo Credentials
Email: demo@flowwise.com
Password: Demo@123
