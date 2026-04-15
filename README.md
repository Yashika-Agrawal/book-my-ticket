# 🎬 Book My Ticket – Backend System

A simplified movie seat booking backend system built by extending an existing codebase.
This project focuses on implementing **authentication, protected routes, and concurrency-safe booking logic**.

---

## 🚀 Features

* 🔐 User Registration (with hashed passwords)
* 🔑 User Login with JWT authentication
* 🍪 Secure authentication using HTTP-only cookies
* 🛡️ Protected booking routes (only logged-in users can book)
* 🎟️ Seat booking system
* 🚫 Prevention of duplicate bookings
* ⚡ Concurrency-safe booking using SQL transactions (`FOR UPDATE`)
* 🗄️ PostgreSQL database with relational design

---

## 🧠 Tech Stack

* Node.js
* Express.js
* PostgreSQL
* bcrypt
* jsonwebtoken
* Docker (for local DB setup)

---

## 📂 Project Structure

```bash
.
├── controllers/
│   └── auth.controller.mjs
├── middleware/
│   └── auth.middleware.mjs
├── config/
│   └── db.mjs
├── db/
│   └── init.sql
├── index.mjs
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone <your-repo-link>
cd book-my-ticket
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env` file:

```env
JWT_SECRET=your_secret_key
PORT=8080
```

---

### 4️⃣ Setup PostgreSQL (Docker)

Run:

```bash
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sql_class_2_db \
  -p 5433:5432 \
  postgres
```

---

### 5️⃣ Initialize database

Run queries from:

```bash
db/init.sql
```

This will:

* Create `users` table
* Create `seats` table
* Seed initial seat data

---

### 6️⃣ Start server

```bash
node index.mjs
```

Server runs on:

```text
http://localhost:8080
```

---

## 🔐 Authentication Flow

1. User registers with name, email, password
2. Password is hashed using bcrypt
3. User logs in
4. JWT token is generated
5. Token is stored in HTTP-only cookie
6. Middleware verifies token for protected routes

---

## 🎟️ Booking Flow

1. User logs in
2. User sends request to book a seat
3. Middleware validates authentication
4. System starts a DB transaction
5. Seat row is locked using:

```sql
SELECT * FROM seats WHERE id = $1 AND isbooked = 0 FOR UPDATE;
```

6. If seat is available:

   * Mark as booked
   * Associate with `user_id`
7. Commit transaction

---

## 🧠 Concurrency Handling

To prevent multiple users from booking the same seat:

* Row-level locking (`FOR UPDATE`) is used
* Ensures only one transaction can modify a seat at a time

---

## 📌 API Endpoints

### 🔐 Auth

* `POST /register` → Register user
* `POST /login` → Login user

---

### 🎟️ Seats

* `GET /seats` → Get all seats
* `PUT /:id` → Book a seat (Protected)

---

## 🙌 Acknowledgement

This project is built as part of a hackathon assignment based on the Chai Aur SQL course, focusing on extending an existing codebase with real-world backend concepts.

---
