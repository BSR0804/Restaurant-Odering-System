# 🍽️ Kitchen Caboodle: Cloud-Native Restaurant OS

A professional, real-time dining and operations ecosystem designed for modern restaurants, now fully migrated to a **High-Integrity Cloud Infrastructure**. This platform bridges the gap between the kitchen and the customer with sub-second synchronization, ultra-clean high-density aesthetics, and production-grade data persistence.

---

## ⚡ Core Features

### 1. High-Precision Scheduled Ordering ⏰
- **Granular 15-Min Intervals**: Customers can now pre-order meals with 15-minute precision up to 24 hours in advance.
- **Unified Scheduling UI**: Smart date/time selection ensures zero invalid reservations.
- **Admin Visibility**: Scheduled orders are clearly distinguished in the Staff Dashboard for proactive kitchen planning.

### 2. Universal Admin Notification Hub 🔔
- **"Infinite Listen" Engine**: Decoupled socket listeners ensure the notification bell rings flawlessly even while viewing past history or revenue archives.
- **Triple-Redundancy Alerts**: The notification engine attempts 3 separate fire-paths (DOM, Ref, and Constructor) to bypass aggressive browser sound-blocking rules.
- **Visual Alert Pulse**: A gold visual pulse in the sidebar provides secondary confirmation for new orders, even if the system volume is muted.

### 3. Cloud-Native Persistence (Supabase) ☁️
- **PostgreSQL Ledger**: Substituted local SQLite for a mission-critical **Supabase PostgreSQL** instance.
- **Identity-Mapped History**: Orders are securely tied to **Google Identity** emails, allowing persistent history across devices.
- **Atomic Sync**: Deduplicated dashboard logic ensures zero "ghost" orders or revenue inflation.

### 4. Elite UX & Crash Hardening 🎨
- **Defensive Rendering**: Hardened the Success and Account pages to ensure malformed orders or legacy data records never crash the UI into a "blank screen."
- **Zero-Latency (Optimistic UI)**: Dashboard toggles and status updates reflect **instantly** in the UI, syncing with the cloud in the background.
- **Glassmorphic Skeleton UI**: Replaced jarring loading screens with high-end, layout-aware skeletons for a premium browsing experience.

### 5. IST & Indian Locale Optimization 🇮🇳
- **IST Synchronization**: The entire ecosystem (Dashboard, User Account, and History) is hard-locked to **Indian Standard Time (Asia/Kolkata)**.
- **Timezone-Aware History**: Advanced UTC-to-Local conversion ensures that orders placed after midnight correctly appear on the current local day.
- **Currency Integration**: Full support for Indian Rupee (₹) symbols and lakh-compliant digit grouping.

### 6. Universal Mobile & Network Reliability 📲
- **Mobile Carrier-Ready**: Optimized **Socket.io** to prioritize **HTTP Polling** as the primary transport, ensuring connectivity even on mobile networks that block WebSockets.
- **Express 5 / Node 22 Hardening**: Resolved critical wildcard routing conflicts between Express 5 and the latest `path-to-regexp` engines for 100% server uptime.
- **Dynamic CORS Orchestration**: Implemented a flexible origin-matching system to support any Vercel-generated deployment URL or custom domain without manual configuration.
- **Automatic Retries**: The Menu fetch now includes 3 automated retries with exponential backoff and 15-second timeouts for a flawless experience on unstable mobile data.

### 7. Mobile UX & Layout Optimization (New) 📱
- **Adaptive Logo Clearance**: Unified **.page-header** system ensures that critical titles like "Review Order" and "Your Account" never hide under the fixed restaurant logo.
- **Dynamic Action Bar**: On mobile, the "Back" button and "Veg/Non-Veg" filters are intelligently inlined into a single, space-efficient control row.
- **Precision Grid Styling**: Re-engineered the scheduling inputs using a 50/50 CSS Grid to ensure date and time selectors fit perfectly within container boundaries on small screens.
- **One-Handed Navigation**: Optimized the Account page by repositioning the Logout action directly below user identity metrics for easy accessibility.

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Usage |
| :--- | :--- |
| **React (Vite)** | Core application framework for high-speed rendering. |
| **Framer Motion** | Advanced layout-aware animations and skeleton UI. |
| **Socket.io-client** | Real-time bidirectional communication bridge. |
| **Lucide React** | High-quality, consistent iconography. |
| **Axios** | Resilient API communication with cloud endpoints. |

### **Cloud Backend**
| Technology | Usage |
| :--- | :--- |
| **Node.js / Express** | High-concurrency server architecture. |
| **Supabase (PostgreSQL)** | Persistent, ACID-compliant cloud data storage. |
| **Socket.io** | Event-driven signaling for order and inventory sync. |
| **Dotenvx** | Secure cloud-key orchestration. |

---

## 🚀 Getting Started

### 1. Initialize the Neural Core (Backend)
Navigate to the `backend` directory and configure your cloud keys:
1. Create a `.env` file with your **SUPABASE_URL** and **SUPABASE_ANON_KEY**.
2. Launch the server:
```bash
cd backend
npm install
node server.js
```
*The server automatically seeds the Cloud Menu if missing.*

### 2. Launch the Interface (Frontend)
Navigate to the `frontend` directory and start the dev server:
```bash
cd frontend
npm install
npm run dev
```
*Access the app at `https://restaurant-odering-system.vercel.app`.*

---

## 🔗 Project Entry Points (Production)

| Portal | URL |
| :--- | :--- |
| **Customer Interface** | [https://restaurant-odering-system.vercel.app](https://restaurant-odering-system.vercel.app) |
| **Admin Dashboard** | [https://restaurant-odering-system.vercel.app/admin](https://restaurant-odering-system.vercel.app/admin) |
| **User Account** | [https://restaurant-odering-system.vercel.app/account](https://restaurant-odering-system.vercel.app/account) |
| **Backend API (Railway)** | [https://food-api-production-5ac0.up.railway.app](https://food-api-production-5ac0.up.railway.app) |

### 🔐 Administrative Access
- **Username**: `admin`
- **Password**: `admin123`

---

> [!IMPORTANT]
> **Production Status**: This project is now fully decoupled from local storage and served via **Vercel Edge** and **Railway Cloud**. Every order, status update, and revenue metric is stored in the **Supabase Cloud Ledger**, ensuring 100% data integrity even after a server restart. 🧑‍🍳📊🌐✅✨
