# NextCart 🛒 
A high-performance Full-Stack E-Commerce Application built with Next.js.

## 🌟 Features
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
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB Database
MONGODB_URI=your_mongodb_connection_string

# Nodemailer Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 4. Run the Development Server
```bash
npm run dev
```

### 5. View the App
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal, such as `3001`).
