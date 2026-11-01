# DineEasy - Multi-Restaurant Table Reservation & Menu Management System

**DineEasy** is an enterprise-grade multi-restaurant table reservation and live menu management platform built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

---

## 🌟 The Three Interfaces

All three interfaces are connected to the same backend REST API, database, and real-time Socket.IO event bus:

1. **Customer Website** (`http://localhost:5173/`)
   - Curated restaurant directory with search by name, address, and cuisine.
   - Comprehensive restaurant details page with categorized food menus.
   - **Interactive 6-Step Booking Wizard**:
     - **Step 1:** Select fine dining venue
     - **Step 2:** Customer details (pre-filled from profile)
     - **Step 3:** Reservation date, interactive time slots, party size & real-time table availability check
     - **Step 4:** Food menu preference (*"Would you like to select your food menu before arriving?"* - YES / NO)
     - **Step 5A:** Live menu pre-ordering from MongoDB with dish quantities and estimated total
     - **Step 5B:** Skip menu selection directly to summary
     - **Step 6:** Review booking summary, assign table, generate unique booking ID (`DE-2026-XXXX`), and view confirmation receipt
   - **My Bookings:** View upcoming & past reservations, check live confirmation status, and cancel bookings.
   - **Customer Profile:** Manage contact details and profile picture.

2. **Restaurant Dashboard** (`http://localhost:5173/restaurant-portal`)
   - Scoped strictly to the authenticated restaurant owner's venue.
   - **Dashboard Overview:** KPI metrics for total reservations, today's bookings, upcoming bookings, pending approval requests, confirmed bookings, and active menu items.
   - **Menu Management:** Full CRUD operations for menu dishes (name, category, description, price, dietary tags, image, stock availability toggle, and publish/draft toggle).
   - **Automatic Menu Synchronization:** Adding, updating, or hiding a dish immediately updates the Customer Website in real time.
   - **Reservation Queue:** Live booking reception via Socket.IO, view customer contact & kitchen food pre-orders, Accept or Reject booking requests, and assign tables.
   - **Floor Plan & Tables:** Configure dining tables, guest capacities, and seating zones (Indoor, Outdoor Garden, Rooftop Terrace, Private Dining Room).
   - **Profile Settings:** Update address, hours, cuisine, phone, cover photos, and branding.

3. **Super Admin Panel** (`http://localhost:5173/admin`)
   - Master platform control and multi-tenant oversight.
   - **Admin Dashboard:** Platform KPIs, booking status distribution charts (Confirmed vs. Pending vs. Cancelled), and total pre-order food revenue.
   - **Customer Management:** Customer directory, search, view customer profile and full booking history modal, edit details, and activate/deactivate accounts.
   - **Restaurant Management:** Onboard restaurants with manager credentials, approve/reject registrations, activate/deactivate restaurants, inspect menus and reservations.
   - **Master Reservation Ledger:** Filter bookings across all restaurants by status, date, or search, and update/cancel bookings.
   - **Platform Settings:** Platform branding, concierge support contact, auto-approval toggles, and cancellation window policies.

---

## 🎨 Design Theme

- **Premium Black:** `#0b0b0e`, `#121217`, `#1a1a23`
- **Cream White:** `#fdfbf7`, `#f7f2e7`, `#eee5d3`
- **Gold Accents:** `#d4af37`, `#e5c158`, `#f6d878`
- **Burgundy:** `#800020`, `#520014`, `#991b1b`
- **Typography:** Playfair Display (Luxury Serif) + Plus Jakarta Sans (Clean Modern UI)

---

## ⚡ Demo Quick Access (Pre-Configured Accounts)

A **Demo Quick Switcher Bar** is pinned to the top of the interface for 1-click role testing:

| Role | Name | Email | Password |
|---|---|---|---|
| **Super Admin** | System Super Admin | `admin@dineeasy.com` | `admin123` |
| **Restaurant Owner** | Chef Rajesh Mehra (*The Royal Saffron*) | `saffron@dineeasy.com` | `saffron123` |
| **Restaurant Owner** | Chef Marco Rossi (*L'Osteria Bella*) | `osteria@dineeasy.com` | `osteria123` |
| **Customer** | John Doe | `john@example.com` | `customer123` |
| **Customer** | Sarah Jenkins | `sarah@example.com` | `customer123` |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, Socket.IO Client, React Router v6.
- **Backend:** Node.js, Express.js, Socket.IO, Mongoose, JSON Web Tokens (JWT), Bcrypt.js, Multer.
- **Database:** MongoDB (Collections: `users`, `restaurants`, `menuitems`, `reservations`, `tables`, `notifications`, `adminsettings`).

---

## 🚀 Running the Project

### 1. MongoDB Database
Ensure MongoDB is running on `127.0.0.1:27017` (Default MongoDB port).
Data directory is stored at `backend/data/db`.

### 2. Backend API & Socket Server
```bash
cd backend
npm install
npm run seed     # Seeds sample restaurants, menus, tables, users, and bookings
npm start        # Starts server on http://localhost:5000
```

### 3. Frontend Web Application
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

