# AI Expense Tracker

A full-stack expense management application with AI-powered category suggestions, premium features, and secure payments. Built with **React + Node.js + MySQL + Gemini AI + Cashfree Payments**.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Core Features](#core-features)
6. [Authentication & Security](#authentication--security)
7. [API Endpoints](#api-endpoints)
8. [Workflow & User Journey](#workflow--user-journey)
9. [Setup & Installation](#setup--installation)
10. [Directory Structure](#directory-structure)

---

## 🎯 Project Overview

**AI Expense Tracker** helps users manage their spending with:
- **Track Expenses**: Add, view, and delete expenses with automatic categorization
- **AI Suggestions**: Google Gemini AI recommends expense categories based on descriptions
- **Analytics**: View spending trends, monthly summaries, and total expenses
- **Premium Features**: Unlock advanced reports, leaderboards, and export options
- **Secure Payments**: Cashfree integration for premium subscriptions
- **User Accounts**: Secure authentication with JWT tokens and password reset

**Target Users**: Individuals who want to track spending with AI-powered insights and optional premium analytics.

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  - Pages: Dashboard, Reports, Leaderboard, Premium, Auth   │
│  - Components: Forms, Lists, Cards, Modals                 │
│  - State: AuthContext, ToastContext, API calls via Axios   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS/CORS
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                        │
│  - Routes: /auth, /expenses, /ai, /payment, /premium       │
│  - Middleware: JWT auth, error handling, rate limiting      │
│  - Controllers: Business logic for each feature             │
│  - Services: Gemini AI, Cashfree Payments, Mail             │
└─────────────────────────┬───────────────────────────────────┘
                          │ SQL
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (MySQL)                            │
│  - Users, Expenses, Orders, ForgotPasswordRequests          │
│  - Indexed for performance on userId queries                │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User logs in** → Frontend sends credentials to `/api/auth/login`
2. **Backend validates** → Verifies password, returns JWT token
3. **Frontend stores JWT** → Uses token for all authenticated requests
4. **User adds expense** → Frontend sends to `/api/expenses` with auth header
5. **Backend processes** → Validates, saves to database, returns data
6. **Frontend updates UI** → Displays expense in list with pagination

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI framework |
| | Vite | Build tool & dev server |
| | Tailwind CSS | Styling (professional dark theme) |
| | Framer Motion | Animations & transitions |
| | Axios | HTTP client for API calls |
| | Lucide React | Icons library |
| **Backend** | Express.js | Web framework & routing |
| | Node.js | Runtime environment |
| | Sequelize | ORM for MySQL |
| | JWT | Stateless authentication |
| | Bcrypt | Password hashing |
| **Database** | MySQL | Relational database |
| **External APIs** | Google Gemini AI | Category suggestions |
| | Cashfree Payments | Payment processing |
| **Security** | Helmet | HTTP security headers |
| | CORS | Cross-origin request control |
| | Express Validator | Input validation |
| | Rate Limiter | DDoS protection |

---

## 📊 Database Schema

### Users Table
```
id (Primary Key)
username (String, 3-30 chars, required)
email (String, unique, required)
password (String, hashed with bcrypt)
isPremium (Boolean, default: false)
createdAt (Timestamp)
updatedAt (Timestamp)
```

### Expenses Table
```
id (Primary Key)
amount (Decimal, min: 0.01)
description (String, max 255 chars)
category (Enum: Food, Petrol, Salary, Entertainment, Health, Shopping, Bills, Travel, Other)
userId (Foreign Key → Users)
createdAt (Timestamp)
updatedAt (Timestamp)

Indexes: userId (for fast filtering by user)
```

### Orders Table
```
id (Primary Key)
orderId (String, unique - from Cashfree)
amount (Decimal - premium subscription cost)
status (Enum: PENDING, SUCCESSFUL, FAILED)
userId (Foreign Key → Users)
createdAt (Timestamp)
updatedAt (Timestamp)

Indexes: userId, orderId (for fast lookups)
```

### ForgotPasswordRequests Table
```
id (Primary Key)
token (String, unique - for reset link)
userId (Foreign Key → Users)
expiresAt (Timestamp - token expires in 1 hour)
createdAt (Timestamp)
```

---

## ✨ Core Features

### 1. **User Authentication**
- **Sign Up**: Create account with username, email, password
- **Sign In**: Login with email and password, receive JWT token
- **Password Reset**: Forgot password flow with email verification
- **JWT Protection**: All expense/payment routes require valid token

### 2. **Expense Tracking**
- **Add Expenses**: Input amount, description, and category
- **List Expenses**: View paginated list (5, 8, 10, 20, or 40 per page)
- **Delete Expenses**: Remove expenses with confirmation modal
- **Categorize**: 9 predefined categories for organization
- **Timestamps**: Track when each expense was created

### 3. **AI-Powered Suggestions**
- **Auto-Category**: As user types expense description, Gemini AI suggests category
- **Smart Detection**: Understands context (e.g., "shell petrol" → Petrol category)
- **Non-blocking**: If AI fails or is slow, user can manually select category
- **One-way API**: No data saved from AI suggestions, only used for recommendation

### 4. **Analytics & Reports**
- **Dashboard Metrics**:
  - Total Expenses (all-time accumulated)
  - Monthly Expenses (current month total)
  - Transaction Count (total records)
  - Account Tier (Free or Premium badge)
  - Month-over-Month Trend (% change)

- **Reports Page** (Premium Only):
  - Spending by category (pie chart)
  - Weekly/Monthly breakdown
  - Export to PDF
  - Export to CSV

- **Leaderboard** (Premium Only):
  - Top spenders ranked by total amount
  - Promotes friendly competition

### 5. **Premium Subscription**
- **Upgrade Button**: Initiates Cashfree payment checkout
- **One-time Purchase**: ₹199 for lifetime premium access
- **Instant Activation**: Status updates immediately after payment
- **Feature Unlock**: Premium users get reports, leaderboards, exports
- **Verification**: Backend verifies payment with Cashfree API

### 6. **Security Features**
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 24-hour expiration, verified on each request
- **CORS**: Only frontend domain can make requests
- **Input Validation**: All inputs validated before processing
- **Rate Limiting**: Prevents brute force attacks
- **Error Handling**: Generic error messages (no data leakage)
- **Transaction Support**: Database operations are atomic (all-or-nothing)

---

## 🔐 Authentication & Security

### Sign-up Flow
```
User enters credentials
  ↓
Frontend validates (client-side)
  ↓
POST /api/auth/signup
  ↓
Backend validates format + checks for duplicate email
  ↓
Hash password with bcrypt
  ↓
Create User record in database
  ↓
Return success message (no token yet, user must log in)
```

### Login Flow
```
User enters email & password
  ↓
POST /api/auth/login
  ↓
Find user by email
  ↓
Compare input password with hashed password
  ↓
If match: Generate JWT token (24-hour expiration)
  ↓
Return token to frontend
  ↓
Frontend stores in localStorage
  ↓
Frontend adds token to Authorization header for future requests
```

### Protected Route Flow
```
User makes authenticated request (e.g., GET /api/expenses)
  ↓
Frontend includes: Authorization: Bearer <token>
  ↓
Backend authMiddleware extracts token
  ↓
Verify token signature & expiration
  ↓
If valid: Attach user info (id, email, isPremium) to request
  ↓
Route handler processes request with user context
  ↓
If invalid: Return 401 Unauthorized
```

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login & get JWT token | No |
| GET | `/me` | Get current user info | Yes |
| POST | `/logout` | Invalidate session | Yes |

### Expense Routes (`/api/expenses`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List user's expenses (paginated) | Yes |
| POST | `/` | Create new expense | Yes |
| DELETE | `/:id` | Delete expense by ID | Yes |

**Query Parameters for GET**:
- `page` (default: 1) - Page number for pagination
- `limit` (default: 10) - Items per page [5, 8, 10, 20, 40]

**Request Body for POST**:
```json
{
  "amount": 500.50,
  "description": "Lunch at restaurant",
  "category": "Food"
}
```

### AI Routes (`/api/ai`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/suggest-category` | Get AI category suggestion | Yes |

**Request Body**:
```json
{
  "description": "Filled petrol for car"
}
```

**Response**:
```json
{
  "category": "Petrol"
}
```

### Payment Routes (`/api/payment`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-order` | Initiate premium payment | Yes |
| POST | `/verify` | Verify payment success & activate | Yes |

### Premium Routes (`/api/premium`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/leaderboard` | Top spenders ranking | No |

### Password Routes (`/api/password`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/forgot` | Send password reset email | No |
| POST | `/reset` | Reset password with token | No |

---

## 🔄 Workflow & User Journey

### New User Journey
```
1. User visits app → Redirected to Sign In page
2. Clicks "Create Account" → Goes to Sign Up form
3. Enters username, email, password → Submits
4. Backend validates & creates user → Shown success
5. User logs in with email/password → Receives JWT token
6. Redirected to Dashboard → Empty state message
7. Clicks "Add Expense" → Form appears
8. Enters amount, description, category → Submits
9. Expense added → Shows in list
10. Views metrics: Total/Monthly/Count all show values
```

### Premium Upgrade Journey
```
1. Free user sees "Upgrade to Premium" button
2. Clicks button → Cashfree checkout modal opens
3. Enters card details → Completes payment
4. Backend receives payment callback
5. Verifies with Cashfree API
6. Updates user.isPremium = true
7. Frontend shows "Premium" badge in dashboard
8. Premium features unlocked: Reports, Leaderboard, Exports
```

### Delete Expense Workflow
```
1. User clicks trash icon on expense
2. Confirmation modal appears with details
3. User clicks "Delete" button
4. Frontend sends DELETE /api/expenses/:id
5. Backend finds expense (only if belongs to user)
6. Deletes from database
7. Frontend removes from list or reloads
8. Toast notification: "Expense deleted successfully"
```

### AI Category Suggestion Workflow
```
1. User types in description field
2. Frontend waits 600ms (debounce to avoid spam)
3. Sends POST /api/ai/suggest-category with description
4. Gemini AI analyzes text
5. Returns category (e.g., "Petrol" for "filled petrol")
6. Frontend shows "Suggested by Gemini AI" badge
7. Category dropdown auto-fills with suggestion
8. User can accept or manually change category
```

### Payment Verification Workflow
```
1. User completes checkout on Cashfree
2. Cashfree returns payment_session_id + status
3. Frontend sends POST /api/payment/verify with session ID
4. Backend calls Cashfree API to fetch order details
5. Verifies amount, status, user ID
6. If successful: Updates Order.status = 'SUCCESSFUL'
7. Updates User.isPremium = true
8. Returns success → Frontend shows "Upgrade complete!"
```

---

## 💻 Setup & Installation

### Prerequisites
- **Node.js** v16+ and npm
- **MySQL** v5.7+ running locally or via Docker
- **.env files** with API keys (see examples below)

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_tracker
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
GOOGLE_GEMINI_KEY=your_gemini_api_key
CASHFREE_PUBLIC_KEY=your_cashfree_key
CASHFREE_SECRET_KEY=your_cashfree_secret
MAILGUN_API_KEY=your_mailgun_key
PREMIUM_AMOUNT=199.00

# Start server
npm run dev  # or npm start for production
```

### Frontend Setup

```bash
cd frontend
npm install

# Frontend uses http://localhost:5000 by default
# (configured in src/api/axiosInstance.js)

# Start dev server
npm run dev

# Build for production
npm run build
```

### Database Setup

```bash
# MySQL
CREATE DATABASE expense_tracker;

# Backend will auto-sync tables on startup (Sequelize)
npm run dev
```

---

## 📁 Directory Structure

```
AiExpenseTracker/
│
├── backend/
│   ├── config/
│   │   ├── database.js          # Sequelize MySQL connection
│   │   └── envValidator.js      # Validates required env vars
│   │
│   ├── models/
│   │   ├── User.js              # User schema & validation
│   │   ├── Expense.js           # Expense schema
│   │   ├── Order.js             # Payment order schema
│   │   ├── ForgotPasswordRequest.js
│   │   └── index.js             # Model exports
│   │
│   ├── controllers/
│   │   ├── authController.js    # Sign up, login, logout
│   │   ├── expenseController.js # CRUD for expenses
│   │   ├── aiController.js      # AI category suggestions
│   │   ├── paymentController.js # Cashfree integration
│   │   ├── premiumController.js # Premium features
│   │   ├── passwordController.js# Password reset
│   │   └── healthController.js  # Health check
│   │
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── expense.js           # Expense endpoints
│   │   ├── ai.js                # AI endpoints
│   │   ├── payment.js           # Payment endpoints
│   │   ├── premium.js           # Premium endpoints
│   │   ├── password.js          # Password endpoints
│   │   └── health.js            # Health check
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── validate.js          # Input validation runner
│   │   ├── premiumMiddleware.js # Premium-only access
│   │   └── rateLimiter.js       # Rate limiting
│   │
│   ├── services/
│   │   ├── geminiService.js     # Google Gemini AI integration
│   │   ├── cashfreeService.js   # Cashfree payment API
│   │   └── mailService.js       # Email sending (Mailgun)
│   │
│   ├── utils/
│   │   ├── jwt.js               # Generate & verify tokens
│   │   ├── passwordUtils.js     # Hash & compare passwords
│   │   └── categories.js        # Expense categories list
│   │
│   ├── validators/
│   │   ├── authValidators.js    # Email, password validation
│   │   ├── expenseValidator.js  # Amount, description validation
│   │   ├── aiValidators.js      # Description validation
│   │   ├── paymentValidators.js # Payment input validation
│   │   └── passwordValidators.js
│   │
│   ├── app.js                   # Express app setup
│   ├── server.js                # Entry point, DB connection
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js       # Auth API calls
│   │   │   ├── expenseApi.js    # Expense API calls
│   │   │   ├── aiApi.js         # AI suggestion API
│   │   │   ├── paymentApi.js    # Payment API
│   │   │   ├── premiumApi.js    # Premium API
│   │   │   ├── passwordApi.js   # Password reset API
│   │   │   └── axiosInstance.js # Axios config
│   │   │
│   │   ├── components/
│   │   │   ├── Button.jsx           # Reusable button
│   │   │   ├── FormInput.jsx        # Input with validation
│   │   │   ├── ExpenseForm.jsx      # Add expense form + AI
│   │   │   ├── ExpenseItem.jsx      # Single expense row
│   │   │   ├── ExpenseList.jsx      # List of expenses
│   │   │   ├── PaginationControls.jsx
│   │   │   ├── PerPageSelector.jsx
│   │   │   ├── PremiumButton.jsx    # Upgrade button
│   │   │   ├── PremiumGuard.jsx     # Protect premium routes
│   │   │   ├── ProtectedRoute.jsx   # Auth guard
│   │   │   ├── MainLayout.jsx       # App shell + navbar
│   │   │   ├── AuthLayout.jsx       # Auth pages wrapper
│   │   │   ├── DownloadMenu.jsx     # Export options
│   │   │   ├── ReportFilters.jsx    # Date range filter
│   │   │   └── LeaderboardTable.jsx # Top spenders table
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── SignUp.jsx           # Registration
│   │   │   ├── SignIn.jsx           # Login
│   │   │   ├── ForgotPassword.jsx   # Password reset request
│   │   │   ├── ResetPassword.jsx    # Password reset confirm
│   │   │   ├── ReportPage.jsx       # Analytics (Premium)
│   │   │   ├── Leaderboard.jsx      # Top spenders (Premium)
│   │   │   └── Premium.jsx          # Upgrade page
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # User auth state
│   │   │   └── ToastContext.jsx     # Notifications
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDebouncedValue.js # Debounce hook
│   │   │   └── usePersistedState.js # Local storage hook
│   │   │
│   │   ├── utils/
│   │   │   ├── categories.js        # Category list
│   │   │   ├── dateRanges.js        # Date filtering
│   │   │   ├── exportCsv.js         # CSV export
│   │   │   └── exportPdf.js         # PDF export
│   │   │
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Global styles (Tailwind)
│   │   └── App.css                  # App-specific styles
│   │
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── vite.config.js               # Vite bundler config
│   └── eslint.config.js
│
└── README.md                        # This file
```

---

## 🚀 How It All Works Together

### Request Example: Adding an Expense

**Frontend (React)**:
```javascript
// User fills form: amount=500, description="Lunch", category="Food"
const response = await createExpense(500, "Lunch", "Food");
// axiosInstance automatically adds Authorization header with JWT
```

**Backend (Express)**:
```
POST /api/expenses
Authorization: Bearer eyJhbGci...
Body: { amount: 500, description: "Lunch", category: "Food" }
  ↓
authMiddleware → Verify JWT → Extract userId=123
  ↓
expenseValidator → Check amount > 0, description length, valid category
  ↓
createExpense controller → Insert into Expenses table
  ↓
Database → Save: { amount: 500, description: "Lunch", category: "Food", userId: 123 }
  ↓
Response → { message: "...", expense: { id: 42, ... } }
```

**Frontend (React)**:
```
Response received → Update expense list state
  ↓
UI re-renders → New expense appears in list
  ↓
Toast notification → "Expense added successfully!"
```

---

## 🔍 Key Design Decisions

1. **JWT for Authentication**: Stateless, scalable, no session storage needed
2. **Sequelize ORM**: Type-safe queries, migrations, relationships built-in
3. **Transaction Support**: Ensures data consistency (all-or-nothing operations)
4. **Rate Limiting**: Protects against brute force and spam attacks
5. **Input Validation**: On both frontend (UX) and backend (security)
6. **Soft Deletes Not Used**: Expenses deleted permanently (simpler model)
7. **Email for Password Reset**: Industry standard, no SMS costs
8. **AI as Enhancement**: Non-blocking, graceful fallback if service fails
9. **Cashfree Webhook Verification**: Backend verifies with Cashfree API, not frontend claims

---

## 📝 Notes for Developers

- **Expenses are per-user**: All queries filter by `userId` in the `where` clause
- **Premium is one-time**: No recurring billing, instant activation after payment
- **AI failures are silent**: If Gemini fails, user can manually select category
- **Pagination is important**: Large expense lists load in chunks (5-40 items)
- **Timezone**: All dates in UTC, frontend can localize
- **Error messages**: Generic on frontend, detailed in backend logs
- **Passwords**: Never logged, only hashed comparison

---

## 📞 Support & Contact

For issues or questions, check:
- Backend logs: `backend/` (npm run dev output)
- Frontend console: Browser DevTools → Console tab
- API responses: Network tab → XHR requests

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅