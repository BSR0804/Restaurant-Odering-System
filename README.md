# 🍽️ Kitchen Caboodle: High-Performance Restaurant OS

A professional, real-time dining and operations ecosystem designed for modern restaurants. This platform bridges the gap between the kitchen and the customer with sub-second synchronization and ultra-clean, high-density aesthetics.

---

## ⚡ Core Features

### 1. Real-Time Operations
- **Live Order Dashboard**: Admins receive instant notifications with audio alerts when a customer places an order.
- **Fulfillment States**: Orders transition through "Live", "Ready", and "Completed" states, synced instantly to the customer's device.
- **Real-Time Inventory**: Toggle "Available / Sold Out" status for any dish; changes propagate to all connected diners in under 0.5s.

### 2. Intelligent Diner Experience
- **Dietary Orchestration**: High-fidelity "Veg" and "Non-Veg" filters with custom Indian dietary icons (Square/Triangle).
- **Mutually Exclusive Filters**: Smart logic that deactivates the opposite filter for a focused browsing experience.
- **Micro-Animations**: Silky-smooth layout transitions using Framer Motion for a premium, app-like feel.
- **Safety Lock**: Automatic ejection of "Unavailable" items from customer carts with instant visual warnings.

### 3. Business Telemetry
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

### 3. Operational Access
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Credentials**: `admin` / `admin123`
- **Table Orders**: Use `?table=N` parameters (e.g., `?table=5`) to simulate QR scans.

---

## 📊 Database Schema
The system utilizes a relational model for high-integrity operations:
- **`menu`**: Stores dish name, category, price, type (veg/non-veg), and real-time `is_available` status.
- **`orders`**: Tracks live fulfillment states, table assignments, and financial totals.

---

## 🎨 Visual Language
- **Theme**: Premium Dark Mode (#0A0A0B).
- **Accents**: Gold (#C9A96E) for luxury and Green/Red for dietary clarity.
- **Typography**: Inter (Modern, Clean, Professional).

---

> [!TIP]
> To ensure real-time synchronization is active, verify that the **"Connected"** status dot in the admin sidebar is green.
