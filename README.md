# 🍽️ Kitchen Caboodle: High-Performance Restaurant OS

A professional, real-time dining and operations ecosystem designed for modern restaurants. This platform bridges the gap between the kitchen and the customer with sub-second synchronization, ultra-clean high-density aesthetics, and high-fidelity auditory signaling.

---

## ⚡ Core Features

### 1. Neural Audio Orchestration 🔔
- **Unique Auditory Signatures**: 
  - **Admin**: "Bell" alert for every new incoming order.
  - **Customer**: "Happy Bells" high-fidelity notification specifically when their order is marked as **Ready**.
- **Browser-Interaction Priming**: Smart logic that "unlocks" browser audio permissions, ensuring alerts fire even on dimmed mobile screens.
- **Local-Asset Reliability**: All signals are served as local `.wav` files for zero-latency, offline-capable alerting.

### 2. Real-Time Operations ⚡
- **Live Order Dashboard**: Admins receive instant, mission-critical notifications with visual toasts and audio pings.
- **Fulfillment States**: Orders transition through "Live", "Ready", and "Completed" states, synced instantly to the customer's dashboard.
- **Inventory Orchestration**: Toggle "Available / Sold Out" status for any dish; changes propagate to all connected diners in under 0.5s.

### 3. Business Telemetry 📊
- **Live Revenue Tracker**: Real-time calculation of today's total earnings displayed on the admin header.
- **Precision Archive**: Detailed order history showing item-level quantity metrics (e.g., *x1, x2*).
- **QR-DRIVEN**: Dynamic table mapping via QR codes for zero-friction ordering.

---

## 🛠️ Technology Stack

### **Frontend**
| Technology | Usage |
| :--- | :--- |
| **React (Vite)** | Core application framework for high-speed rendering. |
| **Framer Motion** | Advanced layout-aware animations and smooth transitions. |
| **Socket.io-client** | Real-time bidirectional communication bridge. |
| **Lucide React** | High-quality, consistent iconography. |
| **Axios** | Resilient API communication and data fetching. |
| **Vanilla CSS** | Custom-engineered design system for maximum flexibility. |

### **Backend**
| Technology | Usage |
| :--- | :--- |
| **Node.js / Express** | High-concurrency server architecture. |
| **Socket.io** | Event-driven signaling for order and inventory sync. |
| **SQLite (better-sqlite3)** | Lightweight, ACID-compliant relational storage. |
| **CORS** | Secure cross-origin resource orchestration. |

---

## 🚀 Getting Started

### 1. Initialize the Neural Core (Backend)
Navigate to the `backend` directory and launch the server:
```bash
cd backend
npm install
node server.js
```
*The server initializes `restaurant.db` automatically and listens on `http://localhost:5000`.*

### 2. Launch the Interface (Frontend)
Navigate to the `frontend` directory and start the dev server:
```bash
cd frontend
npm install
npm run dev
```
*Access the app typically at `http://localhost:5173`.*

---

## 🎨 Visual Language
- **Theme**: Premium Dark Mode (#0A0A0B).
- **Accents**: Gold (#C9A96E) for luxury and Green/Red for dietary clarity.
- **Typography**: Inter (Modern, Clean, Professional).

---

> [!TIP]
> **Audio Tip**: Ensure the **Volume Toggle** on the Admin Dashboard is ON to activate the mission-critical alert system. For customers, hearing the "Ready" bell works best if they tap the screen once after the page loads! 🧑‍🍳🔔✨

---

## 🔗 Project Entry Points

| Portal | URL |
| :--- | :--- |
| **Customer Interface** | [http://localhost:5173](http://localhost:5173) |
| **Admin Dashboard** | [http://localhost:5173/admin](http://localhost:5173/admin) |

### 🔐 Administrative Access
- **Username**: `admin`
- **Password**: `admin123`
