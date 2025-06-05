# ☀️ NewSolar - Solar Energy Management System

> 🌱 **A modern management solution for sustainable energy**

NewSolar is a comprehensive web application that monitors solar energy production and consumption in real-time, manages battery systems, and provides intelligent grid interaction.

## ✨ Features

### 🏠 Main Dashboard
- 📊 **Real-Time Data Display** - Live power generation, consumption and battery status
- 📈 **Interactive Charts** - Dynamic data visualization with Chart.js
- ⚡ **Energy Flow Diagram** - Energy flow between system components
- 🔋 **Battery Management** - SOC monitoring and smart charge/discharge control

### 👥 User Management
- 🔐 **Role-Based Access** - Admin, Installer and User roles
- 🛡️ **JWT Authentication** - Secure authentication
- 👤 **User Profiles** - Personalized dashboards
- 🔄 **User Switching** - Quick user switching for Admin/Installer

### 📡 IoT Integration
- 🌐 **ThingSpeak Integration** - Cloud-based data collection
- 🐍 **Python Simulation** - Realistic solar panel data generation
- 📱 **RESTful API** - Microservice architecture
- 🔄 **Automatic Data Updates** - Data refresh every 30 seconds

### 📊 Data Analysis
- 📅 **Time Filters** - Hourly, daily, weekly analysis
- 🌡️ **Environmental Factors** - Temperature and irradiance impact analysis
- ⚙️ **Efficiency Calculation** - Panel performance optimization
- 🔌 **Grid Interaction** - Energy buy/sell tracking

## 🛠️ Technology Stack

### Frontend 🎨
```
🅰️ Angular 18.0+     │ Modern web framework
📘 TypeScript 5.0+    │ Type-safe programming
📊 Chart.js 4.0+      │ Data visualization
🎨 Bootstrap CSS      │ Responsive design
⚡ RxJS               │ Reactive programming
```

### Backend ⚙️
```
🟢 Node.js 18.0+      │ JavaScript runtime
🚀 Express.js 4.18+   │ Web framework
🍃 MongoDB & Mongoose │ NoSQL database
🔐 JSON Web Token     │ Authentication
🔒 bcryptjs           │ Password hashing
📡 Axios              │ HTTP client
```

### IoT & Simulation 🔬
```
🐍 Python 3.8+        │ Simulation engine
📊 ThingSpeak API      │ IoT data platform
🧮 Math & Random       │ Mathematical modeling
⏰ Datetime           │ Time management
```

## 🚀 Quick Start

### 📋 System Requirements
- 🟢 **Node.js** v18.0.0 or higher
- 🐍 **Python** 3.8 or higher  
- 🍃 **MongoDB** Community Edition
- 🌐 **Web Browser** Chrome, Firefox or Safari 
- 💻 **OS** Windows 10/11, macOS 10.15+, Ubuntu 18.04+

### 📥 Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/newsolar.git
cd newsolar
```

#### 2️⃣ Backend Setup
```bash
cd solar-backend
npm install
npm start
```
🌐 Backend: http://localhost:3000

#### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
ng serve
```
🌐 Frontend: http://localhost:4200

#### 4️⃣ Python Simulation
```bash
# In main directory
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python simulation.py
```

## 📁 Project Structure

```
newsolar/
├── 🎨 frontend/                 # Angular UI
│   ├── src/app/
│   │   ├── 🏠 home/            # Main dashboard
│   │   ├── 👑 admin/           # Admin panel  
│   │   ├── 🔧 installer/       # Installer panel
│   │   ├── 🔧 services/        # API services
│   │   └── 🛡️ guards/          # Route guards
│   └── package.json
├── ⚙️ solar-backend/           # Node.js API
│   ├── 🎛️ controllers/        # Business logic
│   ├── 📊 models/              # Data models
│   ├── 🛣️ routes/              # API routes
│   ├── 🛡️ middleware/          # Auth middleware
│   ├── ⚙️ config/              # Configuration
│   ├── 🔧 utils/               # Helper tools
│   └── index.js                # Main server
├── 🐍 simulation.py            # Real-time simulation
├── 🧪 testkodusaat.py         # Test simulation
├── 📋 requirements.txt         # Python packages
└── 📖 README.md               # This file
```

## 📊 API Documentation

### 🔐 Authentication Endpoints
```http
POST   /api/auth/login          # 👤 User login
POST   /api/auth/register       # ✍️ User registration
GET    /api/auth/profile        # 👤 Profile information
GET    /api/auth/users          # 👥 User list (Admin)
POST   /api/auth/users          # ➕ Add user (Admin)
PUT    /api/auth/users/:id      # ✏️ Update user
DELETE /api/auth/users/:id      # 🗑️ Delete user
```

### 📊 Solar Data Endpoints
```http
GET    /solar-data              # ☀️ Fetch solar data
```

## 🌟 Screenshots

### 🏠 Main Dashboard
*Modern and user-friendly interface with real-time data display*

### 📊 Data Charts
*Detailed analysis with interactive Chart.js graphs*

### 👑 Admin Panel
*Comprehensive user management and system control*

## 🧪 Testing

### 🔍 Testing Different Hours
```python
# In testkodusaat.py file
test_hour = 14  # Test noon hour
python testkodusaat.py
```

### 🚀 API Tests
```bash
# Backend tests
cd solar-backend
npm test

# Frontend tests  
cd frontend
ng test
```

## 🤝 Contributing

1. 🍴 Fork the project
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request


## 🙏 Acknowledgments

- ☀️ **ThingSpeak** - For IoT data platform
- 📊 **Chart.js** - For beautiful charts
- 🅰️ **Angular Team** - For the amazing framework
- 🟢 **Node.js Community** - For backend technology


⭐ **If you like this project, don't forget to give it a star!**

🌱 *Let's work together for a sustainable energy future!* 
