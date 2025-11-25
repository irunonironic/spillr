# Spillr  
[🔗 https://www.spillr.live/](https://www.spillr.live/)

Spillr is a full-stack web application that allows users to create public “walls” to receive anonymous feedback. Visitors can send messages anonymously, and wall owners can view and reply through a secure dashboard.

---

## Features

### User Features
- Create and manage profile (name, username, bio)
- Upload a profile picture (stored on Cloudinary)
- Receive anonymous messages via a public wall
- View, reply to, and manage messages from a private dashboard
- Track message statistics (answered, pending, total)
- Enable or disable email notifications
- Permanently delete account and data

### Feedback System
- Anyone can send anonymous messages
- Messages only appear publicly after being answered
- Real-time refresh and feedback management


### Technical Features
- RESTful API with Express and MongoDB
- Secure JWT authentication
- Image uploads with Cloudinary
- Rate limiting to prevent spam
- Modular React hooks and state management

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Lucide React icons
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary SDK
- Express Rate Limit

---

