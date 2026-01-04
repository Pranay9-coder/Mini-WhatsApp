# 💬 Mini WhatsApp – MERN Real-Time Chat

Production-ready real-time chat app built with **MongoDB, Express, React, Node.js, and Socket.IO**. Includes JWT auth, REST APIs, real-time messaging, typing indicators, and a clean React UI.

## Features
- JWT auth (register/login), hashed passwords (bcrypt)
- CRUD chat API with validation (1–50 chars)
- Real-time messaging + typing/online presence via Socket.IO
- Client-side: protected routes, Context API state, Axios with auth interceptor
- Deployment-ready config (dotenv, CORS, Atlas-friendly)

## Project Structure
```
mini-whatsapp/
├── backend/
│   ├── config/db.js
│   ├── controllers/{authController,chatController}.js
│   ├── middleware/{authMiddleware,errorMiddleware}.js
│   ├── models/{User,Chat}.js
│   ├── routes/{authRoutes,chatRoutes}.js
│   ├── sockets/chatSocket.js
│   ├── app.js
│   └── server.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── components/{ChatBubble,ChatInput,Navbar}.jsx
        ├── pages/{Login,Register,ChatList,ChatRoom}.jsx
        ├── context/{AuthContext,ChatContext}.jsx
        ├── services/{authService,chatService,tokenUtil}.js
        ├── hooks/useSocket.js
        ├── utils/time.js
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

## Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev # or npm start
```
Configure `.env`:
```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/miniwhatsapp
JWT_SECRET=change_me
```

> Version control note: `.env` is ignored by git (see .gitignore). Copy from `.env.example` locally and do not commit secrets. `node_modules` is also ignored; reinstall dependencies with `npm install` after cloning.

## Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Set API URLs in `.env` if backend host differs.

## Run
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## API Summary
- POST /api/auth/register
- POST /api/auth/login
- GET /api/chats (auth)
- POST /api/chats (auth)
- PUT /api/chats/:id (auth, sender only)
- DELETE /api/chats/:id (auth, sender only)

## Socket Events
- Client → Server: sendMessage, typing, stopTyping
- Server → Client: newMessage, typing, stopTyping, onlineUsers

## Notes
- Messages trimmed and capped at 50 chars.
- Chat access limited to messages where you are sender or recipient.
- Socket auth uses JWT via `auth.token` in the client connection.

## Production Checklist
- Use MongoDB Atlas connection string
- Strong `JWT_SECRET`
- HTTPS + secure cookie/localStorage policies per environment
- Set CORS origins to allowed domains
- Scale Socket.IO with sticky sessions / adapter (e.g., Redis) when clustering

MIT License
