# MARD Backend API Documentation

This document provides an overview of all API endpoints in the MARD backend project, including authentication, user management, inventory, sales, transfers, and notifications. It will be updated as new APIs are added.

---

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Inventory](#inventory)
- [Sales](#sales)
- [Transfers](#transfers)
- [Notifications](#notifications)
- [Health Check](#health-check)
- [Future API Updates](#future-api-updates)

---

## Authentication

### POST `/api/auth/register`

Register a new user. Sends verification email.

- **Body:** `{ name, email, password, phone, role? }`
- **Response:** `{ message }`

### POST `/api/auth/login`

Login with email and password.

- **Body:** `{ email, password }`
- **Response:** `{ token, user }`

### GET `/api/auth/verify-email?token=...`

Verify user email with token.

- **Response:** `{ message }`

---

## User Management

### GET `/api/users/:id`

Get user details by ID.

- **Auth:** Required
- **Response:** `User`

### PATCH `/api/users/:id/role`

Update user role (admin only).

- **Body:** `{ role }`
- **Response:** `User`

### GET `/api/users/all`

List all users (admin only).

- **Response:** `User[]`

---

## Inventory

### GET `/api/inventory/shop`

Shopkeeper: View items in their own shop.

- **Auth:** Shopkeeper
- **Response:** `ShopItem[]`

### GET `/api/inventory/store`

Storekeeper: View items in their assigned store.

- **Auth:** Storekeeper
- **Response:** `StoreItem[]`

### GET `/api/inventory/any?shopId=...|storeId=...`

Admin: View any shop/store inventory.

- **Auth:** Admin
- **Response:** `ShopItem[]` or `StoreItem[]`

---

## Sales

### POST `/api/shop/sale`

Record a sale in a shop.

- **Auth:** Shopkeeper
- **Body:** `{ items: [{ itemId, quantitySold }] }`
- **Response:** `{ message }`

### GET `/api/shop/sales`

List sales for a shop (with filters).

- **Auth:** Shopkeeper
- **Query:** `date, week, month, year, itemId, allProducts`
- **Response:** `Sale[]`

---

## Transfers

### POST `/api/transfer/request`

Request a transfer between shops/stores.

- **Auth:** Shopkeeper/Storekeeper
- **Body:** `{ fromId, toId, items }`
- **Response:** `{ message }`

### POST `/api/transfer/approve`

Approve a transfer request.

- **Auth:** Admin
- **Body:** `{ requestId }`
- **Response:** `{ message }`

### POST `/api/transfer/reject`

Reject a transfer request.

- **Auth:** Admin
- **Body:** `{ requestId }`
- **Response:** `{ message }`

### GET `/api/transfer/list`

List transfer requests (with filters).

- **Auth:** Required
- **Query:** `status, from, to, requestedBy`
- **Response:** `TransferRequest[]`

### POST `/api/transfer/admin-transfer`

Admin can directly transfer stock.

- **Auth:** Admin
- **Body:** `{ fromId, toId, items }`
- **Response:** `{ message }`

---

## Notifications

### GET `/api/notifications/`

List notifications for the user.

- **Auth:** Required
- **Response:** `Notification[]`

### POST `/api/notifications/read`

Mark a notification as read.

- **Auth:** Required
- **Body:** `{ notificationId }`
- **Response:** `{ message }`

### GET `/api/notifications/unread-count`

Get count of unread notifications.

- **Auth:** Required
- **Response:** `{ count }`

### DELETE `/api/notifications/:id`

Delete a notification.

- **Auth:** Required
- **Response:** `{ message }`

---

## Health Check

### GET `/api/check/health`

Check API/server health.

- **Response:** `{ status: 'ok' }`

---

## Future API Updates

- **All new APIs must be documented here with:**
  - Endpoint path and method
  - Description
  - Auth requirements
  - Request body/query params
  - Response format

---

_Last updated: July 26, 2025_
