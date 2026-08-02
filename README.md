# 🛡️ TrustLink — Native Labor Protocol & Secure Matching Platform

**TrustLink** is a modern, full-stack labor protocol platform designed to connect job seekers and service providers with enhanced trust, real-time tracking, security verification, and bond-based agreement protocols.

---

## ✨ Features

- **🔐 Dual-Factor Authentication & Verification**: Secure OTP email verification powered by Nodemailer.
- **💼 Role-Based Access Control**: Tailored dashboards for **Seekers** (workers looking for jobs) and **Providers** (employers/contractors posting jobs).
- **📍 Location & Skill Matching**: Geospatial location awareness and custom skill tag filtering using React-Leaflet maps.
- **📜 Bond & Contract Agreements**: Structured labor agreement protocols with settlement tracking.
- **⚡ Real-Time Notifications**: Instant updates powered by Socket.IO for application status, bond resolutions, and messaging.
- **⭐ Peer Review System**: Multi-point performance rating system (Punctuality, Quality, Communication, Reliability).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **UI & Animations**: Framer Motion, Lucide Icons, Custom CSS Design Tokens
- **State & Routing**: React Router v7, React Hot Toast
- **Maps**: React-Leaflet, Leaflet JS
- **Real-Time Client**: Socket.IO Client

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas + Mongoose ORM
- **Real-Time Engine**: Socket.IO Server
- **Authentication & Security**: JWT, Bcrypt, Dotenv
- **Services**: Nodemailer (Email OTPs), Razorpay SDK (Payment Integration)

---

## 📁 Repository Structure

```text
TrustLink/
├── trustlink-backend/       # Express API & Socket.IO server
│   ├── models/              # Mongoose DB Schemas (User, Job, Bond, Application, etc.)
│   ├── routes/              # Express API Routes
│   ├── server.js            # Entry point & Socket.IO initialization
│   └── .env.example         # Environment template
│
└── trustlink-frontend/      # React Vite Single Page Application
    ├── src/
    │   ├── components/      # Role dashboards & forms
    │   ├── pages/           # Landing, Auth & Info pages
    │   ├── apiConfig.js     # Centralized dynamic API configuration
    │   └── App.jsx          # Route manager
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: MongoDB Atlas Cluster or Local MongoDB instance

---

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shivamvanjara/-trustlink.git
   cd -trustlink
   ```

2. **Backend Setup**:
   ```bash
   cd trustlink-backend
   npm install
   ```
   Create a `.env` file in `trustlink-backend/` matching `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
   Start backend server:
   ```bash
   node server.js
   ```

3. **Frontend Setup**:
   ```bash
   cd ../trustlink-frontend
   npm install
   ```
   Start frontend dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

- **Backend**: Deploy `trustlink-backend/` to [Render](https://render.com/) or Railway.
- **Frontend**: Deploy `trustlink-frontend/` to [Vercel](https://vercel.com/) or Netlify. Set `VITE_API_BASE_URL` to your deployed backend URL.

---

## 📄 License
This project is licensed under the ISC License.
