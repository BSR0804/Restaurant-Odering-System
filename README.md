# 🍽️ Grillz Point: Cloud-Native Restaurant OS

A professional, real-time dining and operations ecosystem designed for **Grillz Point** — located at Reliance Mall, Nagafgarh, Sector 13, Kakrola, Delhi, 110078. Built on a **High-Integrity Cloud Infrastructure**, this platform bridges the gap between the kitchen and the customer with sub-second synchronization, ultra-clean high-density aesthetics, and production-grade data persistence.

---

## ⚡ Core Features

### 1. High-Precision Scheduled Ordering ⏰
- **Granular 15-Min Intervals**: Customers can pre-order meals with 15-minute precision up to 24 hours in advance.
- **Unified Scheduling UI**: Smart date/time selection ensures zero invalid reservations.
- **Admin Visibility**: Scheduled orders are clearly distinguished in the Staff Dashboard for proactive kitchen planning.

### 2. Universal Admin Notification Hub 🔔
- **"Infinite Listen" Engine**: Decoupled socket listeners ensure the notification bell rings flawlessly even while viewing past history or revenue archives.
- **Triple-Redundancy Alerts**: The notification engine attempts 3 separate fire-paths (DOM, Ref, and Constructor) to bypass aggressive browser sound-blocking rules.
- **Visual Alert Pulse**: A gold visual pulse in the sidebar provides secondary confirmation for new orders, even if the system volume is muted.

### 3. Cloud-Native Persistence (MongoDB Atlas) ☁️
- **MongoDB Ledger**: Mission-critical **MongoDB Atlas** instance for all orders, menu, and history.
- **Identity-Mapped History**: Orders are securely tied to **Google Identity** emails, allowing persistent history across devices.
- **Atomic Sync**: Deduplicated dashboard logic ensures zero "ghost" orders or revenue inflation.

### 4. Persistent Revenue Ledger 📊
- **All-Time Summary**: Admin dashboard shows lifetime revenue and total orders — pulled directly from MongoDB, never resets.
- **Daily Breakdown**: Date picker allows admin to drill into any specific day's revenue and order list.
- **Optimistic UI**: Order completion instantly updates both the daily and all-time counters without a page refresh.

### 5. Elite UX & Crash Hardening 🎨
- **Defensive Rendering**: Hardened the Success and Account pages to ensure malformed orders or legacy data records never crash the UI.
- **Zero-Latency (Optimistic UI)**: Dashboard toggles and status updates reflect instantly in the UI, syncing with the cloud in the background.
- **Glassmorphic Skeleton UI**: Replaced jarring loading screens with high-end, layout-aware skeletons for a premium browsing experience.

### 6. IST & Indian Locale Optimization 🇮🇳
- **IST Synchronization**: The entire ecosystem (Dashboard, User Account, and History) is hard-locked to **Indian Standard Time (Asia/Kolkata)**.
- **Timezone-Aware History**: Advanced UTC-to-Local conversion ensures orders placed after midnight correctly appear on the current local day.
- **Currency Integration**: Full support for Indian Rupee (₹) symbols and lakh-compliant digit grouping.

### 7. Universal Mobile & Network Reliability 📲
- **Mobile Carrier-Ready**: Optimized **Socket.io** to prioritize **HTTP Polling** as the primary transport, ensuring connectivity even on mobile networks that block WebSockets.
- **Express 5 / Node 22 Hardening**: Resolved critical wildcard routing conflicts for 100% server uptime.
- **Dynamic CORS Orchestration**: Flexible origin-matching supports any Vercel-generated deployment URL without manual configuration.
- **Automatic Retries**: Menu fetch includes 3 automated retries with exponential backoff for a flawless experience on unstable mobile data.

### 8. Mobile UX & Layout Optimization 📱
- **Adaptive Logo Clearance**: Unified `.page-header` system ensures critical titles never hide under the fixed restaurant logo.
- **Dynamic Action Bar**: On mobile, the "Back" button and "Veg/Non-Veg" filters are intelligently inlined into a single, space-efficient control row.
- **Precision Grid Styling**: Re-engineered scheduling inputs using a 50/50 CSS Grid to fit perfectly within container boundaries on small screens.
- **One-Handed Navigation**: Optimized the Account page by repositioning the Logout action directly below user identity metrics.

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
| **MongoDB Atlas** | Persistent, document-based cloud data storage. |
| **Render** | Managed deploy platform for the API service. |
| **Socket.io** | Event-driven signaling for order and inventory sync. |
| **Dotenv** | Secure cloud-key orchestration. |

---

## 🚀 Getting Started

### 1. Initialize the Backend
Navigate to the `backend` directory and configure your cloud keys:
1. Create a `.env` file with **MONGODB_URI** (Atlas SRV connection string) and optionally **MONGODB_DB** (defaults to `kc_restaurant`).
2. Launch the server:
```bash
cd backend
npm install
node server.js
```
*The server automatically seeds the Grillz Point menu if the item count differs from the canonical list.*

### Deploying to Render
The repo includes a `render.yaml` blueprint at the root. Connect the repo in Render → New → Blueprint, then set the `MONGODB_URI` secret in the dashboard. The frontend reads `VITE_API_BASE_URL` (default falls back to `https://restaurant-odering-system.onrender.com`); set this in Vercel project settings to point at your Render URL.

### 2. Launch the Frontend
Navigate to the `frontend` directory and start the dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 Project Entry Points (Production)

| Portal | URL |
| :--- | :--- |
| **Customer Interface** | [https://restaurant-odering-system.vercel.app](https://restaurant-odering-system.vercel.app) |
| **Admin Dashboard** | [https://restaurant-odering-system.vercel.app/admin](https://restaurant-odering-system.vercel.app/admin) |
| **User Account** | [https://restaurant-odering-system.vercel.app/account](https://restaurant-odering-system.vercel.app/account) |
| **Backend API (Render)** | [https://restaurant-odering-system.onrender.com](https://restaurant-odering-system.onrender.com) |

### 🔐 Administrative Access
- **Username**: `admin`
- **Password**: `admin123`

---

## 📍 Restaurant Info

**Grillz Point**
Reliance Mall, Nagafgarh, Sector 13, Kakrola, Delhi, 110078

---

> [!IMPORTANT]
> **Production Status**: This project is fully decoupled from local storage and served via **Vercel Edge** and **Render Cloud**. Every order, status update, and revenue metric is stored in **MongoDB Atlas**, ensuring 100% data integrity even after a server restart. 🧑‍🍳📊🌐✅✨
