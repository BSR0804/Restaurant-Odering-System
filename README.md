# QR-Based Restaurant Ordering System

A premium, real-time ordering platform for modern restaurants.

## Features
- **📱 QR-Driven**: Tables have unique QR codes linking directly to their menu.
- **⚡ Real-time**: Notifications delivered to the owner's dashboard via Socket.io.
- **💳 Integrated Payments**: Razorpay-ready checkout (Demo mode active).
- **🎨 Glassmorphism UI**: High-end, mobile-responsive dark theme.

## Getting Started

### 1. Start the Backend
Go to the `backend` folder and start the server:
```bash
cd backend
node server.js
```
The server will run on `http://localhost:5000`. It initializes a sample `restaurant.db` (SQLite) upon first run.

### 2. Start the Frontend
Go to the `frontend` folder and run the development server:
```bash
cd frontend
npm run dev
```
The app will typically open on `http://localhost:5173`.

### 3. Testing Table Orders
Scan the generated QR codes in `backend/qrcodes` or use these sample URLs:
- **Table 1**: [http://localhost:5173/?table=1](http://localhost:5173/?table=1)
- **Table 4**: [http://localhost:5173/?table=4](http://localhost:5173/?table=4)

### 4. Admin Dashboard
Access the real-time orders dashboard with your credentials:
- **URL**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Username**: `admin`
- **Password**: `admin123`

## Assets
- **Table QRs**: High-quality PNGs generated in `backend/qrcodes/`.
- **Audio Alerts**: Automatically plays a "Bell" sound on new orders in the admin dashboard.

## Tech Stack
-   **Frontend**: React, Framer Motion, Lucide Icons, Socket.io-client.
-   **Backend**: Node.js, Express, Socket.io, SQLite, Razorpay.
