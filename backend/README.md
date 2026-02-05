# 🍎 Food Waste Tracker API

A comprehensive RESTful API for tracking food inventory, monitoring expiration dates, reducing food waste, and facilitating food donations. Built with Flask and PostgreSQL/SQLite.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.x-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Overview](#-api-overview)
- [Database Models](#-database-models)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **🔐 User Authentication** - Secure JWT-based registration and login
- **📦 Food Inventory Management** - Add, update, delete, and track food items
- **⏰ Expiry Tracking & Alerts** - Get notifications for expiring and expired items
- **📊 Analytics Dashboard** - Track usage, donations, and waste statistics
- **🏷️ Category Management** - Organize food items by custom categories
- **📝 Activity Logging** - Track all food-related actions (used, donated, wasted)
- **🏛️ Donation Centers** - Manage and discover local donation centers
- **🤝 Donation Offers** - Create and track food donation offers

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Flask** | Web framework |
| **Flask-SQLAlchemy** | ORM for database operations |
| **Flask-JWT-Extended** | JWT authentication |
| **PostgreSQL / SQLite** | Database (Supabase compatible) |
| **Werkzeug** | Password hashing |
| **python-dotenv** | Environment variable management |

---

## 📁 Project Structure

```
food-waste-tracker/
├── main.py              # Main application with all API routes
├── models.py            # SQLAlchemy database models
├── config.py            # Application configuration
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not tracked in git)
├── API_DOCUMENTATION.md # Comprehensive API documentation
└── instance/            # SQLite database files (if using SQLite)
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- PostgreSQL (optional, SQLite works for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-waste-tracker
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv env
   
   # Windows
   env\Scripts\activate
   
   # macOS/Linux
   source env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Flask Configuration
SECRET_KEY=your-super-secret-key

# Database Configuration
DATABASE_URL=sqlite:///database.db
# For PostgreSQL/Supabase:
# DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
```

### Running the Application

```bash
# Development mode
flask run

# Or directly with Python
python main.py
```

The API will be available at `http://localhost:5000`

---

## 📖 API Overview

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Auth** | `/api/auth/register`, `/api/auth/login` | User registration & authentication |
| **Profile** | `/api/users/me` | User profile management |
| **Categories** | `/api/category` | Food category CRUD |
| **Food** | `/api/food`, `/api/food/<id>` | Food inventory management |
| **Alerts** | `/api/food/alerts` | Expiry notifications |
| **Food Logs** | `/api/food-logs` | Activity tracking |
| **Analytics** | `/api/analytics` | Usage statistics |
| **Donation Centers** | `/api/donation-centers` | Donation center management |
| **Donation Offers** | `/api/donation-offers` | Donation offer management |

> 📚 **Full API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint specifications, request/response examples, and frontend integration notes.

### Quick Start Examples

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "secure123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secure123"}'
```

**Add a food item (authenticated):**
```bash
curl -X POST http://localhost:5000/api/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"name": "Milk", "category": 1, "quantity": 2, "unit": "liters", "expiry_date": "2026-02-15"}'
```

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| **User** | User accounts with authentication |
| **Category** | User-defined food categories |
| **Food** | Food inventory items with expiry tracking |
| **Userlog** | Activity logs for food actions |
| **DonationCenter** | Local donation center information |
| **DonationOffer** | Food donation offers |
| **DonationOfferItem** | Individual items in donation offers |

### Entity Relationship

```
User ─┬─ Category (1:many)
      ├─ Food (1:many)
      ├─ Userlog (1:many)
      └─ DonationOffer (1:many)

Food ─┬─ Userlog (1:many)
      └─ DonationOfferItem (1:many)

DonationCenter ─── DonationOffer (1:many)
DonationOffer ─── DonationOfferItem (1:many)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author 

**Yashasvi Agrawal**


