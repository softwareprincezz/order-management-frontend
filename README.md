# Order Management - Frontend

React application for managing orders and products, built with React and Vite.

**Author:** Sharon Barrial  
**Date:** 2026-03-04

## 📋 Requirements

- Node.js v16+
- npm
- Backend API running on `http://localhost:5000`

## 🚀 Installation

### 1. Install dependencies

```bash
cd react-orders
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

## 📁 Project Structure

```
src/
├── pages/
│   ├── MyOrders.jsx       # Main view - list of orders
│   ├── AddEditOrder.jsx   # Create and edit orders
│   └── Products.jsx       # Product catalog management
├── services/
│   └── api.js             # Axios instance and API calls
└── App.jsx                # Routes configuration
```

## 🗂️ Views

### My Orders `/my-orders`
- Lists all orders in a table
- Change order status (Pending, InProgress, Completed)
- Edit and delete orders
- Completed orders are locked from editing
- Navigate to Products view

### Add / Edit Order `/add-order` · `/add-order/:id`
- Create or edit an order
- Date auto-filled with current date (disabled)
- Product count and final price auto-calculated (disabled)
- Add, edit and remove products from the order via modals

### Products `/products`
- List all products in the catalog
- Add, edit and delete products

## 🔧 Proxy Configuration

The frontend proxies API requests to the backend via Vite. Make sure `vite.config.js` includes:

```js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

## 📦 Dependencies

- **react** + **react-dom**: UI library
- **react-router-dom**: Client-side routing
- **axios**: HTTP requests

## ✅ Features

- ✅ Full order management (create, edit, delete)
- ✅ Full product catalog management
- ✅ Auto-calculated order totals
- ✅ Status management with dropdown
- ✅ Completed orders locked from editing
- ✅ Modal for adding and editing order products
- ✅ Responsive layout