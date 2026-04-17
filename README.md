# 🎓 DOTE Admission Management System

> **Government Polytechnic College Admissions Portal** — Tamil Nadu | Full-Stack MERN Application
> 
> A production-ready, scalable admission management platform serving Tamil Nadu's government polytechnic colleges with integrated payment processing, multi-role authentication, and comprehensive reporting.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Application Flow](#-application-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack-detailed)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Security & Authentication](#-security--authentication)
- [DevOps & Deployment](#-devops--deployment)
- [Optimization Suggestions](#-project-optimization-suggestions)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

### Problem Statement
Government polytechnic colleges in Tamil Nadu needed a unified, digital admission platform to:
- Streamline student applications across multiple colleges
- Centralize payment processing and verification
- Enable real-time application tracking
- Provide college staff and administrators with comprehensive reporting and analytics
- Reduce manual paperwork and processing time

### Solution
**DOTE Admission Management System** — A full-stack web application that digitizes the entire admission lifecycle:
- **Students**: Apply online, track status, make payments securely
- **College Staff**: Verify applications, manage intake, generate reports
- **Administrators**: Manage colleges, users, master data, and system-wide analytics

### Key Benefits
| Stakeholder | Benefit |
|---|---|
| **Students** | 24/7 online application, instant status updates, secure payments |
| **Colleges** | Automated verification workflow, real-time reporting |
| **Administrators** | Centralized management, analytics dashboard, data integrity |

---

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    Client["🌐 Client Layer<br/>React 18 + Vite"]
    API["🔌 API Gateway<br/>Express.js + Helmet"]
    Auth["🔐 Authentication<br/>JWT + bcrypt"]
    Business["⚙️ Business Logic<br/>Controllers + Services"]
    ORM["📦 ORM Layer<br/>Sequelize"]
    Database["🗄️ MySQL Database<br/>14 Tables"]
    Payment["💳 CCAvenue<br/>Payment Gateway"]
    Email["📧 Nodemailer<br/>Email Service"]
    PDF["📄 Puppeteer<br/>PDF Generation"]
    
    Client -->|HTTPS CORS| API
    API --> Auth
    Auth -->|Token Validation| Business
    Business --> ORM
    ORM --> Database
    Business -->|Payment Request| Payment
    Business -->|Email Notification| Email
    Business -->|Generate PDF| PDF
    Payment -->|Webhook| Business
```

### Architecture Explanation

**Three-Tier Client-Server Architecture:**

1. **Presentation Layer (Frontend)**
   - React 18 SPA with Vite bundler
   - Redux Toolkit for state management
   - Tailwind CSS for responsive UI
   - Axios with JWT interceptor for API calls

2. **API Layer (Backend)**
   - Express.js REST API
   - Helmet for security headers
   - CORS for cross-origin requests
   - Comprehensive error handling

3. **Business Logic Layer**
   - Authentication & Authorization
   - Application processing
   - Payment integration
   - Document management
   - PDF generation
   - Email notifications

4. **Data Access Layer**
   - Sequelize ORM
   - Connection pooling
   - Transaction support

5. **Database Layer**
   - MySQL with InnoDB
   - 14 normalized tables
   - Foreign key relationships
   - Performance indexes

---

## 🔄 Application Flow

### Complete User Journey

```mermaid
flowchart TD
    Start([User Visits Portal]) --> Role{Select Role}
    
    Role -->|Student| Reg[Register with Mobile]
    Role -->|Admin/Staff| Login1[Login with Email]
    
    Reg --> OTP[Receive OTP via Email]
    OTP --> Verify[Verify OTP & Set Password]
    Verify --> StudentDash[Student Dashboard]
    
    StudentDash --> Form[Start Application Form]
    Form --> Step1[Step 1: Personal Details]
    Step1 --> Step2[Step 2: Contact Details]
    Step2 --> Step3[Step 3: Parent Details]
    Step3 --> Step4[Step 4: Academic History]
    Step4 --> Step5[Step 5: Marks Entry]
    Step5 --> Step6[Step 6: College Choice]
    Step6 --> Step7[Step 7: Special Category]
    Step7 --> Step8[Step 8: Documents & Preview]
    
    Step8 --> Submit{Submit & Pay?}
    Submit -->|Save as Draft| Draft[Application Saved]
    Submit -->|Submit| Payment[Initiate Payment]
    
    Payment --> CCAvenue[CCAvenue Payment Gateway]
    CCAvenue --> PaymentResult{Payment Status}
    PaymentResult -->|Success| Paid[Payment Recorded]
    PaymentResult -->|Failed| PaymentFail[Payment Failed - Retry]
    PaymentFail --> Payment
    
    Paid --> Verification[College Verifies Application]
    Verification --> Approved{Approved?}
    Approved -->|Yes| Allocated[Seat Allocated]
    Approved -->|No| Rejected[Application Rejected]
    
    Allocated --> Status[View Final Status & Download Admit]
    Rejected --> Status
    Draft --> Status
    
    Login1 --> AdminDash[Admin/College Dashboard]
    AdminDash --> ApprovalQueue[View Pending Applications]
    ApprovalQueue --> Review[Review & Verify]
    Review --> GenerateReports[Generate Reports & Analytics]
    
    Status --> End([Process Complete])
    GenerateReports --> End
```

### Sequence Diagram: Student Registration & Login

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant A as API Server
    participant DB as Database
    participant E as Email Service
    
    S->>F: Click Register
    F->>A: POST /auth/register (mobile, email)
    A->>DB: Check if mobile exists
    DB-->>A: Mobile status
    A->>E: Send OTP via email
    E-->>S: OTP received
    A-->>F: OTP sent message
    F-->>S: Show OTP verification screen
    
    S->>F: Enter OTP & Password
    F->>A: POST /auth/verify-otp (mobile, otp, password)
    A->>DB: Verify OTP & update student
    DB-->>A: Success
    A->>A: Generate JWT tokens
    A-->>F: Access Token + Refresh Token
    F->>F: Store tokens in memory/cookie
    F-->>S: Redirect to Dashboard
```

### Sequence Diagram: Application Submission & Payment

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant CC as CCAvenue
    participant N as Notification
    
    S->>F: Complete application form
    F->>B: PUT /applications/:id (form data)
    B->>DB: Update application draft
    DB-->>B: Updated
    B-->>F: Draft saved
    
    S->>F: Click Submit & Pay
    F->>B: POST /applications/:id/submit
    B->>DB: Change status to SUBMITTED
    B->>B: Create payment order
    B->>DB: Store order details
    B-->>F: Get payment gateway link
    
    F->>S: Redirect to CCAvenue
    S->>CC: Complete payment
    CC->>CC: Process transaction
    CC-->>CC: Generate tracking ID
    
    CC->>B: Payment webhook (success)
    B->>DB: Update payment status
    B->>DB: Change application status to PAID
    B->>N: Send confirmation email
    N-->>S: Payment confirmed
    B-->>F: Payment success callback
    F-->>S: Show success message
```

---

## ✨ Features

### 🎓 Student Features

| Feature | Description |
|---------|-------------|
| **Mobile-based Registration** | Register using mobile number with OTP verification |
| **Multi-step Application Form** | 8-step form covering all required information |
| **College Preferences** | Select and rank college preferences |
| **Real-time Status Tracking** | View application status (Draft → Submitted → Paid → Verified → Allocated) |
| **Secure Payments** | CCAvenue integration for safe, PCI-DSS compliant transactions |
| **PDF Download** | Download application as PDF for record keeping |
| **Document Upload** | Upload supporting documents (photo, marksheet, certificates) |
| **Communication** | Email notifications for every status change |

### 🏫 College Staff Features

| Feature | Description |
|---------|-------------|
| **Application Verification** | Review and verify submitted applications |
| **Document Management** | Verify uploaded documents and mark as approved |
| **College-wise Dashboard** | View only applications for their college |
| **Batch Operations** | Approve/reject multiple applications |
| **College-specific Reports** | Generate PDF reports for their college |
| **Performance Metrics** | Track application statistics |

### 👨‍💼 Administrator Features

| Feature | Description |
|---------|-------------|
| **Master Data Management** | Manage colleges, districts, communities, courses, castes |
| **User Management** | Create and manage admin and college staff accounts |
| **Fee Structure Configuration** | Set application fees by category |
| **System Dashboard** | View system-wide analytics and insights |
| **Comprehensive Reporting** | Generate reports across all colleges |
| **Academic Year Management** | Configure application periods |
| **Data Backup** | Database export and archival |

### 🔒 Advanced Features

- **Role-Based Access Control (RBAC)**: Three-tier permission system
- **Anti-Bot Protection**: OTP-based registration, rate limiting
- **Secure Authentication**: JWT with 15-min access token, 7-day refresh token
- **Transaction Security**: CCAvenue PCI-DSS compliant payments
- **Document Verification**: College staff approval workflow
- **Audit Logging**: Track all system changes
- **Responsive Design**: Mobile, tablet, and desktop support

---

## 🧰 Tech Stack (Detailed)

### Frontend

| Technology | Version | Purpose | Usage |
|---|---|---|---|
| **React** | 18.2.0 | UI Framework | Component-based SPA development |
| **Vite** | 5.0.8 | Build Tool | Fast HMR, optimized production builds |
| **Tailwind CSS** | 3.4.0 | Styling | Utility-first CSS for rapid UI development |
| **Redux Toolkit** | 2.0.1 | State Management | Centralized app state management |
| **React Router** | 6.21.1 | Routing | Client-side navigation |
| **Axios** | 1.6.0 | HTTP Client | API requests with interceptors |
| **Radix UI** | Latest | Unstyled Components | Accessible dialog, dropdown, form components |
| **Recharts** | 2.10.3 | Charts | Data visualization dashboards |
| **DnD Kit** | 6.1.0 | Drag & Drop | College preference ranking |
| **Lucide React** | 0.303.0 | Icons | UI iconography |

**Why This Stack?**
- **Vite**: 10x faster than Webpack; instant HMR
- **Tailwind**: 80% faster UI development
- **Redux Toolkit**: Simplified Redux boilerplate (we use slices)
- **Radix UI**: Accessible, unstyled components for custom design

---

### Backend

| Technology | Version | Purpose | Usage |
|---|---|---|---|
| **Node.js** | 18.x+ | Runtime | JavaScript server environment |
| **Express.js** | 4.18.2 | Web Framework | REST API development |
| **Sequelize** | 6.35.1 | ORM | MySQL object-relational mapping |
| **MySQL2** | 3.6.5 | Database Driver | Node.js MySQL connection |
| **JWT** | 9.0.2 | Authentication | Stateless token-based auth |
| **bcrypt** | 5.1.1 | Password Hashing | Secure password storage (SALT 12) |
| **Helmet** | 7.1.0 | Security | HTTP headers protection |
| **Cors** | 2.8.5 | Cross-Origin | CORS policy management |
| **Nodemailer** | 6.9.7 | Email Service | SMTP email notifications |
| **Puppeteer** | 21.6.0 | PDF Generation | Headless browser for PDF creation |
| **Multer** | 1.4.5 | File Upload | Multipart form data handling |
| **Joi** | 17.11.0 | Validation | Input schema validation |
| **dotenv** | 16.3.1 | Configuration | Environment variable management |
| **Nodemon** | 3.0.2 | Dev Hot-reload | Auto-restart on file changes |

**Why This Stack?**
- **Express**: Lightweight, industry standard, massive ecosystem
- **Sequelize**: Type-safe ORM with migrations support
- **JWT**: Stateless auth, ideal for distributed systems
- **Puppeteer**: Real headless browser for accurate PDF generation

---

### Database

| Component | Details |
|---|---|
| **Engine** | MySQL 8.0 with InnoDB |
| **Character Set** | utf8mb4 (Unicode support) |
| **Tables** | 14 normalized tables |
| **Relationships** | Foreign key constraints |
| **Indexes** | 11 performance indexes |
| **Connection Pool** | Min 0, Max 10, Acquire timeout 30s |

---

### Infrastructure & DevOps

| Technology | Purpose |
|---|---|
| **Docker** | Containerization (optional) |
| **GitHub** | Version control & CI/CD |
| **Node.js Process Manager** | PM2 for production |
| **SSL/TLS** | HTTPS for production |
| **CDN** | File delivery (optional) |

---

## 📂 Project Structure

### Root Level
```
Dote/
├── server/                    # Backend API (Node.js + Express)
├── client/                    # Frontend SPA (React + Vite)
├── package.json               # Root package for concurrent dev
├── README.md                  # Project documentation
└── .gitignore                 # Git ignore rules
```

### Backend Structure (`server/`)
```
server/
├── config/                    # Configuration files
│   ├── db.js                 # Sequelize connection
│   ├── ccavenue.js           # Payment gateway config
│   └── schema.sql            # Database schema
│
├── models/                    # Sequelize ORM models (14 files)
│   ├── index.js              # Model associations
│   ├── Student.js            # Student entity
│   ├── Application.js        # Application entity
│   ├── College.js            # College entity
│   ├── User.js               # Admin/Staff user
│   ├── Payment.js            # Payment tracking
│   ├── Document.js           # Document storage
│   ├── ApplicationCollege.js  # Preference ranking
│   └── ...more models
│
├── controllers/               # Business logic handlers
│   ├── auth.controller.js    # Registration, login, OTP
│   ├── application.controller.js  # CRUD & submission
│   ├── college.controller.js     # College management
│   ├── payment.controller.js     # Payment processing
│   ├── admin.controller.js       # Admin operations
│   └── collegeStaff.controller.js # Staff operations
│
├── routes/                    # API endpoint definition
│   ├── auth.routes.js        # /api/v1/auth/*
│   ├── student.routes.js     # /api/v1/*
│   ├── payment.routes.js     # /api/v1/payment/*
│   ├── admin.routes.js       # /api/v1/admin/*
│   └── college.routes.js     # /api/v1/college/*
│
├── middleware/                # Express middleware
│   ├── auth.middleware.js    # JWT verification
│   ├── role.middleware.js    # RBAC enforcement
│   └── upload.middleware.js  # File upload handling
│
├── services/                  # Reusable business services
│   ├── auth.service.js       # Auth logic
│   ├── email.service.js      # Nodemailer integration
│   ├── otp.service.js        # OTP generation/validation
│   ├── payment.service.js    # CCAvenue integration
│   └── pdf.service.js        # Puppeteer PDF generation
│
├── utils/                     # Utility functions
│   ├── apiResponse.js        # Standardized response format
│   └── validators.js         # Input validation schemas
│
├── seeders/                   # Database seeding
│   └── seed.js               # Populate test data
│
├── migrations/                # Database migrations (for production)
├── uploads/                   # File storage directory
├── app.js                     # Express app configuration
├── server.js                  # Entry point
├── .env.example              # Environment template
└── package.json              # Dependencies
```

### Frontend Structure (`client/src/`)
```
client/src/
├── pages/                     # Page components (route-level)
│   ├── public/                # Public pages
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Student login
│   │   ├── Register.jsx      # Student registration
│   │   └── AdminLogin.jsx    # Admin/Staff login
│   │
│   ├── student/              # Student dashboard & features
│   │   ├── Dashboard.jsx     # Student home
│   │   ├── ApplicationForm.jsx  # Multi-step form
│   │   ├── ApplicationStatus.jsx # Track status
│   │   ├── PaymentSuccess.jsx   # Payment confirmation
│   │   └── PaymentCancelled.jsx # Payment failure
│   │
│   ├── admin/                # Admin features
│   │   ├── Dashboard.jsx     # Admin analytics
│   │   ├── Colleges.jsx      # College management
│   │   ├── Users.jsx         # User management
│   │   ├── MasterData.jsx    # Master data CRUD
│   │   └── Reports.jsx       # System reports
│   │
│   └── college/              # College staff features
│       ├── Dashboard.jsx     # College home
│       ├── Applications.jsx  # Application queue
│       └── Reports.jsx       # College reports
│
├── components/               # Reusable components
│   ├── forms/                # Form step components
│   │   ├── PersonalDetails.jsx
│   │   ├── ContactDetails.jsx
│   │   ├── ParentDetails.jsx
│   │   ├── AcademicHistory.jsx
│   │   ├── MarksEntry.jsx
│   │   ├── CollegeChoice.jsx
│   │   ├── SpecialCategory.jsx
│   │   └── PreviewSubmit.jsx
│   │
│   ├── layout/               # Layout components
│   │   ├── AppLayout.jsx    # Main layout wrapper
│   │   ├── Navbar.jsx       # Top navigation
│   │   └── Sidebar.jsx      # Side navigation
│   │
│   └── common/               # Shared UI components
│       ├── Modal.jsx        # Dialog component
│       ├── Toast.jsx        # Notification toast
│       ├── Spinner.jsx      # Loading spinner
│       └── StatusBadge.jsx  # Status display
│
├── store/                    # Redux state management
│   ├── index.js             # Store configuration
│   └── slices/              # Redux slices
│       ├── authSlice.js     # Auth state
│       ├── applicationSlice.js  # Application state
│       ├── collegeSlice.js  # College state
│       └── uiSlice.js       # UI state (modals, toasts)
│
├── routes/                   # Routing configuration
│   └── ProtectedRoute.jsx   # JWT-guarded routes
│
├── services/                 # API services
│   └── api.js               # Axios instance with interceptors
│
├── utils/                    # Utility functions
│
├── assets/                   # Static assets (images, icons)
├── index.css                # Global styles
├── main.jsx                 # React entry point
└── App.jsx                  # Root app component
```

---

## 🗄️ Database Design

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ACADEMIC_YEARS ||--o{ FEE_STRUCTURES : has
    ACADEMIC_YEARS ||--o{ APPLICATIONS : has
    DISTRICTS ||--o{ COLLEGES : located_in
    DISTRICTS ||--o{ STUDENTS : belongs_to
    COMMUNITIES ||--o{ CASTES : contains
    COMMUNITIES ||--o{ STUDENTS : belongs_to
    CASTES ||--o{ STUDENTS : belongs_to
    COLLEGES ||--o{ COURSES : offers
    COLLEGES ||--o{ USERS : manages
    COLLEGES ||--o{ APPLICATION_COLLEGES : receives
    STUDENTS ||--o{ APPLICATIONS : submits
    STUDENTS ||--o{ DOCUMENTS : uploads
    STUDENTS ||--o{ NOTIFICATIONS : receives
    APPLICATIONS ||--o{ APPLICATION_COLLEGES : lists
    APPLICATIONS ||--o{ MARKS : contains
    APPLICATIONS ||--o{ PAYMENTS : requires
    APPLICATIONS ||--o{ DOCUMENTS : includes
    APPLICATION_COLLEGES ||--o{ COURSES : chooses
    USERS ||--o{ NOTIFICATIONS : sends
```

### Key Tables & Relationships

#### Table Structures

**USERS**
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| user_id | INT | PK | Unique identifier |
| email | VARCHAR(255) | UK | Login email |
| password_hash | VARCHAR(255) | | bcrypt hashed |
| role | ENUM('admin', 'staff', 'student') | | Role-based access |
| college_id | INT | FK | College association |
| name | VARCHAR(100) | | Full name |
| status | ENUM('active', 'inactive') | | Account status |

**STUDENTS**
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| student_id | INT | PK | Unique identifier |
| mobile | VARCHAR(10) | UK | Phone number (unique) |
| email | VARCHAR(255) | | Email address |
| name | VARCHAR(100) | | Full name |
| dob | DATE | | Date of birth |
| community_id | INT | FK | Social category |
| caste_id | INT | FK | Caste designation |
| is_verified | BOOLEAN | | Email/OTP verified |
| created_at | TIMESTAMP | | Account creation |

**APPLICATIONS**
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| application_id | INT | PK | Unique identifier |
| student_id | INT | FK | Student reference |
| application_no | VARCHAR(50) | UK | Application number |
| year_id | INT | FK | Academic year |
| status | ENUM('draft', 'submitted', 'approved', 'rejected', 'allocated') | | Application status |
| submitted_at | TIMESTAMP | | Submission time |

**APPLICATION_COLLEGES** (Preference List)
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| id | INT | PK | Unique identifier |
| application_id | INT | FK | Application reference |
| college_id | INT | FK | College choice |
| course_id | INT | FK | Course choice |
| preference_order | INT | | 1, 2, 3... order |

**PAYMENTS**
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| payment_id | INT | PK | Unique identifier |
| application_id | INT | FK UK | Application reference |
| order_id | VARCHAR(100) | UK | CCAvenue order |
| status | ENUM('initiated', 'success', 'failed', 'cancelled') | | Payment status |
| amount | DECIMAL(10,2) | | Amount in rupees |
| reference_no | VARCHAR(100) | | Bank reference |
| paid_at | TIMESTAMP | | Payment time |

**COLLEGES**
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| college_id | INT | PK | Unique identifier |
| college_code | VARCHAR(20) | UK | College code (GPC001) |
| college_name | VARCHAR(255) | | Full name |
| district_id | INT | FK | Location |
| gender_type | ENUM('Boys', 'Girls', 'Co-ed') | | College gender type |
| hostel_available | BOOLEAN | | Hostel facility |
| approved | BOOLEAN | | Approval status |

**COURSES**
| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| course_id | INT | PK | Unique identifier |
| college_id | INT | FK | Offered by college |
| course_code | VARCHAR(20) | | Course code |
| course_name | VARCHAR(100) | | Full name |
| intake_seats | INT | | Total seats |
| specialization | VARCHAR(100) | | Branch |

| Table | Purpose | Relationship Pattern |
|-------|---------|---|
| **students** | Student accounts | Mobile unique, community/caste FK |
| **applications** | Application records | Student FK, multi-status tracking |
| **application_colleges** | Preference ranking | Composite with college, course |
| **payments** | Payment tracking | Order ID unique, status enum |
| **documents** | File storage metadata | Verification workflow |
| **users** | Admin/Staff accounts | Email unique, RBAC role |
| **colleges** | Institution master | Code unique, district location |
| **courses** | Course offerings | College FK, intake seats |
| **marks** | Academic records | Application FK |
| **academic_years** | Period management | Active year configuration |
| **fee_structures** | Category-wise fees | Year & category combination |
| **communities** | Social category | Parent to castes (1:N) |
| **castes** | Caste specification | Community FK |
| **districts** | Geographic location | TN district list |

### Indexing Strategy

```sql
-- Performance indexes on frequently queried fields
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_year ON applications(year_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_app_colleges_app ON application_colleges(application_id);
CREATE INDEX idx_app_colleges_college ON application_colleges(college_id);
CREATE INDEX idx_marks_app ON marks(application_id);
CREATE INDEX idx_payments_app ON payments(application_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_colleges_gender ON colleges(gender_type);
CREATE INDEX idx_colleges_hostel ON colleges(hostel_available);
CREATE INDEX idx_students_mobile ON students(mobile);
```

---

## ⚙️ Installation & Setup

### 🖥️ System Requirements

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | 18.x or higher | npm 9+ included |
| **MySQL** | 8.0 or higher | InnoDB engine required |
| **NPM/Yarn** | 9.x+ | Package manager |
| **Git** | Latest | Version control |
| **Operating System** | Windows/macOS/Linux | Tested on all platforms |
| **RAM** | 4GB minimum | 8GB recommended |
| **Disk Space** | 3GB minimum | For node_modules, uploads |

### 📋 Prerequisites

1. **MySQL Server running**
   ```bash
   # Windows: Start MySQL Service
   # macOS: brew services start mysql
   # Linux: sudo systemctl start mysql
   ```

2. **Git installed** - [Download](https://git-scm.com)

3. **Node.js 18+** - [Download](https://nodejs.org)

---

### 🚀 Step-by-Step Setup

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/dote-admission-system.git
cd dote-admission-system
```

#### Step 2: Install Dependencies

```bash
# Install all dependencies for both server and client
npm run install:all

# OR manually:
cd server && npm install
cd ../client && npm install
cd ..
```

#### Step 3: Database Setup

```bash
# Create database (option A: Using MySQL CLI)
mysql -u root -p < server/config/schema.sql

# Database created: dote_admission (utf8mb4)
# 14 tables with relationships initialized
```

#### Step 4: Environment Configuration

**Server Setup:**
```bash
# Copy example env
cp server/.env.example server/.env

# Edit server/.env with your settings
nano server/.env
```

**Sample `.env` Configuration:**
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dote_admission
DB_USER=root
DB_PASS=your_mysql_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@dote.tn.gov.in

# CCAvenue Payment Gateway
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_PUBLIC_KEY=your_public_key
CCAVENUE_PRIVATE_KEY=your_private_key
CCAVENUE_REDIRECT_URL=http://localhost:5000/api/v1/payment/callback

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads
```

**Client Setup (Optional):**
```bash
# Frontend uses server API, no separate .env needed
# But if needed:
cat > client/.env.local << EOF
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=DOTE Admission
EOF
```

#### Step 5: Populate Test Data

```bash
# Seed database with default users, colleges, and sample data
npm run seed

# Output:
# ✓ Districts seeded
# ✓ Communities seeded
# ✓ Colleges & courses seeded
# ✓ Admin user seeded (admin@dote.tn.gov.in / Admin@123)
# ✓ College Staff users seeded
# ✓ Sample Students seeded
# ✅ Seeding complete!
```

#### Step 6: Start Development Servers

```bash
# Start both server and client concurrently
npm run dev

# OR separately in different terminals:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

#### Step 7: Access Application

| Service | URL | Purpose |
|---|---|---|
| **Frontend** | http://localhost:5173 | React application |
| **Backend API** | http://localhost:5000/api/v1 | REST API |
| **Health Check** | http://localhost:5000/health | Server status |
| **MySQL** | localhost:3306 | Database |

---

### 🔑 Default Test Credentials

After seeding, use these credentials to test:

#### Super Admin
```
Email: admin@dote.tn.gov.in
Password: Admin@123
Role: System Administrator
Access: Everything
```

#### College Staff (Example)
```
Email: staff.gpc001@dote.tn.gov.in
Password: Staff@123
College: Government Polytechnic College, Chennai
Access: View & verify applications for GPC001
```

#### Student (Example)
```
Mobile: 9876543210
Password: Student@123
Name: Arjun Singh
Access: Submit & track applications
```

---

### 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Output: client/dist/ (static files)
# Ready to deploy to web server
```

---

### 🐳 Docker Setup (Optional)

#### Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: dote_admission
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./server
    environment:
      DB_HOST: db
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### Run with Docker

```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### 1. Student Registration
```http
POST /auth/register
Content-Type: application/json

{
  "mobile": "9876543210",
  "email": "student@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP sent successfully. Valid for 10 minutes.",
  "data": {
    "otp": "123456"  // Only in development
  }
}
```

#### 2. Verify OTP & Set Password
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "mobile": "9876543210",
  "otp": "123456",
  "password": "SecurePass123!",
  "name": "Arjun Singh"
}

Response (200):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "student": {
      "student_id": 1,
      "name": "Arjun Singh",
      "mobile": "9876543210"
    }
  }
}
```

#### 3. Student Login
```http
POST /auth/login
Content-Type: application/json

{
  "mobile": "9876543210",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "student": {
      "student_id": 1,
      "name": "Arjun Singh",
      "mobile": "9876543210"
    }
  }
}
```

#### 4. Admin/Staff Login
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@dote.tn.gov.in",
  "password": "Admin@123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "user_id": 1,
      "email": "admin@dote.tn.gov.in",
      "role": "SUPER_ADMIN",
      "college": null
    }
  }
}
```

### Student Application Endpoints

#### 5. Create Application
```http
POST /applications
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "year_id": 1,
  "personal": { "name": "...", "dob": "..." },
  "contact": { "address": "...", "city": "..." },
  "parent": { "father_name": "...", "mother_name": "..." }
}

Response (201):
{
  "success": true,
  "data": {
    "application_id": 1,
    "status": "DRAFT",
    "application_no": null
  }
}
```

#### 6. Update Application
```http
PUT /applications/1
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "academic": { "board": "CBSE", "register_no": "..." },
  "marks": [
    { "subject_name": "Math", "marks_obtained": 85 }
  ],
  "colleges": [
    { "college_id": 1, "course_id": 1, "preference_order": 1 }
  ]
}

Response (200):
{
  "success": true,
  "data": { "application_id": 1, "status": "DRAFT" }
}
```

#### 7. Submit & Initiate Payment
```http
POST /applications/1/submit
Authorization: Bearer {accessToken}
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {
    "application_id": 1,
    "status": "SUBMITTED",
    "application_no": "DOTE2026001",
    "payment_redirect_url": "https://ccavenue.com/..."
  }
}
```

#### 8. Get Application Status
```http
GET /applications/1
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "application_id": 1,
    "status": "PAID",
    "application_no": "DOTE2026001",
    "submitted_at": "2026-04-17T10:30:00Z",
    "payment": { "status": "SUCCESS", "amount": 300 },
    "colleges": [...]
  }
}
```

#### 9. Download Application PDF
```http
GET /applications/1/pdf
Authorization: Bearer {accessToken}

Response (200): PDF file binary
```

### Payment Endpoints

#### 10. Initiate Payment
```http
POST /payment/initiate
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "application_id": 1,
  "amount": 300
}

Response (200):
{
  "success": true,
  "data": {
    "payment_link": "https://ccavenue.com/...",
    "order_id": "ORD123456"
  }
}
```

#### 11. Payment Callback (Webhook)
```http
POST /payment/callback
Content-Type: application/x-www-form-urlencoded

[CCAvenue sends encrypted data]

Response (200): Redirect to success/failure page
```

### College Endpoints

#### 12. Get Available Colleges
```http
GET /colleges/available?gender=CO-ED&hostel=1
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": [
    {
      "college_id": 1,
      "college_code": "GPC001",
      "college_name": "Government Polytechnic College, Chennai",
      "district": "Chennai",
      "gender_type": "CO-ED",
      "hostel_available": true,
      "courses": [
        { "course_id": 1, "course_code": "CSE", "course_name": "Diploma in CSE" }
      ]
    }
  ]
}
```

### Admin Endpoints

#### 13. Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer {adminToken}

Response (200):
{
  "success": true,
  "data": {
    "total_students": 150,
    "total_applications": 200,
    "paid_applications": 180,
    "verified_applications": 120,
    "pending_verification": 60,
    "colleges": 4,
    "revenue": 54000
  }
}
```

#### 14. Manage Colleges
```http
GET /admin/colleges                    # List all
POST /admin/colleges                   # Create
PUT /admin/colleges/:id                # Update
DELETE /admin/colleges/:id             # Delete

Authorization: Bearer {adminToken}
```

#### 15. Generate Comprehensive Report
```http
GET /admin/reports/applications?year=1&status=VERIFIED&format=pdf
Authorization: Bearer {adminToken}

Response (200): PDF report
```

---

## 🔐 Security & Authentication

### Authentication Flow

```mermaid
sequenceDiagram
    Client->>API: 1. Request (with JWT)
    API->>API: 2. Extract & Verify JWT
    alt Token Valid
        API->>API: 3. Check Role & Permissions
        alt Permission Granted
            API->>Database: 4. Execute Request
            Database-->>API: 5. Return Data
            API-->>Client: 6. Success Response
        else Permission Denied
            API-->>Client: 403 Forbidden
        end
    else Token Invalid/Expired
        API-->>Client: 401 Unauthorized
        Client->>API: Use Refresh Token
        API-->>Client: New Access Token
    end
```

### Authentication & Authorization

#### JWT Strategy

- **Access Token**: 15-minute validity
  ```
  Header: Authorization: Bearer {accessToken}
  ```
- **Refresh Token**: 7-day validity (stored in httpOnly cookie)
  ```
  Cookie: refreshToken={refreshToken}
  ```

#### Token Payload
```javascript
{
  "student_id": 1,              // Only for students
  "user_id": 1,                 // Only for staff/admin
  "mobile": "9876543210",       // Student identifier
  "email": "admin@dote.tn.gov.in", // Staff/Admin identifier
  "role": "SUPER_ADMIN",        // SUPER_ADMIN, COLLEGE_STAFF, STUDENT
  "type": "student",            // student or user
  "college_id": 1,              // Only for college staff
  "iat": 1713333000,            // Issued at
  "exp": 1713333900             // Expires at
}
```

### Role-Based Access Control (RBAC)

| Role | Access Level | Capabilities |
|---|---|---|
| **SUPER_ADMIN** | System-wide | Create colleges, manage users, view all reports, configure fees |
| **COLLEGE_STAFF** | College-specific | Verify applications, generate college reports (read-only other tables) |
| **STUDENT** | Personal | Submit applications, view own status, pay fees |

#### RBAC Middleware
```javascript
// Check role before executing action
app.put('/admin/colleges/:id', 
  authMiddleware,           // Verify JWT
  roleMiddleware('SUPER_ADMIN'),  // Check role
  updateCollege             // Execute
);
```

### Password Security

- **Hashing Algorithm**: bcrypt with SALT 12
- **Password Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase, 1 lowercase, 1 number
  - Changed on each registration
- **Storage**: Never stored in plaintext
- **Comparison**: Constant-time comparison to prevent timing attacks

### Session Security

- **httpOnly Cookies**: Refresh tokens not accessible via JavaScript
- **Secure Flag**: Cookies only sent over HTTPS in production
- **SameSite**: STRICT - prevents CSRF attacks
- **CORS Policy**: Whitelist frontend URL only

### Input Validation & Sanitization

```javascript
// Using Joi for schema validation
const registerSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  email: Joi.string().email().optional(),
});

// Validate all inputs before processing
const { error, value } = registerSchema.validate(req.body);
if (error) return res.status(400).json({ message: error.details[0].message });
```

### API Security Headers

**Helmet Configuration:**
```javascript
app.use(helmet({
  contentSecurityPolicy: false,  // Allow inline styles
  hsts: { maxAge: 31536000, includeSubDomains: true },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Payment Security (CCAvenue)

- **Encryption**: AES-128 encryption of payment data
- **PCI-DSS**: Level 3 compliance
- **Checksum Validation**: Verify payment response authenticity
- **Redirect URLs**: Whitelist only valid callback URLs
- **Data Masking**: Don't log sensitive payment info

### SQL Injection Prevention

**Using Parameterized Queries (Sequelize ORM):**
```javascript
// SAFE - Uses parameterized queries
Student.findOne({ where: { mobile } });

// UNSAFE - Never do this!
db.query(`SELECT * FROM students WHERE mobile = '${mobile}'`);
```

---

## 🚀 DevOps & Deployment

### Deployment Architecture

```mermaid
graph LR
    Dev["💻 Development<br/>Local Machine"]
    GitHub["🐙 GitHub<br/>Version Control"]
    CI["⚙️ CI/CD Pipeline<br/>GitHub Actions"]
    Build["📦 Build Artifacts<br/>Docker Images"]
    Registry["🏗️ Container Registry<br/>Docker Hub"]
    K8S["☸️ Kubernetes<br/>Orchestration"]
    Prod["🌐 Production<br/>AWS/GCP/Azure"]
    Monitor["📊 Monitoring<br/>Prometheus/Grafana"]
    
    Dev -->|git push| GitHub
    GitHub -->|trigger| CI
    CI -->|build| Build
    Build -->|push| Registry
    Registry -->|pull| K8S
    K8S -->|deploy| Prod
    Prod -->|metrics| Monitor
    Monitor -->|alerts| CI
```

### Docker Setup

**Build Docker Image:**
```bash
# Backend
docker build -t dote-backend:1.0 ./server

# Frontend
docker build -t dote-frontend:1.0 ./client

# Run containers
docker run -d -p 5000:5000 \
  -e DB_HOST=mysql \
  -e NODE_ENV=production \
  dote-backend:1.0

docker run -d -p 80:80 dote-frontend:1.0
```

### CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [ main, production ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm run install:all
      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t dote-backend ./server
      - name: Push to registry
        run: docker push myregistry/dote-backend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: kubectl apply -f k8s/
```

### Kubernetes Deployment

**k8s/backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dote-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dote-backend
  template:
    metadata:
      labels:
        app: dote-backend
    spec:
      containers:
      - name: backend
        image: dote-backend:1.0
        ports:
        - containerPort: 5000
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: dote-config
              key: db-host
        - name: NODE_ENV
          value: production
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Infrastructure As Code (Terraform)

```hcl
provider "aws" {
  region = "ap-south-1"
}

resource "aws_rds_instance" "mysql" {
  identifier     = "dote-mysql"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  allocated_storage = 100
  
  db_name  = "dote_admission"
  username = "admin"
  password = var.db_password
  
  skip_final_snapshot = false
  final_snapshot_identifier = "dote-mysql-final-snapshot"
}

resource "aws_ecs_cluster" "dote" {
  name = "dote-cluster"
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "dote-cache"
  engine          = "redis"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
  parameter_group_name = "default.redis7"
}
```

### Monitoring & Logging

**Prometheus Metrics:**
```javascript
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    }, duration);
  });
  next();
});
```

---

## 🧹 Project Optimization Suggestions

### Critical Issues & Improvements

#### 1. **Missing Error Handling Middleware** ⚠️ CRITICAL

**Current Issue:**
```javascript
// app.js only has basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});
```

**Recommended Fix:**
```javascript
// error.middleware.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  
  res.status(err.statusCode).json({ 
    success: false, 
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

**Impact**: Prevents server crashes, better error reporting

---

#### 2. **Missing Logging System** ⚠️ IMPORTANT

**Current Issue:**
```javascript
console.log('✓ Admin user seeded');  // No structured logging
console.error('Seeding failed:', err); // Limited error info
```

**Recommended Solution - Winston Logger:**

```bash
npm install winston
```

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

**Usage:**
```javascript
logger.info('Application started');
logger.error('Database connection failed', { error: err.message });
logger.warn('Rate limit approaching');
```

**Impact**: Production debugging, performance monitoring, audit trail

---

#### 3. **No Input Validation Middleware** ⚠️ CRITICAL

**Current Issue:**
Controllers validate directly, inconsistent validation logic

**Recommended Fix:**
```javascript
// validators.js - Centralized schemas
const joi = require('joi');

const schemas = {
  register: Joi.object({
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
      'string.pattern.base': 'Invalid mobile number'
    }),
    email: Joi.string().email().optional()
  }),
  
  updateApplication: Joi.object({
    personal: Joi.object({
      name: Joi.string().min(2).max(150).required(),
      dob: Joi.date().required(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER')
    }),
    contact: Joi.object({
      address: Joi.string().required(),
      pincode: Joi.string().pattern(/^\d{6}$/)
    })
  })
};

// Middleware factory
const validate = (schemaName) => (req, res, next) => {
  const { error, value } = schemas[schemaName].validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const messages = error.details.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({ success: false, errors: messages });
  }
  
  req.validated = value;
  next();
};

module.exports = { validate };
```

**Usage:**
```javascript
router.post('/auth/register', validate('register'), register);
```

**Impact**: Prevents invalid data persistence, consistent error messages

---

#### 4. **Missing Rate Limiting** ⚠️ IMPORTANT

**Issue**: No protection against brute force attacks, DDoS

**Solution:**
```bash
npm install express-rate-limit
```

```javascript
// rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts, try again later',
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => req.body.mobile || req.body.email || req.ip
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter };
```

**Usage:**
```javascript
router.post('/auth/register', authLimiter, register);
app.use(apiLimiter);
```

**Impact**: Security against attacks, fair API usage

---

#### 5. **No Database Migrations** ⚠️ IMPORTANT

**Current Issue:**
Sequelize `sync({ alter: true })` dangerous in production

**Solution - Sequelize Migrations:**
```bash
npm install -g sequelize-cli
sequelize init
```

**Create migration:**
```bash
sequelize migration:generate --name create-students-table
```

```javascript
// migrations/20260417100000-create-students-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('students', {
      student_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      mobile: {
        type: Sequelize.STRING(15),
        unique: true,
        allowNull: false
      },
      // ... more columns
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('students');
  }
};
```

**Usage:**
```bash
# Run migrations
sequelize db:migrate

# Rollback
sequelize db:migrate:undo
```

**Impact**: Safe, reversible database changes

---

#### 6. **Missing Environment Variable Validation** ⚠️ IMPORTANT

**Solution:**
```javascript
// config/env.js
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().default(5000),
  DB_HOST: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  CCAVENUE_MERCHANT_ID: Joi.string().required(),
  // ... more validations
}).unknown();

const { value, error } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = value;
```

**Impact**: Fail fast on startup, clear config requirements

---

#### 7. **Missing API Documentation (Swagger)** ⚠️ IMPORTANT

**Solution:**
```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DOTE Admission API',
      version: '1.0.0',
      description: 'API documentation'
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development' },
      { url: 'https://api.dote.tn.gov.in/api/v1', description: 'Production' }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Usage in routes:**
```javascript
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register Student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile: { type: string }
 *               email: { type: string }
 *     responses:
 *       200: { description: 'OTP sent' }
 *       400: { description: 'Invalid input' }
 */
router.post('/register', register);
```

**Access:** http://localhost:5000/api-docs

**Impact**: Self-documenting API, improved developer experience

---

#### 8. **File Management Issues** ⚠️ WARNING

**Current Issues:**
- No file size validation
- No file type checking
- Security: No sanitization of filenames
- No cleanup of orphaned files

**Solution:**
```javascript
// middleware/upload.middleware.js (Improved)
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/documents/');
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitized = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    const unique = `${Date.now()}-${req.user.student_id}-${sanitized}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
```

---

#### 9. **Missing Testing** ⚠️ CRITICAL

**Add test suite:**
```bash
npm install --save-dev jest supertest
```

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const { Student } = require('../models');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await Student.destroy({ where: {} });
  });

  test('POST /auth/register should send OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ mobile: '9876543210', email: 'test@example.com' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('OTP sent');
  });

  test('POST /auth/verify-otp should verify and create account', async () => {
    // Register first
    const student = await Student.create({
      mobile: '9876543210',
      email: 'test@example.com',
      password: 'temp',
      otp: '123456',
      otp_expires: new Date(Date.now() + 10 * 60 * 1000)
    });

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        mobile: '9876543210',
        otp: '123456',
        password: 'SecurePass123!',
        name: 'Test User'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
```

**Run tests:**
```bash
npm test
```

---

#### 10. **Missing Caching Layer** ⚠️ PERFORMANCE

**Add Redis:**
```bash
npm install redis
```

```javascript
// cache.js
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

const setCache = (key, value, ttl = 3600) => {
  client.setex(key, ttl, JSON.stringify(value));
};

const getCache = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) reject(err);
      resolve(data ? JSON.parse(data) : null);
    });
  });
};

module.exports = { setCache, getCache };
```

**Usage:**
```javascript
// Cache college list (1 hour)
const getColleges = async (req, res) => {
  const cached = await getCache('colleges:all');
  if (cached) return res.json(cached);

  const colleges = await College.findAll();
  setCache('colleges:all', colleges, 3600);
  res.json(colleges);
};
```

---

### Suggested Folder Restructuring

**Before:**
```
server/
├── config/
├── controllers/
├── models/
├── routes/
├── services/
├── utils/
├── middleware/
└── seeders/
```

**After (Improved):**
```
server/
├── config/
│   ├── database.js
│   ├── environment.js      # NEW: Env validation
│   ├── logger.js           # NEW: Winston setup
│   └── redis.js            # NEW: Cache config
│
├── models/                 # Sequelize models
├── routes/                 # API route definitions
├── controllers/            # Request handlers
├── services/               # Business logic (auth, email, payment, etc.)
├── middleware/             # Express middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js # NEW: Error handling
│   ├── validation.middleware.js # NEW: Input validation
│   ├── rateLimit.middleware.js  # NEW: Rate limiting
│   └── upload.middleware.js
│
├── utils/                  # Utilities
│   ├── apiResponse.js
│   ├── validators.js
│   ├── cache.js            # NEW: Redis cache
│   └── logger.js           # NEW: Logging
│
├── tests/                  # NEW: Test files
│   ├── auth.test.js
│   ├── application.test.js
│   └── payment.test.js
│
├── migrations/             # NEW: Database migrations
├── seeders/
├── logs/                   # NEW: Log files (git-ignored)
├── uploads/                # File storage
├── swagger.js              # NEW: API docs
├── server.js               # Entry point
├── app.js                  # Express app
├── .env.example            # Environment template
└── package.json
```

---

### Optimization Summary Table

| Issue | Severity | Impact | Fix Time |
|-------|----------|--------|----------|
| No error handling middleware | CRITICAL | Server crashes | 1 hour |
| Missing logging | IMPORTANT | Production debugging issues | 1-2 hours |
| No input validation | CRITICAL | Data integrity issues | 2-3 hours |
| No rate limiting | IMPORTANT | Security vulnerability | 1 hour |
| No migrations | IMPORTANT | Unsafe DB changes | 2 hours |
| No environment validation | IMPORTANT | Config errors at runtime | 1 hour |
| No API documentation | IMPORTANT | Developer experience | 2-3 hours |
| File upload insecurity | WARNING | Potential exploits | 1 hour |
| No tests | CRITICAL | Regression issues | 4-6 hours |
| No caching | PERFORMANCE | Slow queries | 2-3 hours |

---

## 📈 Scalability & Performance

### Load Handling Strategy

```mermaid
graph TB
    Users["👥 Users"]
    LB["⚖️ Load Balancer<br/>Nginx/AWS ALB"]
    AppPool["🔄 Application Pool<br/>Replicas: 3-10"]
    Cache["⚡ Redis Cache<br/>Sessions, Queries"]
    DB[(🗄️ MySQL<br/>Replication)]
    CDN["🌐 CDN<br/>Static Files"]
    
    Users -->|HTTP/HTTPS| LB
    LB -->|Round-robin| AppPool
    AppPool -->|caching| Cache
    AppPool -->|queries| DB
    AppPool -->|static| CDN
    Cache -->|hit| AppPool
```

### Caching Strategy

1. **Query Results**: College list, course data (1 hour TTL)
2. **Sessions**: User login data (7 days TTL)
3. **Computation**: Dashboard stats (5 mins TTL)
4. **Static Files**: CSS, JS via CDN (30 days)

### Database Optimization

1. **Connection Pooling**: Min 0, Max 10 connections
2. **Query Optimization**: Indexes on foreign keys, status
3. **Read Replicas**: For reporting queries
4. **Partitioning**: Applications table by year

---

## 🔮 Future Enhancements

### Phase 2: Advanced Features
- [ ] Real-time application status (WebSocket)
- [ ] SMS notifications (Twilio)
- [ ] AI-based eligibility prediction
- [ ] Mobile app (React Native)
- [ ] Chatbot for FAQs (Dialogflow)
- [ ] Advanced analytics (Power BI)

### Phase 3: Scale & Performance
- [ ] Microservices architecture
- [ ] Kafka message queue
- [ ] GraphQL API
- [ ] Machine learning for merit ranking
- [ ] Blockchain for document verification

---

## 📸 Screenshots

(To be added after UI development)

---

## 🤝 Contributing

### Steps to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/dote-admission-system.git
   cd dote-admission-system
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes & Commit**
   ```bash
   git add .
   git commit -m "feat: Add [feature description]"
   ```

4. **Push & Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- **Format**: Use Prettier
- **Lint**: ESLint configuration
- **Tests**: 80% coverage minimum
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

**Copyright © 2026 Tamil Nadu DOTE (Department of Technical Education)**

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/dote-admission-system/issues)
- **Email**: support@dote.tn.gov.in
- **Documentation**: [Full Wiki](https://github.com/yourusername/dote-admission-system/wiki)

---

**⭐ If this project helped you, consider giving it a star!**

**Made with ❤️ by the DOTE Development Team**
