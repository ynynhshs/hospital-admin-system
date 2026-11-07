# MedAdmin Pro - Hospital Administration, Human Resources & Reporting System

A comprehensive, production-grade Hospital Administration, HR, Facility Leak Detection, Attendance, Leave, Employee Records, Audit Trail, and Reporting System built with **React.js (Vite)** on the frontend, **Node.js with Express.js** on the backend, and **MongoDB Atlas with Mongoose** for database persistence.

---

## 🏥 System Modules

1. **Dashboard & Clinical Overview**:
   - High-level KPIs: Total staff, active personnel, on-leave count, active water leak incidents, pending leave requests, today's attendance rate.
   - Departmental staffing breakdowns and facility alerts.
   - Live audit activity timeline.

2. **Leak Detection & Facility Plumbing**:
   - Comprehensive monitoring of hospital plumbing, chilled water piping, steam condensate lines, fire mains, and graywater drainage.
   - Full CRUD: Log leak incidents, assign technicians, categorize severity (`Low`, `Medium`, `High`, `Critical`), track status (`Detected`, `Investigating`, `Repair In Progress`, `Resolved`, `Closed`).
   - Track water loss per hour, equipment risk (e.g. proximity to MRI, dialysis units, OR suites), and emergency water shutoff requirements.

3. **Human Resources Management**:
   - Complete employee profile management: contact details, department, clinical role, position, employment type, shift, salary, emergency contacts, blood group.
   - Real-time search, department filtering, status filters (`Active`, `On Leave`, `Terminated`).

4. **Attendance Management**:
   - Real-time Clock-In and Clock-Out actions for staff.
   - Supervisor log override with time-in, time-out, status (`Present`, `Late`, `Absent`, `Half Day`, `On Leave`), work hours, and overtime calculations.
   - Daily attendance summaries and timesheet histories.

5. **Leave Management**:
   - Leave applications for Annual, Sick, Maternity, Emergency, Casual, and Study/Conference leaves.
   - Multi-step approval/rejection workflows with reviewer remarks and audit logging.
   - Automatic synchronization with employee active/on-leave status.

6. **Employee Records & Compliance**:
   - Medical licenses, BLS/ACLS certifications, DEA registrations, employment contracts, and immunization records.
   - Expiration date tracking and compliance verification status (`Verified`, `Pending Verification`, `Expired`, `Rejected`).

7. **Reports & Printable Exports**:
   - Structured reports for Staff Census, Attendance Timesheets, Leave Utilization, Facility Leaks, and Compliance Audits.
   - Filterable by department, status, and date range.
   - Instant `@media print` printable layouts and CSV download export.

8. **Users Management & Role-Based Access Control (RBAC)**:
   - Account creation, credential updates, status toggles (`Active`, `Suspended`, `Inactive`).
   - Roles: `SuperAdmin`, `Admin`, `HR Manager`, `Facility Manager`, `Staff`.

9. **Audit Trail**:
   - Immutable security audit logs recording every `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `APPROVE`, `REJECT`, and `EXPORT` action with user identity, role, timestamp, module, and IP address.

---

## 🔑 Default Administrator & Seed Accounts

The system comes pre-seeded with baseline accounts:

| Role | Username / Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `admin` / `admin@hospital.org` | `Admin123!Secure` | Full unconditional system access & user management |
| **HR Manager** | `hrmanager` / `hrmanager@hospital.org` | `HrManager123!` | Employees, Attendance, Leaves, Records, Reports |
| **Facility Manager** | `facilitymgr` / `facility@hospital.org` | `Facility123!` | Leak Detection, Facilities, Equipment Risk, Maintenance |
| **Staff (Nurse)** | `sarahnurse` / `nurse@hospital.org` | `Staff123!` | Self-attendance, Leave application, Leak reporting |

---

## 🚀 Setup & Execution

### 1. Prerequisites
- Node.js >= 18
- (Optional) MongoDB Atlas Connection URI or local MongoDB daemon. If no MongoDB Atlas URI is configured, the system uses its built-in resilient persistent storage engine out of the box.

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secure_hospital_jwt_secret_2026_xyz
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hospital_admin_db?retryWrites=true&w=majority
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Run the Application
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 📂 Architecture
```
├── backend/
│   ├── config/          # MongoDB Atlas Mongoose connection & fallback status
│   ├── controllers/     # Express route controllers for all 9 modules
│   ├── middleware/      # JWT auth, RBAC permissions, and audit logging
│   ├── models/          # Mongoose Schemas (User, Employee, Department, Leak, Attendance, Leave, Record, AuditLog)
│   ├── routes/          # REST API endpoints
│   ├── seed.ts          # Standalone seed script
│   └── storage.ts       # Unified data access layer supporting Atlas & persistent store
├── src/
│   ├── api/             # Axios API client with auth interceptors
│   ├── components/      # Reusable UI components (Sidebar, Header, Modals, Badges, Tables)
│   ├── context/         # AuthContext with persistent JWT state
│   ├── pages/           # Pages for all modules (Dashboard, HR, Leaks, Attendance, Leaves, Records, Reports, Users, Audit)
│   └── types/           # TypeScript interfaces
├── server.ts            # Express server entry point mounting API and Vite middleware
└── package.json
```
