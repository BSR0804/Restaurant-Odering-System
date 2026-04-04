# 🍽️ Kitchen Caboodle: Cloud-Native Restaurant OS

A professional, real-time dining and operations ecosystem designed for modern restaurants, now fully migrated to a **High-Integrity Cloud Infrastructure**. This platform bridges the gap between the kitchen and the customer with sub-second synchronization, ultra-clean high-density aesthetics, and production-grade data persistence.

---

## ⚡ Core Features

### 1. Cloud-Native Persistence (Supabase) ☁️
- **PostgreSQL Ledger**: Substituted local SQLite for a mission-critical **Supabase PostgreSQL** instance.
- **Identity-Mapped History**: Orders are securely tied to **Google Identity** emails, allowing persistent history across devices.
- **Atomic Sync**: Deduplicated dashboard logic ensures zero "ghost" orders or revenue inflation.

### 2. Neural Audio Orchestration 🔔
- **Unique Auditory Signatures**: 
  - **Admin**: "Bell" alert for every new incoming order.
  - **Customer**: "Happy Bells" high-fidelity notification specifically when their order is marked as **Ready**.
- **Browser-Interaction Priming**: Smart logic that "unlocks" auditory permissions, ensuring alerts fire even on dimmed screens.

### 3. Elite UX Language 🎨
- **Seamless Loading**: Replaced jarring loading screens with a **Glassmorphic Skeleton UI** for a high-end browsing experience.
- **Category Lock**: Browse across 33+ items without losing your scroll or category position when adding to the cart.
- **Revenue Telemetry**: Real-time business metrics (Revenue and Orders Processed) calculated from confirmed cloud-writes.

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
*Access the app at `http://localhost:5173`.*

---

## 🔗 Project Entry Points

| Portal | URL |
| :--- | :--- |
| **Customer Interface** | [http://localhost:5173](http://localhost:5173) |
| **Admin Dashboard** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **User Account** | [http://localhost:5173/account](http://localhost:5173/account) |

### 🔐 Administrative Access
- **Username**: `admin`
- **Password**: `admin123`

---

> [!IMPORTANT]
> **Cloud Migration**: This project is now fully decoupled from local storage. Every order, status update, and revenue metric is stored in the **Supabase Cloud Ledger**, ensuring 100% data integrity even after a server restart. 🧑‍🍳📊🌐✅✨
