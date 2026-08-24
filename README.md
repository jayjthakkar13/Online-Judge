# 💻 Modern Online Judge Platform
🚀 **Live Project:** [modernonlinejudge.me](https://modernonlinejudge.me)

An end-to-end, full-stack **Online Judge System** built using the **MEAN stack** (MongoDB, Express.js, Angular, Node.js). This platform allows users to browse problem sets, get AI-powered coding assistance, submit solutions in isolated Docker environments, view submission history, and manage problems via an Admin dashboard.

---

## 🚀 Features

### 👤 User Features
* **Authentication & Authorization**: Secure user signup, login, and JWT-based session management.
* **Problemset Dashboard**: Browse, filter, and solve programming problems.
* **🤖 AI Assistance**: Integrated AI helper to analyze code complexity and assist in debugging.
* **🐳 Docker-Based Code Execution**: Submissions are executed in isolated Docker containers, preventing untrusted code from compromising the host server while ensuring strict resource limits (CPU/Memory).
* **Submission History**: Track past submissions, execution metrics, and status history.

### 🛡️ Admin Features
* **Problem Management (CRUD)**: Create, view, edit, and delete coding problems.
* **Test Case & Constraint Configuration**: Configure input/output test cases, memory limits, and time limits.
* **Role-Based Access Control**: Dedicated routes and views strictly restricted to administrator accounts.

---

## 🛠️ Tech Stack

* **Frontend**: Angular (Standalone Components, Signals, Reactive Forms, Router Guards)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Cloud & Deployment**: AWS EC2 and Vercel
* **Containerization / Sandbox**: Docker & Docker Engine API
* **AI Integration**: Gemini 2.5 Flash API
* **Authentication**: JSON Web Tokens (JWT) & bcrypt.js

---

## ☁️ Deployment Architecture

* **Frontend**: Hosted on **Vercel** for fast, reliable global delivery.
* **Backend**: Node.js/Express.js backend runs inside a **Docker container hosted on an AWS EC2 instance**.
* **Code Execution**: User submissions are safely executed in isolated ephemeral Docker containers on the EC2 instance with strict resource constraints.
* **Database**: MongoDB Atlas / cloud-hosted MongoDB used for persistent data storage.