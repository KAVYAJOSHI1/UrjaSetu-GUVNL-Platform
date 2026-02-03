# UrjaSetu - Smart Electrical Issue Reporting Platform

UrjaSetu is a comprehensive digital platform designed to streamline the reporting, tracking, and resolution of electrical infrastructure issues. It leverages AI for automated defect detection and provides dedicated interfaces for citizens, administrators, and field technicians.

## 🚀 Key Features

### 🧠 AI & Automation
*   **Automated Defect Detection**: Integrated YOLOv8 computer vision model to automatically classify issues from user-uploaded photos.
    *   **Classes**: Pole Fire, Broken Meter Box, Wire Short Circuit, Broken Pole, etc.
    *   **Confidence Scoring**: Returns confidence levels to help prioritize high-certainty hazards.
*   **Risk Analysis**: Predictive algorithm to identify high-risk zones based on reported frequency and infrastructure age.

### 📱 Citizen Mobile App
*   **Easy Reporting**: Simple interface to capture photos and report electrical faults.
*   **Real-time Tracking**: Track the status of reported issues from "Received" to "In Progress" to "Resolved".
*   **Offline Support**: Fundamental features work even with spotty connectivity.
*   **Multi-language Support**: Interface available in multiple languages (English/Hindi) to serve a diverse user base.

### 💻 Admin Web Portal
*   **Centralized Dashboard**: Kanban-style view of all incoming, active, and resolved issues.
*   **Issue Management**: Admin tools to verify AI predictions, re-assign tickets, and update priorities.
*   **Lineman Management**: interface to manage field staff and view their active tasks.
*   **Geo-Visualization**: Map view of issues to identify clusters and dispatch teams efficiently.

### 🛠️ Lineman/Technician Workflow
*   **Task Assignment**: Instant notification of new assigned repair jobs.
*   **Navigation**: Integration with maps to reach the fault location.
*   **Proof of Work**: Feature to upload "After" photos to verify the fix before closing the ticket.
*   **History**: Log of all completed repairs for performance tracking.

### ⚙️ Backend & Infrastructure
*   **Local-First Architecture**: Fully functional local backend using Node.js, Express, and SQLite.
*   **RESTful API**: Robust API endpoints for authentication, file uploads, and data retrieval (mimicking Supabase/PostgREST standards).
*   **Secure Authentication**: JWT-based secure login for all user roles.
*   **Real-time Notifications**: Socket-based updates to refreshing dashboards instantly (simulated/ready for integration).

## 🏗️ Tech Stack
*   **AI/ML**: Python, Ultralytics YOLOv8, OpenCV
*   **Backend**: Node.js, Express.js, SQLite3
*   **Frontend (Web)**: React, TailwindCSS, Shadcn/UI
*   **Mobile**: React Native / Expo
*   **DevOps**: Docker ready, Local deployment scripts

## 📸 Usage Flow
1.  **Report**: Citizen records an issue via the app.
2.  **Analyze**: Backend runs the image through the AI model.
3.  **Assign**: Admin/System assigns it to the nearest Lineman.
4.  **Resolve**: Lineman fixes it and uploads proof.
5.  **Verify**: Admin closes the ticket; Citizen is notified.
