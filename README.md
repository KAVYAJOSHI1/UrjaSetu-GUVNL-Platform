# UrjaSetu - Smart Electrical Issue Reporting Platform ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![AI-Powered](https://img.shields.io/badge/AI-YOLOv8-red.svg)](https://ultralytics.com/)

**UrjaSetu** is a next-generation digital platform designed to streamline the reporting, tracking, and resolution of electrical infrastructure issues. Built for **GUVNL**, it leverages Artificial Intelligence to automatically detect hazards like pole fires and broken wires, ensuring rapid response and grid safety.

---

## 🚀 Key Features

### 🧠 AI & Automation
*   **Automatic Defect Detection**: Upload a photo, and our YOLOv8 model instantly identifies issues (e.g., *Pole Fire, Broken Meter, Sparking Wire*) with high confidence.
*   **Risk Analysis**: Predictive algorithms identify high-risk zones based on infrastructure age and incident history.

### 📱 Applications
*   **Citizen App**: Report issues in seconds, track status real-time, and get notified upon resolution. Works offline!
*   **Technician App**: Receive tasks, navigate to locations, and upload "Proof of Work" photos to close tickets.
*   **Admin Dashboard**: A powerful Kanban-style command center for managing issues, assigning staff, and visualizing grid health on maps.

### ⚙️ Technical Highlights
*   **Local-First Architecture**: Robust Node.js & SQLite backend that runs entirely on your local machine.
*   **Multi-Language**: Full support for English, Hindi, and Gujarati (Planned).
*   **Real-time Updates**: Live status changes across all devices using WebSockets.

---

## 🛠️ Installation & Setup

Prerequisites: Node.js (v18+), Python (3.9+), and npm/yarn.

### 1. Clone the Repository
```bash
git clone https://github.com/KAVYAJOSHI1/UrjaSetu-GUVNL-Platform.git
cd UrjaSetu-GUVNL-Platform
```

### 2. Setup Backend (Local Server)
The backend handles API requests, AI processing, and the database.
```bash
cd local-backend
npm install
node server.js
```
*Server runs on `http://localhost:3000`*

### 3. Setup AI Model (Python)
Install dependencies to run the YOLOv8 detection script.
```bash
# From project root
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install ultralytics opencv-python-headless
```
*Ensure `best.pt` is present in the root directory.*

### 4. Run Mobile App (Citizen/Lineman)
```bash
cd mobile-app
npm install
npx expo start
```
*Use Expo Go on your phone or an emulator to scan the QR code.*

### 5. Run Admin Web Portal
```bash
cd web-portal
npm install
npm run dev
```
*Opens typically on `http://localhost:5173`*

---

## 📂 Project Structure

```
URJASETU/
├── local-backend/      # Node.js Express Server + SQLite DB
├── mobile-app/         # React Native (Expo) Application
├── web-portal/         # React Admin Dashboard
├── scripts/            # Python AI Inference & Training Scripts
├── dataset/            # Training Images (Not included in repo)
├── best.pt             # Trained YOLOv8 AI Model
└── README.md           # Project Documentation
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the MIT License.
