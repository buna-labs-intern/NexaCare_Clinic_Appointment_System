# NexaCare — Clinic Appointment Management System

A full-stack, enterprise-grade web application built for clinics to manage doctors, patients, services, and appointment scheduling with role-based access control and strict business rule enforcement.

## 🏥 Project Overview

The **Clinic Appointment Management System (NexaCare)** is designed to streamline daily clinic operations by providing structured, role-based workflows for Administrators and Receptionists:

- **Administrators**: Manage the overall system, create and activate/deactivate receptionist accounts, manage doctors and services, view analytics dashboards and operational reports.
- **Receptionists**: Handle daily front-desk workflows including patient registration, searching patient records, scheduling appointments, checking in patients, and completing visits.
- **Doctors**: Are treated as medical resources allocated to appointments (do not log into the system).

---

## 👥 Team Members

| Name | Role / Contribution |

| **Yasmin Kedir** | Full-Stack Development, Patient & Appointment Modules, System Integration |
| **Hiba Ahmedhussen** | Frontend Architecture, UI/UX, TypeScript Migration, Styling |
| **Bekur Asrat** | Backend Development, Prisma Schema, Core Validation |
| **Sosina Seifu** | Frontend Features, Schedule & Notification Management |
| **Surafel Tesfaye** | Backend API Development, Middleware & Error Handling |
| **Yeabsira Wondwosen** | Authentication, Database Setup & Security |

---

## 🛠️ Technology Stack

### Backend
- **Runtime & Framework:** Node.js, Express.js 5
- **Language:** TypeScript
- **ORM & Database:** Prisma ORM 7, PostgreSQL (Neon Serverless PostgreSQL / Local Postgres)
- **Authentication & Security:** JWT (JSON Web Tokens), `bcryptjs` password hashing, CORS
- **Validation:** Zod Schema Validation
- **Logging & Monitoring:** Winston, Morgan HTTP Logger

### Frontend
- **Framework & Tooling:** React 19, Vite, TypeScript
- **State Management & Data Fetching:** Redux Toolkit, TanStack React Query v5
- **Routing:** React Router v8 (with protected and role-based routes)
- **Forms & Validation:** React Hook Form, Zod, `@hookform/resolvers`
- **Styling & UI Components:** Tailwind CSS v4, Radix UI primitives, Lucide React Icons

---

## ⚙️ Key Features & Business Rules

### 1. Authentication & Authorization
- Secure JWT-based login with hashed password comparison.
- Role-Based Access Control (`ADMIN` vs `RECEPTIONIST`).

### 2. Clinic Operating Hours & Lunch Break Enforcement
- **Morning Session:** `09:00 AM – 12:00 PM`
- **Lunch Break:** `12:00 PM – 01:00 PM` *(strictly prevents scheduling appointments during or spanning across lunch)*
- **Afternoon Session:** `01:00 PM – 05:00 PM`

### 3. Appointment Booking Rules
- **Valid Time Range:** End time must always be later than start time (`endTime > startTime`).
- **No Past Appointments:** Start time cannot be in the past.
- **Doctor Conflict Prevention:** Prevents overlapping appointments for the same doctor.
- **Doctor & Service Status:** Inactive doctors and inactive services cannot receive new bookings.
- **Completed Appointments:** Once marked as `COMPLETED`, appointments become read-only.
- **Cancelled Appointments:** Automatically releases the doctor's time slot for new bookings.

### 4. Appointment Status Lifecycle
```text
SCHEDULED ──▶ CHECKED_IN ──▶ COMPLETED
    │
    ├──▶ CANCELLED (Slot freed)
    └──▶ NO_SHOW
```

---

## 🗄️ Database Setup & Seeding

The PostgreSQL database is structured with normalized relational entities:
- **`User`**: Administrator and Receptionist accounts with `role` and `isActive` status.
- **`Doctor`**: Medical staff with `specialty`, `phone`, and `isActive` status.
- **`Patient`**: Patients with `phone`, `gender`, `birthDate`, `address`, and `notes`.
- **`Service`**: Clinic services with `name`, `description`, `price`, `duration`, and `isActive` status.
- **`Appointment`**: Appointments linking patient, doctor, service, time slot, and lifecycle status.

### Seed Data
Run the database seed script to populate default administrative accounts, doctors, services, and patients:
```bash
cd Backend
npm run prisma:seed
```

#### Default Credentials:
- **Administrator:**
  - **Email:** `admin@hospital.com`
  - **Password:** `Admin@12345`
- **Receptionist:**
  - **Email:** `receptionist@hospital.com`
  - **Password:** `Reception@12345`

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db?schema=public"
PORT=5000
JWT_SECRET="appointment_system_jwt_secret_key_2026"
JWT_EXPIRES_IN="7d"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 📦 Installation Steps

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or later)
- **PostgreSQL** database (Local or Cloud instance e.g., Neon.tech)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/buna-labs-intern/appointment-system.git
cd appointment-system
```

### 2. Install Backend Dependencies
```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🚀 How to Run the Application

### 1. Prepare Backend Database
From the `Backend` directory:
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npx prisma db push

# Seed initial admin, receptionist, doctors, and services
npm run prisma:seed
```

### 2. Start the Backend Server
```bash
# From Backend/ directory:
npm run dev
```
*Backend API starts at: `http://localhost:5000` (Health Check: `http://localhost:5000/`)*

### 3. Start the Frontend Application
Open a second terminal window:
```bash
# From frontend/ directory:
npm run dev
```
*Frontend application starts at: `http://localhost:5173`*

---

## 🧪 Automated Testing

The backend includes an automated test suite verifying business rules, operating hours, lunch restrictions, conflict detection, password hashing, and appointment lifecycles:

```bash
cd Backend
npm test
```

### Production Build Validation
To verify TypeScript compilation and build production bundles:
```bash
# Test backend build
cd Backend
npm run build

# Test frontend build
cd ../frontend
npm run build
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT token | No |
| **GET** | `/api/auth/me` | Get current authenticated user profile | Yes |
| **GET** | `/api/users` | List all staff/users | Admin |
| **POST** | `/api/users` | Create receptionist account | Admin |
| **PUT** | `/api/users/:id` | Update receptionist account | Admin |
| **PATCH** | `/api/users/:id/activate` | Activate receptionist account | Admin |
| **PATCH** | `/api/users/:id/deactivate` | Deactivate receptionist account | Admin |
| **GET** | `/api/doctors` | Get doctors (search, filter, pagination) | Yes |
| **POST** | `/api/doctors` | Register a new doctor | Yes |
| **PUT** | `/api/doctors/:id` | Update doctor details | Yes |
| **PATCH** | `/api/doctors/:id/status` | Toggle doctor active status | Yes |
| **GET** | `/api/patients` | Get patients (search, filter, pagination) | Yes |
| **POST** | `/api/patients` | Register a new patient | Yes |
| **PUT** | `/api/patients/:id` | Update patient details | Yes |
| **GET** | `/api/services` | Get clinic services | Yes |
| **POST** | `/api/services` | Add a new clinic service | Yes |
| **PUT** | `/api/services/:id` | Update clinic service | Yes |
| **GET** | `/api/appointments` | Get appointments with filtering | Yes |
| **POST** | `/api/appointments` | Create/schedule appointment | Yes |
| **PUT** | `/api/appointments/:id` | Reschedule/update appointment | Yes |
| **PATCH** | `/api/appointments/:id/check-in` | Check in patient | Yes |
| **PATCH** | `/api/appointments/:id/complete` | Mark appointment as completed | Yes |
| **PATCH** | `/api/appointments/:id/cancel` | Cancel appointment & free slot | Yes |
| **GET** | `/api/dashboard` | Get clinic analytics and overview | Yes |
