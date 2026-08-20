# SubHub — Subscription-Based SaaS Backend

A full-stack subscription management platform built with the **MERN stack** (MongoDB, Express, React, Node.js). Users can register, log in, browse subscription plans, subscribe/upgrade/cancel, and access features gated by their active plan — modeled after products like Netflix, Canva, and Notion.

---

## Features

### Authentication & User Management
- User registration (signup) with hashed passwords (bcrypt)
- Login with JWT-based authentication
- Stateless auth via Bearer tokens, validated on every protected route

### Subscription Plans
- Three seedable tiers: **Free**, **Basic**, **Premium**
- Each plan stores name, price, feature list, access level, and storage limit
- Public endpoint to browse all plans (no login required)

### Subscription Lifecycle
- Subscribe to a plan
- Upgrade / downgrade between plans (auto-cancels the previous subscription)
- View current subscription status and start date
- Cancel subscription at any time

### Access Control (Role/Plan-Based)
- Middleware-driven route protection — no manual checks scattered through controllers
- **Free users** → limited access (public + basic routes only)
- **Paid users** → full or tiered access depending on plan
- `/dashboard` → any logged-in user
- `/profile` → any logged-in user
- `/premium-content` → **Premium subscribers only**, enforced by a reusable `requirePlan()` guard

### Frontend
- Clean, responsive React UI (mobile-first, CSS Grid/Flexbox, no bulky UI framework)
- Pages: Home, Signup, Login, Plans, Dashboard, Profile
- Auth state persisted via Context API + localStorage
- Axios instance with automatic JWT attachment and protected-route wrapper

---

## Tech Stack & Project Structure

```
saas-app/
│
├── backend/                         # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection (Mongoose)
│   │   ├── models/
│   │   │   ├── User.js              # name, email, password(hashed), current_plan, role
│   │   │   ├── Plan.js              # name, price, features[], accessLevel, storageLimitGB
│   │   │   └── Subscription.js      # user_id, plan_id, start_date, end_date, status
│   │   ├── middleware/
│   │   │   ├── auth.js              # protect() -> verifies JWT, attaches req.user
│   │   │   └── roleGuard.js         # requirePlan([...]) -> plan-based access control
│   │   ├── controllers/
│   │   │   ├── authController.js    # signup, login
│   │   │   ├── planController.js    # getPlans, createPlan
│   │   │   ├── subscriptionController.js  # subscribe, upgrade, cancel, getMySubscription
│   │   │   └── userController.js    # profile, dashboard, premium-content
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # POST /signup, POST /login
│   │   │   ├── planRoutes.js        # GET /plans, POST /plans (admin)
│   │   │   ├── subscriptionRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── seed.js                  # seeds Free/Basic/Premium plans
│   │   └── server.js                # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                        # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance + JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.js       # global auth state (login/logout/user)
│   │   ├── components/
│   │   │   ├── Navbar.js / .css
│   │   │   ├── PlanCard.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── Home.js / .css
│   │   │   ├── Signup.js / Login.js / Auth.css
│   │   │   ├── Plans.js / .css
│   │   │   ├── Dashboard.js / .css
│   │   │   └── Profile.js
│   │   ├── App.js                   # route definitions
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

**Stack summary**

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React 18, React Router 6, Axios      |
| Backend        | Node.js, Express 4                   |
| Database       | MongoDB with Mongoose ODM            |
| Auth           | JWT (jsonwebtoken) + bcryptjs        |
| Styling        | Plain CSS (Flexbox/Grid, responsive) |

---

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env       # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                # seeds Free/Basic/Premium plans
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env        # set REACT_APP_API_URL if different from default
npm install
npm start                   # starts on http://localhost:3000
```

---

## API Reference

| Method | Endpoint                              | Access            |
|--------|----------------------------------------|-------------------|
| POST   | `/api/auth/signup`                    | Public            |
| POST   | `/api/auth/login`                     | Public            |
| GET    | `/api/plans`                          | Public            |
| POST   | `/api/subscriptions/subscribe`        | Logged-in user    |
| PUT    | `/api/subscriptions/upgrade-plan`     | Logged-in user    |
| GET    | `/api/subscriptions/me`               | Logged-in user    |
| POST   | `/api/subscriptions/cancel-subscription` | Logged-in user |
| GET    | `/api/user/profile`                   | Logged-in user    |
| GET    | `/api/user/dashboard`                 | Logged-in user    |
| GET    | `/api/user/premium-content`           | Premium plan only |

---

## Challenges Faced

1. **Designing access control cleanly** — rather than sprinkling `if (user.plan === 'premium')` checks inside every controller, the logic was pulled into a reusable `requirePlan()` middleware that reads the user's *active* subscription (not just a cached field on the user document) to decide access. This avoids stale-access bugs when a subscription expires or is cancelled.
2. **Keeping plan state consistent** — a user can only ever have one *active* subscription. Subscribing or upgrading while an active subscription already exists required auto-cancelling the old one in the same operation to prevent duplicate "active" records.
3. **Token handling on the frontend** — centralizing JWT attachment in a single Axios instance (instead of manually setting headers in every request) kept API calls consistent and easy to maintain.
4. **Responsive UI without a heavy framework** — built the layout with plain CSS Grid/Flexbox to keep the bundle light while still being fully mobile-responsive.
5. **Password security** — passwords are never returned by default (`select: false` on the schema field) and are hashed with bcrypt before save, guarding against accidental leakage in API responses.

---

## Potential Future Enhancements

- **Payment gateway integration** (Stripe/Razorpay) for real billing instead of manual plan assignment
- **Refresh tokens** and token blacklisting for safer, shorter-lived access tokens
- **Email verification** and password-reset flow
- **Admin dashboard** to manage users, plans, and view revenue analytics
- **Usage-based metering** (e.g., storage consumed vs. plan limit) with automatic downgrade warnings
- **Webhooks** for subscription renewal/expiry notifications
- **Rate limiting & request throttling** on auth routes to prevent brute-force attacks
- **Automated subscription expiry job** (cron) to flip `active` → `expired` based on `end_date`
- **Unit & integration tests** (Jest + Supertest for backend, React Testing Library for frontend)
- **Dockerized deployment** with a `docker-compose.yml` for one-command local setup
- **Audit logs** for plan changes and login activity

---

## License
MIT — free to use and modify for learning or production purposes.
