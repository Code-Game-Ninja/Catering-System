# 🧾 Low-Level Design (LLD) – Catering System

---

## 🔰 1. Overview

The **Catering System** is a web-based platform for food order management, tailored for both customers and administrators. It offers menu browsing, cart and order features for users, and management tools for admins.

---

## 🧱 2. System Modules

| **Module**           | **Responsibilities**                                   |
| -------------------- | ------------------------------------------------------ |
| 👤 **User Service**  | User registration, login, profile updates              |
| 🍽️ **Menu Service** | CRUD operations for food/menu items                    |
| 🛒 **Cart Service**  | Cart creation, update, and persistence                 |
| 📦 **Order Service** | Handles checkout, order placement and status tracking  |
| 🛠️ **Admin Panel**  | Admin dashboard for order and menu management          |
| 🔐 **Auth Service**  | JWT-based authentication and role-based access control |

---

## 🔄 3. API & Class Structure

### 👤 User Model

```js
User {
  id: UUID,
  name: String,
  email: String,
  passwordHash: String,
  role: 'user' | 'admin',
  createdAt: Date
}
```

**API Endpoints**

* `POST /api/users/register` – Register new user
* `POST /api/users/login` – Authenticate user
* `GET /api/users/profile` – Get current user details
* `PUT /api/users/profile` – Update user profile

---

### 🍲 Menu Model

```js
MenuItem {
  id: UUID,
  name: String,
  description: String,
  price: Number,
  category: String,
  isAvailable: Boolean
}
```

**API Endpoints**

* `GET /api/menu` – View all items
* `POST /api/menu` – Add new item *(admin only)*
* `PUT /api/menu/:id` – Edit item details
* `DELETE /api/menu/:id` – Remove item

---

### 🛒 Cart Model

```js
Cart {
  userId: UUID,
  items: [
    {
      itemId: UUID,
      quantity: Number
    }
  ]
}
```

**API Endpoints**

* `GET /api/cart` – View cart
* `POST /api/cart` – Add/update item
* `DELETE /api/cart/:itemId` – Remove item

---

### 📦 Order Model

```js
Order {
  id: UUID,
  userId: UUID,
  items: [MenuItem],
  totalAmount: Number,
  status: 'placed' | 'in_progress' | 'completed',
  createdAt: Date
}
```

**API Endpoints**

* `POST /api/orders` – Place order
* `GET /api/orders` – Get all orders *(filtered by user/admin)*
* `PUT /api/orders/:id/status` – Update status *(admin only)*

---

## 🧩 4. Entity-Relationship Diagram (ERD)

```
User ───< Orders
User ──── Cart
MenuItem ─< OrderItems
```

(*Visual ERD can be provided as PNG or PlantUML if needed*)

---

## 🔁 5. Component Interaction Flow

1. **User registers/logs in**
2. **Menu items fetched and displayed**
3. **Cart updated in real time**
4. **Checkout triggers order creation**
5. **Admin views/manages orders**

---

## 🛡️ 6. Security Architecture

* **JWT Authentication** for protected routes
* **Bcrypt password hashing**
* **Role-based access** (User/Admin guards)
* **CORS & rate limiting** for APIs

---

## ⚙️ 7. Non-Functional Requirements

| Requirement        | Description                                |
| ------------------ | ------------------------------------------ |
| 🔄 **Scalability** | APIs designed for horizontal scaling       |
| ⚡ **Performance**  | Optimized database indexing & pagination   |
| 🔍 **Monitoring**  | Logging (Winston), Error Tracking          |
| 🧪 **Testing**     | Unit + Integration tests (Jest, Supertest) |

---

## 📦 8. Deliverables

* 📄 `LLD_Document.md` – This document
* 🧾 `OpenAPI.yaml` – Swagger API documentation *(on request)*
* 🗃️ `ER Diagram` – PNG/PDF format
* 🔍 `Postman Collection` – For API testing

