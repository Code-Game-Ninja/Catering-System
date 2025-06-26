# 🍽️ CaterEase Platform

<div align="center">

![Screenshot_2025-06-26_213843-removebg-preview (1)](https://github.com/user-attachments/assets/f6f251b1-557e-4361-a9d7-4ba5c0e58756)

**A Modern Restaurant & Catering Management Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge\&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9-orange?style=for-the-badge\&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge\&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge\&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Live Demo](https://v0-restro-six.vercel.app) • [📖 Documentation](#) • [🐛 Report Bug](#) • [💡 Request Feature](#)

</div>

---

## 🌟 Overview

CaterEase is a comprehensive restaurant and catering management platform that connects food producers with customers. Built with modern web technologies, it provides a seamless experience for ordering, managing, and delivering culinary experiences.

### ✨ Key Highlights

* 🎨 **Modern UI/UX** - Clean, responsive design with custom color scheme
* ⚡ **Real-time Updates** - Live order tracking and notifications
* 🔐 **Secure Authentication** - Firebase-powered user management
* 📱 **Mobile Responsive** - Works perfectly on all devices
* 🛒 **Smart Cart System** - Intuitive shopping experience
* 📊 **Analytics Dashboard** - Comprehensive business insights

---

## 🚀 Features

### 👥 For Customers

* 🍽️ **Browse Menus** - Explore diverse food options from local producers
* 🛒 **Smart Cart** - Easy ordering with real-time price calculations
* 💳 **Secure Checkout** - Multiple payment options with Stripe integration
* 📱 **Order Tracking** - Real-time updates on order status
* 🔔 **Notifications** - Instant alerts for order updates
* 👤 **Profile Management** - Manage personal information and order history

### 🏪 For Producers/Restaurants

* 📋 **Menu Management** - Easy-to-use interface for managing food items
* 📊 **Order Dashboard** - Comprehensive view of incoming orders
* 💰 **Revenue Tracking** - Monitor sales and performance metrics
* 🔔 **Real-time Alerts** - Instant notifications for new orders
* 📈 **Analytics** - Detailed insights into business performance
* 🖼️ **Media Management** - Upload and manage food images

### 👨‍💼 For Administrators

* 🏗️ **Admin Dashboard** - Complete platform oversight
* 👥 **User Management** - Manage customers and producers
* 📊 **Platform Analytics** - System-wide performance metrics
* 🔧 **System Configuration** - Platform settings and maintenance
* 📋 **Order Management** - Monitor and manage all platform orders

---

## 🛠️ Tech Stack

### Frontend

* **Framework**: Next.js 14 with App Router
* **Language**: TypeScript
* **Styling**: Tailwind CSS + shadcn/ui
* **State Management**: React Hooks + Context API
* **Icons**: Lucide React

### Backend & Database

* **Authentication**: Firebase Auth
* **Database**: Firestore (NoSQL)
* **Storage**: Firebase Storage
* **Real-time**: Firestore Listeners
* **Hosting**: Vercel

### Payment & Integration

* **Payments**: Stripe
* **Email**: (Ready for integration)
* **Analytics**: Firebase Analytics

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* npm or yarn
* Firebase account
* Stripe account (for payments)(This part is in working phase, so please Check COD)
Here’s a **cleaned-up and corrected** version of your `Installation` section with the actual GitHub repository link and improved formatting for better clarity:

---

## 🚀 Installation Guide

Follow these steps to set up and run the **CaterEase Platform** on your local machine:

---

### 1. **Clone the Repository**

```bash
git clone https://github.com/Code-Game-Ninja/Catering-System.git
cd Catering-System
```

---

### 2. **Install Dependencies**

Use **npm** or **yarn** to install project dependencies:

```bash
npm install
# or
yarn install
```

---

### 3. **Set Up Environment Variables**

Copy the example `.env` file and fill in your Firebase and Stripe credentials:

```bash
cp .env.example .env.local
```

Then open `.env.local` and update it with your configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

---

### 4. **Configure Firebase**

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable the following services:

   * **Authentication** (Email/Password or Google)
   * **Firestore Database**
   * **Storage**
3. Deploy Firestore rules (optional but recommended):

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

> Make sure you're logged in to Firebase CLI and linked to your project.

---

### 5. **Run the Development Server**

```bash
npm run dev
# or
yarn dev
```

---

### 6. **Open the App in Your Browser**

Go to: [http://localhost:3000](http://localhost:3000)

---

## 📱 Screenshots

<div align="center">

### 🏠 Homepage

![image](https://github.com/user-attachments/assets/00afece8-e06a-4a60-a88e-8363d51990f0)

### 🍽️ Menu Browse

![image](https://github.com/user-attachments/assets/af5187c6-3795-4850-a1f0-1f43b296020b)

### 🛒 Shopping Cart

![image](https://github.com/user-attachments/assets/26b3de03-43dd-4bff-9c06-e36c401a6604)

### 📊 Producer Dashboard

![image](https://github.com/user-attachments/assets/134e1eb0-c33e-42c6-b6cf-dee6a9a64e26)

</div>

---

## 🎨 Color Scheme

Our carefully crafted color palette creates a warm, inviting experience:

* 🌿 **Primary Green**: `#264653` - Trust and freshness
* 🌊 **Teal**: `#2A9D8F` - Modern and clean
* ☀️ **Yellow**: `#E9C46A` - Energy and warmth
* 🥚 **Orange**: `#F4A261` - Appetite and enthusiasm
* 🔥 **Coral**: `#E76F51` - Action and excitement

---

## 📁 Project Structure

```bash
caterease-platform/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── menu/              # Menu browsing
│   ├── orders/            # Order management
│   ├── producer-dashboard/ # Producer interface
│   └── profile/           # User profiles
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── scripts/              # Database and utility scripts
├── public/               # Static assets
└── styles/               # Global styles
```

---

## ⚖️ Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Set up Firestore database
4. Configure Storage bucket
5. Deploy security rules from `firestore.rules` and `storage.rules`

### Stripe Setup

1. Create a Stripe account
2. Get your publishable and secret keys
3. Configure webhooks for order processing
4. Set up payment methods

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

* [Next.js](https://nextjs.org/) - The React framework for production
* [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
* [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
* [Lucide](https://lucide.dev/) - Beautiful & consistent icons

---

## 📞 Support

* 📧 **Email**: [support@caterease.com](mailto:chiragmishra2511@gmail.com)
* 📖 **Documentation**: [docs.caterease.com](#)
* 🐛 **Issues**: [GitHub Issues](https://github.com/Code-Game-Ninja/caterease-platform/issues)

---

<div align="center">

**Made with ❤️ by the Chirag Mishra**

[⭐ Star this repo](https://github.com/Code-Game-Ninja/Catering-System) • [🍝 Fork it](https://github.com/Code-Game-Ninja/Catering-System/fork) 

</div>

---

##Note

This only work to see, if you order the food that will not delivered 😅😅.
