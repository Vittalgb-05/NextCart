# NextCart 🛒 
A high-performance Full-Stack E-Commerce Application built with Next.js.

## 🌟 Features
* **Full-Featured Admin Dashboard**: A dedicated, secure administrative panel allowing you to:
  * **Product Management**: Add, edit, and delete products (Complete CRUD).
  * **Order Fulfillment**: Track, update, and manage customer orders.
  * **User Management**: Oversee registered users and permissions.
  * **Inventory Control**: Track and manage live stock levels.
* **Modern UI/UX**: Native-app style splash screen and smooth entry animations.
* **Dark/Light Mode**: Full theme toggling using Tailwind CSS and `next-themes`.
* **User Authentication**: Secure social and passwordless login powered by Clerk.
* **Product Catalog**: Dynamic product listings, details pages, and intelligent search filtering.
* **Wishlist & Cart**: Global state management to save favorites and track shopping cart items.
* **Automated Emails**: Server-side contact form delivery using Nodemailer and Gmail SMTP.
* **Responsive Design**: Fully mobile-optimized layouts for all devices.

## 🛠️ Technology Stack
* **Frontend**: Next.js 14, React 18, Tailwind CSS
* **Backend**: Node.js, Next.js API Routes
* **Database**: MongoDB (with Mongoose)
* **Authentication**: Clerk
* **Email Service**: Nodemailer

## 🚀 How to Setup

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Vittalgb-05/NextCart.git
cd NextCart
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following required keys:
```env
# Core Settings
NEXT_PUBLIC_CURRENCY=₹

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB Database
MONGODB_URI=your_mongodb_connection_string

# Inngest Setup (Background Jobs)
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key

# Cloudinary (Image Hosting)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Store Contact Info
NEXT_PUBLIC_CONTACT_PHONE=your_store_phone
NEXT_PUBLIC_CONTACT_EMAIL=your_store_email

# Automated Email Settings (SMTP via Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. View the App
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal, such as `3001`).
